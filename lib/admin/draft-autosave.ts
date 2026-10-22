export type AutosaveResult = "saved" | "expired" | "conflict" | "invalid" | "error";
export type AutosaveState = "idle" | "unsaved" | "saving" | AutosaveResult;

type Options = {
  enabled: boolean;
  save: () => Promise<AutosaveResult>;
  onState: (state: AutosaveState) => void;
};

/** Serialises background writes and lets an explicit save wait for the current write. */
export class DraftAutosave {
  private options?: Options;
  private version = 0;
  private savedVersion = 0;
  private debounce?: ReturnType<typeof setTimeout>;
  private deadline?: ReturnType<typeof setTimeout>;
  private pending?: Promise<void>;
  private manual = false;
  private paused = false;
  private blocked = false;
  private disposed = false;

  configure(options: Options) {
    this.options = options;
    this.disposed = false;
    if (!options.enabled) this.clearTimers();
  }
  private clearTimers() {
    clearTimeout(this.debounce);
    clearTimeout(this.deadline);
    this.debounce = this.deadline = undefined;
  }
  private notify(state: AutosaveState) {
    if (!this.disposed) this.options?.onState(state);
  }
  hasUnsavedChanges() { return this.version > this.savedVersion || Boolean(this.pending) || this.manual; }
  markDirty() {
    this.version++;
    if (!this.paused) this.notify("unsaved");
    this.schedule();
  }
  private schedule() {
    if (!this.options?.enabled || this.paused || this.manual || this.disposed) return;
    clearTimeout(this.debounce);
    this.debounce = setTimeout(() => { void this.run(); }, 2000);
    this.deadline ??= setTimeout(() => { void this.run(); }, 15000);
  }
  async run() {
    if (this.pending) { this.clearTimers(); return; }
    if (!this.options?.enabled || this.manual || this.pending || this.paused || this.disposed || this.version === this.savedVersion) return;
    this.clearTimers();
    const version = this.version;
    const save = this.options.save;
    this.notify("saving");
    this.pending = (async () => {
      let result: AutosaveResult;
      try { result = await save(); } catch { result = "error"; }
      if (result === "saved") this.savedVersion = version;
      else { this.paused = true; this.blocked = result === "conflict"; }
      this.notify(result === "saved" && this.version > version ? "unsaved" : result);
    })();
    await this.pending;
    this.pending = undefined;
    if (this.version > this.savedVersion) this.schedule();
  }
  retry() {
    if (!this.hasUnsavedChanges() || this.disposed || this.blocked) return;
    this.paused = false;
    this.schedule();
  }
  async prepareManualSave() {
    const version = this.version;
    this.manual = true;
    this.clearTimers();
    await this.pending;
    return version;
  }
  finishManualSave(saved: boolean, version: number) {
    this.manual = false;
    if (saved) {
      this.savedVersion = version;
      this.paused = false;
      this.blocked = false;
      this.notify(this.version > version ? "unsaved" : "saved");
      if (this.version > version) this.schedule();
    }
  }
  dispose() { this.disposed = true; this.clearTimers(); }
}
