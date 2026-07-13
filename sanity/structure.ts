import type { StructureResolver } from "sanity/structure";

export const structure: StructureResolver = (S) => {
  const catalogueTypes = new Set(["catalogItem", "catalogCollection"]);
  return S.list().title("Pink Beauty Content").items([
    S.listItem().title("Catalogue").child(
      S.list().title("Catalogue").items([
        S.documentTypeListItem("catalogItem").title("Products & Services"),
        S.documentTypeListItem("catalogCollection").title("Collections"),
      ]),
    ),
    S.divider(),
    ...S.documentTypeListItems().filter((item) => !catalogueTypes.has(item.getId() || "")),
  ]);
};
