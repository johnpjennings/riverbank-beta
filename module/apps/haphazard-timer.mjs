const STORAGE_KEY = 'riverbank.haphazardTimer.durationMs';
const SETTINGS_STORAGE_KEY = 'riverbank.haphazardTimer.settings';
const DEFAULT_DURATION_MS = 30 * 60 * 1000;
const MINIMUM_TIMER_ROLE = CONST.USER_ROLES.ASSISTANT;
export class RiverbankHaphazardTimer extends Application {
  #durationMs = DEFAULT_DURATION_MS;
  #remainingMs = DEFAULT_DURATION_MS;
  #intervalId = null;
  #running = false;
  #endAt = null;
  #playChimeForGM = true;
  #playChimeForPlayers = false;
  #hasChimed = false;

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: 'riverbank-haphazard-timer',
      classes: ['riverbank', 'haphazard-timer'],
      template: 'systems/riverbank/templates/apps/haphazard-timer.hbs',
      title: 'Haphazard Timer',
      width: 225,
      height: 'auto',
      top: 70,
      left: 40,
      resizable: false,
      popOut: true,
      minimizable: true,
    });
  }

  get title() {
    return this._minimized
      ? `Haphazard Timer ${formatDuration(this.#remainingMs)}`
      : 'Haphazard Timer';
  }

  constructor(options = {}) {
    super(options);
    const storedMs = Number(window.localStorage.getItem(STORAGE_KEY));
    const initial = Number.isFinite(storedMs) && storedMs > 0 ? storedMs : DEFAULT_DURATION_MS;
    this.#durationMs = initial;
    this.#remainingMs = initial;
    const settings = foundry.utils.mergeObject(
      { playChimeForGM: true, playChimeForPlayers: false },
      readStoredTimerSettings()
    );
    this.#playChimeForGM = settings.playChimeForGM;
    this.#playChimeForPlayers = settings.playChimeForPlayers;
  }

  async _render(force = false, options = {}) {
    await this.#loadSharedState();
    return super._render(force, options);
  }

  async getData() {
    const totalSeconds = Math.max(Math.ceil(this.#remainingMs / 1000), 0);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return {
      hours,
      minutes,
      seconds,
      display: formatDuration(this.#remainingMs),
      isRunning: this.#running,
      isExpired: this.#remainingMs <= 0,
      playChimeForGM: this.#playChimeForGM,
      playChimeForPlayers: this.#playChimeForPlayers,
    };
  }

  _getHeaderButtons() {
    return super._getHeaderButtons().filter((button) => !['close', 'minimize'].includes(button.class));
  }

  activateListeners(html) {
    super.activateListeners(html);
    html.on('click', '[data-action="start-pause"]', (event) => this.#onStartPause(event));
    html.on('click', '[data-action="reset"]', (event) => this.#onReset(event));
    html.on('click', '[data-action="draw-haphazard-card"]', (event) => this.#onDrawHaphazardCard(event));
    html.on('input', '[name="displayTime"]', (event) => this.#onDisplayTimeInput(event));
    html.on('change', '[name="displayTime"]', (event) => this.#onDisplayTimeChange(event));
    html.on('blur', '[name="displayTime"]', (event) => this.#onDisplayTimeChange(event));
    html.on('change', '[name="playChimeForGM"]', (event) => this.#onToggleChime(event));
    html.on('change', '[name="playChimeForPlayers"]', (event) => this.#onToggleChime(event));
  }

  async close(options = {}) {
    if (options?.force) return super.close(options);
    if (this.rendered && !this._minimized) return this.minimize();
    return this;
  }

  async minimize() {
    const result = await super.minimize();
    this.#refreshDisplay();
    return result;
  }

  async maximize() {
    const result = await super.maximize();
    this.#refreshDisplay();
    return result;
  }

  applySharedState(rawState) {
    const state = parseSharedState(rawState);
    this.#durationMs = state.durationMs > 0 ? state.durationMs : this.#durationMs;
    this.#running = Boolean(state.running);
    this.#endAt = Number.isFinite(state.endAt) ? state.endAt : null;
    this.#remainingMs = this.#running && this.#endAt
      ? Math.max(this.#endAt - Date.now(), 0)
      : (state.remainingMs > 0 ? state.remainingMs : this.#durationMs);

    if (this.#running && this.#remainingMs > 0) this.#startInterval();
    else {
      this.#running = false;
      this.#endAt = null;
      this.#stopInterval();
    }

    this.#refreshDisplay();
  }

  async #onStartPause(event) {
    event.preventDefault();
    if (this.#running) {
      this.#tick();
      this.#running = false;
      this.#endAt = null;
      this.#stopInterval();
      game.riverbank?.setHaphazardTimerAlarm?.({ active: false });
      await this.#persistState();
      this.#refreshDisplay();
      return;
    }

    const html = this.element;
    const durationMs = parseDurationInput(html.find('[name="displayTime"]').val());

    this.#durationMs = durationMs > 0 ? durationMs : DEFAULT_DURATION_MS;
    this.#remainingMs = this.#durationMs;
    this.#hasChimed = false;
    this.#persistDuration();
    game.riverbank?.setHaphazardTimerAlarm?.({ active: false });
    this.#running = true;
    this.#endAt = Date.now() + this.#remainingMs;
    this.#startInterval();
    await this.#persistState();
    this.#refreshDisplay();
  }

  async #onReset(event) {
    event.preventDefault();
    this.#running = false;
    this.#endAt = null;
    this.#stopInterval();
    this.#remainingMs = this.#durationMs;
    this.#hasChimed = false;
    game.riverbank?.setHaphazardTimerAlarm?.({ active: false });
    await this.#persistState();
    this.#refreshDisplay();
  }

  async #onDrawHaphazardCard(event) {
    event.preventDefault();
    return game.riverbank?.drawHaphazardryCard?.();
  }

  async #onDisplayTimeInput(event) {
    if (this.#running) return;
    const input = event.currentTarget;
    const formatted = formatDurationFromDigits(input.value);
    input.value = formatted;
  }

  async #onDisplayTimeChange(event) {
    if (this.#running) return;
    const input = this.element.find('[name="displayTime"]');
    const formatted = formatDurationFromDigits(input.val());
    input.val(formatted);
    const parsed = parseDurationInput(formatted);
    this.#durationMs = parsed > 0 ? parsed : DEFAULT_DURATION_MS;
    this.#remainingMs = this.#durationMs;
    this.#persistDuration();
    await this.#persistState();
    this.#refreshDisplay();
  }

  async #onToggleChime(event) {
    const target = event.currentTarget;
    if (!target?.name) return;
    this.#playChimeForGM = Boolean(this.element.find('[name="playChimeForGM"]').prop('checked'));
    this.#playChimeForPlayers = Boolean(this.element.find('[name="playChimeForPlayers"]').prop('checked'));
    this.#persistSettings();
  }

  #startInterval() {
    this.#stopInterval();
    this.#intervalId = window.setInterval(() => this.#tick(), 250);
  }

  #stopInterval() {
    if (this.#intervalId) {
      window.clearInterval(this.#intervalId);
      this.#intervalId = null;
    }
  }

  #tick() {
    if (!this.#running || !this.#endAt) return;
    this.#remainingMs = Math.max(this.#endAt - Date.now(), 0);
    if (this.#remainingMs <= 0) {
      this.#running = false;
      this.#endAt = null;
      this.#stopInterval();
      this.#persistState();
      if (!this.#hasChimed) {
        this.#hasChimed = true;
        if (this._minimized) this.maximize();
        this.#playExpiryChime();
      }
    }

    this.#refreshDisplay();
  }

  #refreshDisplay() {
    const html = this.element;
    if (!html?.length) return;

    html.find('[data-haphazard-display]').val(formatDuration(this.#remainingMs)).toggleClass('is-expired', this.#remainingMs <= 0);
    const actionIcon = html.find('[data-action="start-pause"] i');
    actionIcon.removeClass('fa-play fa-pause').addClass(this.#running ? 'fa-pause' : 'fa-play');
    html.find('[data-action="start-pause"]').attr('aria-label', this.#running ? 'Pause' : 'Start').attr('title', this.#running ? 'Pause' : 'Start');
    html.find('[name="displayTime"]').prop('disabled', this.#running);
    const app = html.closest('.app');
    const totalSeconds = Math.max(Math.ceil(this.#remainingMs / 1000), 0);
    app.toggleClass('timer-warning', totalSeconds <= 60 && totalSeconds > 10);
    app.toggleClass('timer-critical', totalSeconds <= 10 && totalSeconds > 0);
    this.#refreshTitle();
  }

  #persistDuration() {
    window.localStorage.setItem(STORAGE_KEY, String(this.#durationMs));
  }

  #persistSettings() {
    window.localStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify({
        playChimeForGM: this.#playChimeForGM,
        playChimeForPlayers: this.#playChimeForPlayers,
      })
    );
  }

  async #persistState() {
    await game.riverbank?.syncHaphazardTimerState?.({
      durationMs: this.#durationMs,
      remainingMs: this.#remainingMs,
      running: this.#running,
      endAt: this.#endAt,
    });
  }

  #playExpiryChime() {
    game.riverbank?.setHaphazardTimerAlarm?.({
      active: true,
      gm: this.#playChimeForGM,
      players: this.#playChimeForPlayers,
    });
  }

  #refreshTitle() {
    const titleEl = this.element.find('.window-title');
    if (!titleEl.length) return;

    if (this._minimized) {
      const display = formatDuration(this.#remainingMs);
      this.options.title = `Haphazard Timer ${display}`;
      titleEl.html(
        `<span class="rb-haphazard-title-label">Haphazard Timer</span><span class="rb-haphazard-title-time">${display}</span>`
      );
      return;
    }

    this.options.title = 'Haphazard Timer';
    titleEl.text('Haphazard Timer');
  }

  async #loadSharedState() {
    const raw = game.riverbank?.getSharedHaphazardTimerState?.();
    this.applySharedState(raw);
  }
}

export function canUseHaphazardTimer(user = game.user) {
  return (user?.role ?? 0) >= MINIMUM_TIMER_ROLE;
}

function readStoredTimerSettings() {
  try {
    const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function parseSharedState(raw) {
  try {
    return typeof raw === 'string' ? JSON.parse(raw || '{}') : (raw ?? {});
  } catch {
    return {};
  }
}

function formatDuration(durationMs) {
  const totalSeconds = Math.max(Math.ceil(durationMs / 1000), 0);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map((value) => String(value).padStart(2, '0')).join(':');
}

function parseDurationInput(value) {
  const digits = String(value ?? '').replace(/\D/g, '').slice(-6);
  if (!digits) return 0;
  const padded = digits.padStart(6, '0');
  const hours = Number(padded.slice(0, 2));
  const minutes = Number(padded.slice(2, 4));
  const seconds = Number(padded.slice(4, 6));
  return Math.round((((hours * 60) + minutes) * 60 + seconds) * 1000);
}

function formatDurationFromDigits(value) {
  const digits = String(value ?? '').replace(/\D/g, '').slice(-6).padStart(6, '0');
  return `${digits.slice(0, 2)}:${digits.slice(2, 4)}:${digits.slice(4, 6)}`;
}
