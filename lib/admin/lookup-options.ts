import "server-only";

import { getBranchCatalog } from "@/lib/catalog";
import { branches } from "@/lib/branches";

export async function getAdminTreatmentNames() {
  const catalogues = await Promise.all(
    branches.map((branch) => getBranchCatalog(branch.slug)),
  );
  return [
    ...new Set(
      catalogues
        .flat()
        .filter((item) => item.kind === "service")
        .map((item) => item.title),
    ),
  ].sort((a, b) => a.localeCompare(b));
}
