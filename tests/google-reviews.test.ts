import { afterEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
vi.mock("next/server", () => ({ connection: vi.fn() }));
vi.mock("@/lib/runtime-secrets", () => ({ loadRuntimeSecrets: vi.fn() }));
import { getGoogleReviews } from "@/lib/google-reviews";
import { loadRuntimeSecrets } from "@/lib/runtime-secrets";

afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); vi.resetAllMocks(); });

describe("Google reviews runtime integration", () => {
  it("uses credentials and branch IDs loaded after module import without caching review content", async () => {
    vi.mocked(loadRuntimeSecrets).mockImplementation(async () => {
      vi.stubEnv("GOOGLE_PLACES_API_KEY", "test-only-key");
      vi.stubEnv("GOOGLE_WEST_STREET_PLACE_ID", "west");
      vi.stubEnv("GOOGLE_WATLINGTON_STREET_PLACE_ID", "watlington");
    });
    const fetcher = vi.fn(async (url: string) => ({ ok: true, json: async () => ({
      rating: 4.8, userRatingCount: 123, googleMapsUri: "https://maps.google.com/place",
      reviews: Array.from({ length: 5 }, (_, i) => ({ name: `${url}/${i}`, rating: 5,
        text: { text: `Review ${i}` }, googleMapsUri: `https://maps.google.com/review/${i}`,
        authorAttribution: { displayName: "Reviewer", uri: "https://maps.google.com/author" },
      })),
    }) }));
    vi.stubGlobal("fetch", fetcher);
    const result = await getGoogleReviews();
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(fetcher.mock.calls.map(([url]) => url)).toEqual([
      "https://places.googleapis.com/v1/places/west", "https://places.googleapis.com/v1/places/watlington",
    ]);
    expect(fetcher).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
      cache: "no-store", signal: expect.any(AbortSignal),
      headers: expect.objectContaining({ "X-Goog-Api-Key": "test-only-key" }),
    }));
    expect(result.reviews).toHaveLength(6);
    expect(result.reviews[0].branchName).not.toBe(result.reviews[1].branchName);
    expect(result.reviews[0].reviewUrl).toBe("https://maps.google.com/review/0");
    expect(result.sources[0]).toMatchObject({ rating: 4.8, reviewCount: 123 });
  });

  it("keeps both branch links without calling Google when no key is configured", async () => {
    vi.stubEnv("GOOGLE_PLACES_API_KEY", "");
    const fetcher = vi.fn(); vi.stubGlobal("fetch", fetcher);
    const result = await getGoogleReviews();
    expect(fetcher).not.toHaveBeenCalled();
    expect(result.reviews).toEqual([]);
    expect(result.sources).toHaveLength(2);
    expect(result.sources.every(source => source.mapsUrl.startsWith("https://www.google.com/maps/search/"))).toBe(true);
  });

  it("keeps the healthy branch when Google rejects or times out the other branch", async () => {
    vi.stubEnv("GOOGLE_PLACES_API_KEY", "test-only-key");
    vi.stubEnv("GOOGLE_WEST_STREET_PLACE_ID", "west");
    vi.stubEnv("GOOGLE_WATLINGTON_STREET_PLACE_ID", "watlington");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValueOnce(new Error("timeout")).mockResolvedValueOnce({
      ok: true, json: async () => ({ reviews: [{ name: "review", rating: 4, text: { text: "Good" } }] }),
    }));
    const result = await getGoogleReviews();
    expect(result.sources).toHaveLength(2);
    expect(result.reviews).toHaveLength(1);
  });
});
