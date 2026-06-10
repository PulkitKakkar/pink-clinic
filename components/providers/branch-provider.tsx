"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getBranchById, type Branch } from "@/lib/branches";

const STORAGE_KEY = "pink-beauty-selected-branch";

type BranchContextValue = {
  selectedBranch: Branch | null;
  setSelectedBranch: (branch: Branch | null) => void;
};

const BranchContext = createContext<BranchContextValue | undefined>(undefined);

export function BranchProvider({ children }: { children: React.ReactNode }) {
  const [selectedBranch, setSelectedBranchState] = useState<Branch | null>(null);

  useEffect(() => {
    const storedBranchId = window.localStorage.getItem(STORAGE_KEY);
    // Local storage is an external source; restore it once after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (storedBranchId) setSelectedBranchState(getBranchById(storedBranchId) ?? null);
  }, []);

  const setSelectedBranch = useCallback((branch: Branch | null) => {
    setSelectedBranchState(branch);
    if (branch) window.localStorage.setItem(STORAGE_KEY, branch.id);
    else window.localStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = useMemo(() => ({ selectedBranch, setSelectedBranch }), [selectedBranch, setSelectedBranch]);
  return <BranchContext.Provider value={value}>{children}</BranchContext.Provider>;
}

export function useBranch() {
  const context = useContext(BranchContext);
  if (!context) throw new Error("useBranch must be used within BranchProvider");
  return context;
}
