import { locations } from "@/lib/content";
import type { GoogleReview, GoogleReviewSource } from "@/lib/google-reviews";

// Manually checked in Google Business Profile on this date. Keep original
// wording/ratings, recheck source profiles when updating, and retain the public
// selection disclosure. These are not an automatically refreshed review feed.
export const reviewsCollectedOn = "22 October 2026";
const westStreet = locations[0].name;
const watlingtonStreet = locations[1].name;

export const selectedGoogleReviews: GoogleReview[] = [
  {
    id: "west-bhoomija-singh", author: "Bhoomija Singh", rating: 5,
    text: "Sheez offered great service and the salon is kept in good clean conditions",
    authorUrl: "https://www.google.com/maps/contrib/114922914140917868437/reviews?hl=en-GB",
    branchName: westStreet, published: "",
  },
  {
    id: "watlington-suchitra", author: "Suchitra", rating: 5,
    text: "Loved getting eyebrows done at Pink at Watlington street from Sheez today. She was warm and efficient.",
    authorUrl: "https://www.google.com/maps/contrib/100993381688942711171/reviews?hl=en-GB",
    branchName: watlingtonStreet, published: "",
  },
  {
    id: "west-eisha-dougall", author: "Eisha Dougall", rating: 5,
    text: "Always come here, they’re amazing! Got my brows done today by Sheez😍😍",
    authorUrl: "https://www.google.com/maps/contrib/106108750301932773459/reviews?hl=en-GB",
    branchName: westStreet, published: "",
  },
  {
    id: "watlington-alexandra-nicholls", author: "Alexandra Nicholls", rating: 5,
    text: "Very friendly and professional, great service will definitely return, Sheez is approachable and very gentle",
    authorUrl: "https://www.google.com/maps/contrib/110763984012432874317/reviews?hl=en-GB",
    branchName: watlingtonStreet, published: "",
  },
  {
    id: "west-shalini-sudha-sahoo", author: "SHALINI SUDHA SAHOO", rating: 5,
    text: "Nice hair cut by Sheez☺️",
    authorUrl: "https://www.google.com/maps/contrib/100107601290104139674/reviews?hl=en-GB",
    branchName: westStreet, published: "",
  },
  {
    id: "watlington-isabelle-pichard", author: "Isabelle Pichard", rating: 5,
    text: "Friendly service and good value",
    authorUrl: "https://www.google.com/maps/contrib/102582326067877379175/reviews?hl=en-GB",
    branchName: watlingtonStreet, published: "",
  },
];

export const selectedGoogleReviewSources: GoogleReviewSource[] = locations.map(location => ({
  branchName: location.name,
  mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Pink Beauty ${location.name}, ${location.address}`)}`,
}));
