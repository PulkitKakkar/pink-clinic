import {
  BasketIcon,
  BlockContentIcon,
  BulbOutlineIcon,
  CalendarIcon,
  ControlsIcon,
  DocumentsIcon,
  HomeIcon,
  PinIcon,
  StarIcon,
  TagIcon,
  UsersIcon,
} from "@sanity/icons";
import type { StructureResolver } from "sanity/structure";

const westStreetId = "branch-reading-west-st";
const watlingtonStreetId = "branch-reading-watlington-st";

export const structure: StructureResolver = (S) => {
  const catalogueList = (title: string, filter: string, params?: Record<string, string>) =>
    S.documentList()
      .title(title)
      .schemaType("catalogItem")
      .filter(filter)
      .params(params || {})
      .defaultOrdering([{ field: "title", direction: "asc" }]);

  const excludedTypes = new Set([
    "catalogItem", "catalogCollection", "branch", "offer", "testimonial",
    "teamMember", "galleryItem", "blogPost",
  ]);

  return S.list().title("Pink Beauty — Website Manager").items([
    S.listItem().title("Catalogue & branch prices").icon(BasketIcon).child(
      S.list().title("Catalogue & branch prices").items([
        S.listItem().title("All catalogue items").icon(DocumentsIcon)
          .child(catalogueList("All catalogue items", `_type == "catalogItem"`)),
        S.listItem().title("West Street catalogue").icon(PinIcon)
          .child(catalogueList("West Street catalogue", `_type == "catalogItem" && references($branchId)`, { branchId: westStreetId })),
        S.listItem().title("Watlington Street catalogue").icon(PinIcon)
          .child(catalogueList("Watlington Street catalogue", `_type == "catalogItem" && references($branchId)`, { branchId: watlingtonStreetId })),
        S.listItem().title("Offers & reduced prices").icon(TagIcon)
          .child(catalogueList("Offers & reduced prices", `_type == "catalogItem" && (count(branches[].variants[compareAtPrice > price]) > 0 || count(branches[compareAtPrice > price]) > 0)`)),
        S.divider(),
        S.listItem().title("Treatments & services")
          .child(catalogueList("Treatments & services", `_type == "catalogItem" && kind == "service"`)),
        S.listItem().title("Products")
          .child(catalogueList("Products", `_type == "catalogItem" && kind == "product"`)),
        S.listItem().title("Academy courses")
          .child(catalogueList("Academy courses", `_type == "catalogItem" && kind == "course"`)),
      ]),
    ),
    S.documentTypeListItem("catalogCollection").title("Catalogue collections").icon(BlockContentIcon),
    S.documentTypeListItem("branch").title("Branch contact details").icon(PinIcon),
    S.divider(),
    S.listItem().title("Homepage & marketing").icon(HomeIcon).child(
      S.list().title("Homepage & marketing").items([
        S.documentTypeListItem("offer").title("Homepage offers").icon(TagIcon),
        S.documentTypeListItem("testimonial").title("Customer reviews").icon(StarIcon),
        S.documentTypeListItem("teamMember").title("Team members").icon(UsersIcon),
        S.documentTypeListItem("galleryItem").title("Before & after gallery").icon(BulbOutlineIcon),
        S.documentTypeListItem("blogPost").title("News & articles").icon(BlockContentIcon),
      ]),
    ),
    S.listItem().title("Advanced website content").icon(ControlsIcon).child(
      S.list().title("Advanced website content").items(
        S.documentTypeListItems()
          .filter((item) => !excludedTypes.has(item.getId() || ""))
          .map((item) => item.icon(item.getId() === "course" ? CalendarIcon : ControlsIcon)),
      ),
    ),
  ]);
};
