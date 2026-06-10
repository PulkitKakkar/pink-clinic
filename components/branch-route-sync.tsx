"use client";

import { useEffect } from "react";
import { useBranch } from "@/components/providers/branch-provider";
import type { Branch } from "@/lib/branches";

export function BranchRouteSync({ branch }: { branch: Branch }) {
  const { selectedBranch, setSelectedBranch } = useBranch();

  useEffect(() => {
    if (selectedBranch?.id !== branch.id) setSelectedBranch(branch);
  }, [branch, selectedBranch?.id, setSelectedBranch]);

  return null;
}
