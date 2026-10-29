import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
vi.mock("next/server", () => ({ connection: vi.fn() }));
vi.mock("@/lib/runtime-secrets", () => ({ loadRuntimeSecrets: vi.fn() }));

beforeEach(() => {
  vi.resetModules();
  vi.stubEnv("GOOGLE_BUSINESS_CLIENT_ID", "client");
  vi.stubEnv("GOOGLE_BUSINESS_CLIENT_SECRET", "secret");
  vi.stubEnv("GOOGLE_BUSINESS_REFRESH_TOKEN", "refresh");
  vi.stubEnv("GOOGLE_BUSINESS_WEST_STREET_LOCATION", "accounts/1/locations/2");
  vi.stubEnv("GOOGLE_BUSINESS_WATLINGTON_STREET_LOCATION", "accounts/1/locations/3");
});
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); vi.useRealTimers(); vi.clearAllMocks(); });
const reply = (data: unknown) => ({ ok: true, json: async () => data });
const page = { averageRating: 4.7, totalReviewCount: 100, reviews: [
  { reviewId: "good", starRating: "FIVE", comment: "Original words", reviewer: { displayName: "Client" } },
  { reviewId: "low", starRating: "THREE", comment: "Low rating" },
  { reviewId: "empty", starRating: "FIVE" },
] };
function mockFetch() {
  const fetcher = vi.fn(async (url: string) => url.includes("oauth2") ? reply({ access_token: "bearer", expires_in: 3600 }) : reply(page));
  vi.stubGlobal("fetch", fetcher);
  return fetcher;
}

describe("automatic Business Profile reviews", () => {
  it("refreshes OAuth once, selects written 4+ reviews from both branches, preserves text and uses real branch totals", async () => {
    const fetcher = mockFetch();
    const { getBusinessProfileReviews } = await import("@/lib/google-business-reviews");
    const result = await getBusinessProfileReviews();
    expect(result.connected).toBe(true);
    expect(result.reviews).toHaveLength(2);
    expect(result.reviews[0].text).toBe("Original words");
    expect(result.reviews[0].branchName).not.toBe(result.reviews[1].branchName);
    expect(result.reviews[0].authorUrl).toBeUndefined();
    expect(result.sources[0]).toMatchObject({ rating: 4.7, reviewCount: 100 });
    expect(fetcher).toHaveBeenCalledTimes(3);
    expect(fetcher).toHaveBeenCalledWith(expect.stringContaining("/reviews?pageSize=50"), expect.objectContaining({ cache: "no-store", headers: { Authorization: "Bearer bearer" } }));
    expect(fetcher).toHaveBeenCalledWith("https://oauth2.googleapis.com/token", expect.objectContaining({ method: "POST", cache: "no-store", body: expect.any(URLSearchParams) }));
    await getBusinessProfileReviews();
    expect(fetcher).toHaveBeenCalledTimes(3);
  });
  it("does not serve removed reviews from an expired cache after an API failure", async () => {
    vi.useFakeTimers();
    const fetcher = mockFetch();
    const { getBusinessProfileReviews } = await import("@/lib/google-business-reviews");
    await getBusinessProfileReviews();
    vi.advanceTimersByTime(300001);
    fetcher.mockImplementation(async () => ({ ok: false, status: 403 }) as never);
    const result = await getBusinessProfileReviews();
    expect(result.connected).toBe(false);
    expect(result.reviews).toEqual([]);
  });
  it("keeps the healthy branch and does not follow a configured resource to another host", async () => {
    vi.stubEnv("GOOGLE_BUSINESS_WEST_STREET_LOCATION", "https://other.example/secret");
    const fetcher = mockFetch();
    const { getBusinessProfileReviews } = await import("@/lib/google-business-reviews");
    const result = await getBusinessProfileReviews();
    expect(result.connected).toBe(true);
    expect(result.reviews).toHaveLength(1);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
  it("handles revoked credentials without exposing Google diagnostics", async () => {
    const fetcher = vi.fn(async () => ({ ok: false, json: async () => ({ error_description: "private diagnostics" }) }));
    vi.stubGlobal("fetch", fetcher);
    const { getBusinessProfileReviews } = await import("@/lib/google-business-reviews");
    const result = await getBusinessProfileReviews();
    expect(result.connected).toBe(false);
    expect(JSON.stringify(result)).not.toContain("private diagnostics");
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it("treats a successful empty response as live, so deleted content is not replaced with manual copies", async () => {
    vi.stubGlobal("fetch", vi.fn(async (url: string) => reply(url.includes("oauth2") ? { access_token: "bearer", expires_in: 3600 } : { reviews: [] })));
    const { getBusinessProfileReviews } = await import("@/lib/google-business-reviews");
    expect(await getBusinessProfileReviews()).toMatchObject({ connected: true, reviews: [] });
  });
});
