import Image from "next/image";
import { Camera as Instagram } from "lucide-react";
import { locations } from "@/lib/content";
import { getInstagramPosts, type InstagramPost } from "@/lib/instagram";

const fallbackImages = [
  "/images/photoshoot/salon-interior.jpg",
  "/images/photoshoot/team.jpg",
  "/images/photoshoot/pink-details.jpg",
  "/images/photoshoot/clinic-exterior.jpg",
  "/images/photoshoot/courses.jpg",
];

export async function InstagramFeed() {
  const livePosts = await getInstagramPosts();
  const posts: InstagramPost[] = livePosts.length ? livePosts : fallbackImages.map((imageUrl, index) => {
    const location = locations[index % locations.length];
    return { id: imageUrl, imageUrl, permalink: location.instagramUrl, locationName: location.name, locationHandle: location.instagramHandle };
  });

  return <section className="bg-pink-light/45 py-14 sm:py-20"><div className="container-site"><div className="mb-6 flex flex-col gap-5 sm:mb-8 sm:flex-row sm:items-end sm:justify-between"><div><p className="eyebrow">Follow the journey</p><h2 className="font-display text-3xl tracking-tight sm:text-4xl">Follow Pink Beauty</h2></div><div className="grid gap-2 sm:flex">{locations.map(location => <a key={location.id} href={location.instagramUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-pink/15 bg-white px-4 py-2.5 text-[10px] font-bold text-pink transition hover:bg-pink hover:text-white"><Instagram size={14} /><span>{location.name}</span><span className="hidden text-current/60 lg:inline">{location.instagramHandle}</span></a>)}</div></div><div className="grid grid-cols-4 gap-2 sm:grid-cols-5 sm:gap-3">{posts.map((post, i) => <a href={post.permalink} target="_blank" rel="noreferrer" aria-label={`View ${post.locationName} post on Instagram`} key={post.id} className={`group relative overflow-hidden rounded-xl sm:rounded-2xl ${i === 4 ? "hidden sm:block" : ""}`}><div className="relative aspect-square"><Image src={livePosts.length ? `/api/instagram/image?url=${encodeURIComponent(post.imageUrl)}` : post.imageUrl} alt={post.caption || `${post.locationName} Pink Beauty Instagram`} fill className="object-cover transition duration-500 group-hover:scale-105" sizes="20vw" /></div><span className="absolute bottom-2 left-2 hidden rounded-full bg-black/50 px-2 py-1 text-[8px] font-bold text-white backdrop-blur sm:block">{post.locationHandle}</span></a>)}</div></div></section>;
}
