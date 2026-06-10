import Image from "next/image";
import { Instagram } from "lucide-react";

const images = [
  "https://images.unsplash.com/photo-1560750588-73207b1ef5b8?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1526045478516-99145907023c?auto=format&fit=crop&w=800&q=80",
];

export function InstagramFeed() {
  return <section className="bg-pink-light/45 py-20"><div className="container-site"><div className="mb-8 flex items-center justify-between"><div><p className="eyebrow">Follow the journey</p><h2 className="font-display text-4xl tracking-tight">@pinkbeautysalon</h2></div><a href="https://instagram.com" className="hidden h-12 w-12 place-items-center rounded-full bg-pink text-white sm:grid"><Instagram size={19} /></a></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-5">{images.map((src, i) => <a href="https://instagram.com" key={src} className={`group relative overflow-hidden rounded-2xl ${i === 4 ? "hidden sm:block" : ""}`}><div className="relative aspect-square"><Image src={src} alt="Pink Beauty Instagram post" fill className="object-cover transition duration-500 group-hover:scale-105" sizes="20vw" /></div></a>)}</div></div></section>;
}
