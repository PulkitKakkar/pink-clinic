import "server-only";

import { connection } from "next/server";
import { locations } from "@/lib/content";
import type { GoogleReview, GoogleReviewSource } from "@/lib/google-reviews";
import { loadRuntimeSecrets } from "@/lib/runtime-secrets";

type BusinessReview = {
  reviewId: string;
  reviewer?: { displayName?: string; profilePhotoUrl?: string; isAnonymous?: boolean };
  starRating: string;
  comment?: string;
  createTime?: string;
};
type ReviewPage = { reviews?: BusinessReview[]; averageRating?: number; totalReviewCount?: number; nextPageToken?: string };
const ratings: Record<string, number> = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 };
const TTL = 5 * 60 * 1000;
// Only short-lived server memory; never persist review content or tokens to disk.
let token: { value: string; expires: number; credentials: string } | undefined;
let tokenRequest: Promise<string> | undefined;
const branchCache = new Map<string, { expires: number; page: ReviewPage }>();
const branchRequests = new Map<string, Promise<ReviewPage>>();

async function accessToken() {
  const clientId = process.env.GOOGLE_BUSINESS_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_BUSINESS_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_BUSINESS_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken) throw new Error("Google reviews connection unavailable.");
  const credentials = JSON.stringify([clientId, clientSecret, refreshToken]);
  if (token && token.credentials === credentials && token.expires > Date.now()) return token.value;
  if (!tokenRequest) {
    tokenRequest = (async () => {
      const response = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST", cache: "no-store", signal: AbortSignal.timeout(4000),
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, refresh_token: refreshToken, grant_type: "refresh_token" }),
      });
      if (!response.ok) throw new Error("Google reviews connection unavailable.");
      const body = await response.json() as { access_token?: string; expires_in?: number };
      if (!body.access_token || !body.expires_in) throw new Error("Google reviews connection unavailable.");
      token = { value: body.access_token, expires: Date.now() + Math.max(0, body.expires_in - 60) * 1000, credentials };
      return token.value;
    })().finally(() => { tokenRequest = undefined; });
  }
  return tokenRequest;
}

async function latestReviews(resource: string): Promise<ReviewPage> {
  // Full resource names are configured only after matching each street address.
  if (!/^accounts\/\d+\/locations\/\d+$/.test(resource)) throw new Error("Invalid Google branch configuration.");
  const cached = branchCache.get(resource);
  if (cached && cached.expires > Date.now()) return cached.page;
  branchCache.delete(resource); // Expired content is never served after a failure.
  const inFlight = branchRequests.get(resource);
  if (inFlight) return inFlight;
  const pending = (async () => {
    const bearer = await accessToken();
    const response = await fetch(`https://mybusiness.googleapis.com/v4/${resource}/reviews?pageSize=50&orderBy=updateTime%20desc`, {
      headers: { Authorization: `Bearer ${bearer}` }, cache: "no-store", signal: AbortSignal.timeout(4000),
    });
    if (!response.ok) {
      if (response.status === 401) token = undefined;
      throw new Error("Google reviews unavailable.");
    }
    const page = await response.json() as ReviewPage;
    if (page.reviews !== undefined && !Array.isArray(page.reviews)) throw new Error("Invalid Google reviews response.");
    const cachedPage = { expires: Date.now() + TTL, page };
    branchCache.set(resource, cachedPage);
    const expiry = setTimeout(() => {
      if (branchCache.get(resource) === cachedPage) branchCache.delete(resource);
    }, TTL);
    expiry.unref?.();
    return page;
  })().finally(() => { branchRequests.delete(resource); });
  branchRequests.set(resource, pending);
  return pending;
}

export async function getBusinessProfileReviews(): Promise<{
  reviews: GoogleReview[]; sources: GoogleReviewSource[]; connected: boolean;
}> {
  await connection();
  const sources: GoogleReviewSource[] = locations.map(location => ({
    branchName: location.name,
    mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Pink Beauty ${location.name}, ${location.address}`)}`,
  }));
  try { await loadRuntimeSecrets(); } catch { return { reviews: [], sources, connected: false }; }
  const resources = [process.env.GOOGLE_BUSINESS_WEST_STREET_LOCATION, process.env.GOOGLE_BUSINESS_WATLINGTON_STREET_LOCATION];
  const branches = await Promise.all(resources.map(async (resource, index) => {
    if (!resource) return { reviews: [] as GoogleReview[], connected: false };
    try {
      const page = await latestReviews(resource);
      sources[index] = { ...sources[index], rating: page.averageRating, reviewCount: page.totalReviewCount };
      const reviews = (page.reviews || []).flatMap((review): GoogleReview[] => {
        const rating = ratings[review.starRating];
        if (!review.reviewId || !review.comment?.trim() || !rating || rating < 4) return [];
        return [{ id: `${locations[index].id}-${review.reviewId}`, author: review.reviewer?.displayName || "Google reviewer",
          photoUrl: review.reviewer?.profilePhotoUrl, rating, text: review.comment,
          published: review.createTime || "", branchName: locations[index].name,
          // GBP does not return reviewer profile or individual review URLs.
        }];
      });
      return { reviews, connected: true };
    } catch { return { reviews: [] as GoogleReview[], connected: false }; }
  }));
  const reviews = Array.from({ length: 6 }, (_, i) => branches.flatMap(branch => branch.reviews[i] ? [branch.reviews[i]] : [])).flat().slice(0, 6);
  return { reviews, sources, connected: branches.some(branch => branch.connected) };
}
