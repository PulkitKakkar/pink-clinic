import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DraftAutosave } from "@/lib/admin/draft-autosave";

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());
function setup(enabled = true) {
  const controller = new DraftAutosave();
  const save = vi.fn().mockResolvedValue("saved");
  const onState = vi.fn();
  controller.configure({ enabled, save, onState });
  return { controller, save, onState };
}
describe("draft autosave scheduling and recovery", () => {
  it("does not create untouched drafts and debounces changes", async () => {
    const { controller, save, onState } = setup();
    await vi.advanceTimersByTimeAsync(20000); expect(save).not.toHaveBeenCalled();
    controller.markDirty(); await vi.advanceTimersByTimeAsync(1500);
    controller.markDirty(); await vi.advanceTimersByTimeAsync(1999); expect(save).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1); expect(save).toHaveBeenCalledOnce();
    expect(onState).toHaveBeenLastCalledWith("saved"); expect(controller.hasUnsavedChanges()).toBe(false);
  });
  it("saves during continuous typing after at most fifteen seconds", async () => {
    const { controller, save } = setup();
    for (let i = 0; i < 15; i++) { controller.markDirty(); await vi.advanceTimersByTimeAsync(1000); }
    expect(save).toHaveBeenCalledOnce();
  });
  it("keeps edits made during a slow save dirty and serialises the next write", async () => {
    const { controller, save } = setup();
    let resolve!: (value: string) => void;
    save.mockImplementationOnce(() => new Promise((done) => { resolve = done; }));
    controller.markDirty(); await vi.advanceTimersByTimeAsync(2000);
    controller.markDirty(); await vi.advanceTimersByTimeAsync(20000); expect(save).toHaveBeenCalledOnce();
    resolve("saved"); await vi.advanceTimersByTimeAsync(0); expect(controller.hasUnsavedChanges()).toBe(true);
    await vi.advanceTimersByTimeAsync(2000); expect(save).toHaveBeenCalledTimes(2);
    expect(controller.hasUnsavedChanges()).toBe(false);
  });
  it("waits for autosave before manual submission and cancels pending background writes", async () => {
    const { controller, save } = setup();
    let resolve!: (value: string) => void;
    save.mockImplementationOnce(() => new Promise((done) => { resolve = done; }));
    controller.markDirty(); await vi.advanceTimersByTimeAsync(2000);
    const ready = vi.fn(); const preparation = controller.prepareManualSave().then((version) => { ready(); return version; });
    await vi.advanceTimersByTimeAsync(5000); expect(ready).not.toHaveBeenCalled();
    resolve("saved"); const version = await preparation;
    expect(ready).toHaveBeenCalledOnce(); controller.finishManualSave(true, version);
    await vi.advanceTimersByTimeAsync(20000); expect(save).toHaveBeenCalledOnce();
  });
  it.each(["expired", "error", "invalid"])("retains unsaved changes on %s and resumes on returning online or to the tab", async (failure) => {
    const { controller, save } = setup(); save.mockResolvedValueOnce(failure);
    controller.markDirty(); await vi.advanceTimersByTimeAsync(2000);
    expect(controller.hasUnsavedChanges()).toBe(true);
    controller.markDirty(); await vi.advanceTimersByTimeAsync(20000); expect(save).toHaveBeenCalledOnce();
    controller.retry(); await vi.advanceTimersByTimeAsync(2000); expect(save).toHaveBeenCalledTimes(2);
    expect(controller.hasUnsavedChanges()).toBe(false);
  });
  it("does not retry a record finalised in another tab", async () => {
    const { controller, save } = setup(); save.mockResolvedValueOnce("conflict");
    controller.markDirty(); await vi.advanceTimersByTimeAsync(2000);
    controller.retry(); controller.markDirty(); await vi.advanceTimersByTimeAsync(20000);
    expect(save).toHaveBeenCalledOnce();
  });
  it("never autosaves finalised records but still tracks unsaved manual edits", async () => {
    const { controller, save } = setup(false);
    controller.markDirty(); await vi.advanceTimersByTimeAsync(20000);
    expect(save).not.toHaveBeenCalled(); expect(controller.hasUnsavedChanges()).toBe(true);
  });
  it("cancels timers on unmount", async () => {
    const { controller, save } = setup(); controller.markDirty(); controller.dispose();
    await vi.advanceTimersByTimeAsync(20000); expect(save).not.toHaveBeenCalled();
  });
});
