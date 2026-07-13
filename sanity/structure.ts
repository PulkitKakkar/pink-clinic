import type { StructureResolver } from "sanity/structure";

export const structure: StructureResolver = (S) => {
  const primaryTypes = new Set(["catalogItem", "catalogCollection", "branch"]);
  return S.list().title("Pink Beauty Content").items([
    S.documentTypeListItem("catalogItem").title("Products & Services"),
    S.documentTypeListItem("catalogCollection").title("Collections"),
    S.documentTypeListItem("branch").title("Branches"),
    S.divider(),
    S.listItem().title("Other website content").child(
      S.list().title("Other website content").items(
        S.documentTypeListItems().filter((item) => !primaryTypes.has(item.getId() || "")),
      ),
    ),
  ]);
};
