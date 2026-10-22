import "server-only";

import { connection } from "next/server";
import { locations } from "@/lib/content";
import { loadRuntimeSecrets } from "@/lib/runtime-secrets";

export type GoogleReview = {
  id: string;
  author: string;
  authorUrl?: string;
  photoUrl?: string;
  rating: number;
  text: string;
  published: string;
  branchName: string;
  reviewUrl?: string;
};

export type GoogleReviewSource = {
  branchName: string;
  mapsUrl: string;
  rating?: number;
  reviewCount?: number;
};

type PlaceReview = {
  name: string;
  rating: number;
  text?: { text?: string };
  relativePublishTimeDescription?: string;
  googleMapsUri?: string;
  authorAttribution?: { displayName?: string; uri?: string; photoUri?: string };
};

type PlaceDetails = {
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  reviews?: PlaceReview[];
};

const getBranches = () => [
  { location: locations[0], placeId: process.env.GOOGLE_WEST_STREET_PLACE_ID },
  { location: locations[1], placeId: process.env.GOOGLE_WATLINGTON_STREET_PLACE_ID },
];

const searchUrl = (name: string, address: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Pink Beauty ${name}, ${address}`)}`;

async function getBranchReviews(branch: ReturnType<typeof getBranches>[number], apiKey: string) {
  const fallbackSource: GoogleReviewSource = {
    branchName: branch.location.name,
    mapsUrl: searchUrl(branch.location.name, branch.location.address),
  };
  if (!branch.placeId) return { source: fallbackSource, reviews: [] };

  try {
    const response = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(branch.placeId)}`, {
      headers: {
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "rating,userRatingCount,googleMapsUri,reviews",
      },
      // Review content is displayed live, not persisted in Next's data cache.
      cache: "no-store",
      signal: AbortSignal.timeout(2500),
    });
    if (!response.ok) return { source: fallbackSource, reviews: [] };

    const place = await response.json() as PlaceDetails;
    return {
      source: {
        branchName: branch.location.name,
        mapsUrl: place.googleMapsUri || fallbackSource.mapsUrl,
        rating: place.rating,
        reviewCount: place.userRatingCount,
      },
      reviews: (place.reviews || []).flatMap((review): GoogleReview[] => {
        const text = review.text?.text;
        if (!text) return [];
        return [{
          id: `${branch.location.id}-${review.name}`,
          author: review.authorAttribution?.displayName || "Google reviewer",
          authorUrl: review.authorAttribution?.uri,
          photoUrl: review.authorAttribution?.photoUri,
          rating: review.rating,
          text,
          published: review.relativePublishTimeDescription || "Google review",
          branchName: branch.location.name,
          reviewUrl: review.googleMapsUri,
        }];
      }),
    };
  } catch {
    return { source: fallbackSource, reviews: [] };
  }
}

export async function getGoogleReviews(): Promise<{ reviews: GoogleReview[]; sources: GoogleReviewSource[] }> {
  // Secrets are unavailable at build time. Resolve both configuration and
  // content during the request, including the initially unconfigured state.
  await connection();
  await loadRuntimeSecrets();
  const branches = getBranches();
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return {
      reviews: [] as GoogleReview[],
      sources: branches.map((branch) => ({ branchName: branch.location.name, mapsUrl: searchUrl(branch.location.name, branch.location.address) })),
    };
  }

  const results = await Promise.all(branches.map((branch) => getBranchReviews(branch, apiKey)));
  const mixedReviews = Array.from({ length: 5 }, (_, index) => results.flatMap((result) => result.reviews[index] ? [result.reviews[index]] : [])).flat().slice(0, 6);
  return { reviews: mixedReviews, sources: results.map((result) => result.source) };
}
