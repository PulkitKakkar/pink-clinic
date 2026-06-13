import "server-only";

import { locations } from "@/lib/content";

export type InstagramPost = {
  id: string;
  imageUrl: string;
  permalink: string;
  caption?: string;
  locationName: string;
  locationHandle: string;
};

type InstagramMedia = {
  id: string;
  caption?: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url?: string;
  thumbnail_url?: string;
  permalink: string;
};

const accounts = [
  {
    location: locations[0],
    accountId: process.env.INSTAGRAM_WEST_STREET_ACCOUNT_ID,
    accessToken: process.env.INSTAGRAM_WEST_STREET_ACCESS_TOKEN,
  },
  {
    location: locations[1],
    accountId: process.env.INSTAGRAM_WATLINGTON_STREET_ACCOUNT_ID,
    accessToken: process.env.INSTAGRAM_WATLINGTON_STREET_ACCESS_TOKEN,
  },
];

async function getAccountPosts(account: typeof accounts[number]): Promise<InstagramPost[]> {
  if (!account.accountId || !account.accessToken) return [];

  const params = new URLSearchParams({
    fields: "id,caption,media_type,media_url,thumbnail_url,permalink",
    limit: "4",
    access_token: account.accessToken,
  });

  try {
    const response = await fetch(`https://graph.instagram.com/${account.accountId}/media?${params}`, { next: { revalidate: 3600 } });
    if (!response.ok) return [];
    const payload = await response.json() as { data?: InstagramMedia[] };

    return (payload.data || []).flatMap((post) => {
      const imageUrl = post.media_type === "VIDEO" ? post.thumbnail_url : post.media_url;
      return imageUrl ? [{
        id: post.id,
        imageUrl,
        permalink: post.permalink,
        caption: post.caption,
        locationName: account.location.name,
        locationHandle: account.location.instagramHandle,
      }] : [];
    });
  } catch {
    return [];
  }
}

export async function getInstagramPosts() {
  const posts = (await Promise.all(accounts.map(getAccountPosts))).flat();
  return posts.sort((a, b) => a.id.localeCompare(b.id)).slice(0, 5);
}
