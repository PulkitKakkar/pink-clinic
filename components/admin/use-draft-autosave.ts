"use client";
import { useCallback, useEffect, useState } from "react";
import { DraftAutosave, type AutosaveResult, type AutosaveState } from "@/lib/admin/draft-autosave";

export function useDraftAutosave(enabled: boolean, save: () => Promise<AutosaveResult>) {
  const [controller] = useState(() => new DraftAutosave());
  const [state, setState] = useState<AutosaveState>("idle");
  useEffect(() => { controller.configure({ enabled, save, onState: setState }); }, [controller, enabled, save]);
  useEffect(() => {
    const retry = () => controller.retry();
    const visible = () => { if (document.visibilityState === "visible") controller.retry(); };
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (controller.hasUnsavedChanges()) { event.preventDefault(); event.returnValue = ""; }
    };
    window.addEventListener("focus", retry);
    document.addEventListener("visibilitychange", visible);
    window.addEventListener("online", retry);
    window.addEventListener("beforeunload", beforeUnload);
    return () => {
      controller.dispose();
      window.removeEventListener("focus", retry);
      document.removeEventListener("visibilitychange", visible);
      window.removeEventListener("online", retry);
      window.removeEventListener("beforeunload", beforeUnload);
    };
  }, [controller]);
  const markDirty = useCallback(() => controller.markDirty(), [controller]);
  return { state, markDirty, controller };
}
