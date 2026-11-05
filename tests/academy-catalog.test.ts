import { afterEach, describe, expect, it, vi } from "vitest";
import { getBranchCatalog } from "@/lib/catalog";
import { resolveCheckoutItems } from "@/lib/payments/catalog-checkout";

const { fetchMock } = vi.hoisted(() => ({ fetchMock: vi.fn() }));
vi.mock("@/lib/sanity/client", () => ({ sanityClient: { fetch: fetchMock } }));
afterEach(() => { vi.unstubAllEnvs(); vi.resetAllMocks(); });

describe("Academy branch availability", () => {
  it("offers courses only at Watlington, including when the CMS is unavailable", async () => {
    vi.stubEnv("NEXT_PUBLIC_SANITY_PROJECT_ID", "replace-me");
    const west = await getBranchCatalog("reading-west-st");
    const watlington = await getBranchCatalog("reading-watlington-st");
    expect(west.some((item) => item.kind === "course")).toBe(false);
    expect(west.some((item) => item.kind === "service")).toBe(true);
    const courses = watlington.filter((item) => item.kind === "course");
    expect(courses).toHaveLength(15);
    expect(courses.filter((item) => item.tags.includes("VTCT Courses"))).toHaveLength(6);
    expect(courses.filter((item) => item.tags.includes("ABT Courses"))).toHaveLength(9);
    expect(courses.every((item) => !item.tags.includes("Facials") && !item.tags.includes("Other Courses"))).toBe(true);
    expect(() => resolveCheckoutItems([{ handle: courses[0].handle, variantName: courses[0].variants[0].name, quantity: 1 }], west)).toThrow();
  });

  it("does not re-enable West Street courses through CMS overrides or CMS-only entries", async () => {
    vi.stubEnv("NEXT_PUBLIC_SANITY_PROJECT_ID", "test-project");
    fetchMock.mockResolvedValue([
      { handle: "facial-and-skincare-course", title: "Facial training", kind: "course", branchPrice: 199, active: true },
      { handle: "new-course", title: "New course", kind: "course", branchPrice: 500, active: true },
    ]);
    expect((await getBranchCatalog("reading-west-st")).some((item) => item.kind === "course")).toBe(false);
    const courses = (await getBranchCatalog("reading-watlington-st")).filter((item) => item.kind === "course");
    expect(courses.find((item) => item.handle === "new-course")?.tags).toEqual(["ABT Courses", "Academy"]);
  });
});
