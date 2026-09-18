"use client";

import Image from "next/image";
import { useState } from "react";

type Category = "Salon" | "Team" | "Aesthetics" | "Academy" | "Exterior";
type Photo = { file: string; category: Category };

const photos: Photo[] = [
  ...["8J4A1127", "8J4A1129", "8J4A1130", "8J4A1137", "8J4A1146", "8J4A1147", "8J4A1151", "8J4A1155", "8J4A1164", "8J4A1167", "8J4A1168", "8J4A1170", "8J4A1181", "8J4A1182"].map((file) => ({ file, category: "Salon" as const })),
  ...["8J4A1190", "8J4A1192", "8J4A1195", "8J4A1205", "8J4A1206", "8J4A1210", "8J4A1220", "8J4A1224", "8J4A1228", "8J4A1230", "8J4A1266", "8J4A1276", "8J4A1281", "8J4A1288", "8J4A1291", "8J4A1297", "8J4A1298"].map((file) => ({ file, category: "Team" as const })),
  ...["8J4A1235", "8J4A1243", "8J4A1257", "8J4A1323", "8J4A1324", "8J4A1328", "8J4A1330", "8J4A1331", "8J4A1333", "8J4A1338", "8J4A1341", "8J4A1347", "8J4A1349", "8J4A1350", "8J4A1367", "8J4A1372", "8J4A1376", "8J4A1377", "8J4A1380", "8J4A1381", "8J4A1383", "8J4A1384", "8J4A1385"].map((file) => ({ file, category: "Aesthetics" as const })),
  ...["8J4A1303", "8J4A1304", "8J4A1306", "8J4A1311", "8J4A1317"].map((file) => ({ file, category: "Academy" as const })),
  ...["8J4A1251", "8J4A1387", "DJI_0967", "DJI_0968", "DJI_0969", "DJI_0974", "DJI_0975", "DJI_0976"].map((file) => ({ file, category: "Exterior" as const })),
];

const videos = ["DJI_0970", "IMG_0741", "IMG_0743", "IMG_0744", "IMG_0745", "IMG_0746", "IMG_0748", "IMG_0749", "IMG_0750", "IMG_0751", "IMG_0752", "IMG_0753", "IMG_0758", "IMG_0759", "IMG_0760", "IMG_0761", "IMG_0762", "IMG_0763", "IMG_0764", "IMG_0767", "IMG_0769", "IMG_0771", "IMG_0772", "IMG_0774", "IMG_0775", "IMG_0776", "IMG_0778", "IMG_0779", "IMG_0780", "IMG_0781"];
const filters = ["All photos", "Salon", "Team", "Aesthetics", "Academy", "Exterior", "Videos"] as const;
type Filter = (typeof filters)[number];

export function GalleryBrowser() {
  const [filter, setFilter] = useState<Filter>("All photos");
  const visiblePhotos = filter === "All photos" ? photos : filter === "Videos" ? [] : photos.filter((photo) => photo.category === filter);

  return <section className="section-shell bg-cream"><div className="container-site"><div className="flex flex-wrap gap-2">{filters.map((item) => <button key={item} onClick={() => setFilter(item)} className={`min-h-11 rounded-full px-4 text-xs font-bold transition ${filter === item ? "bg-pink text-white shadow-[0_10px_24px_rgba(228,1,127,.2)]" : "border border-black/10 bg-white text-ink hover:border-pink hover:text-pink"}`}>{item}</button>)}</div>{filter !== "Videos" && <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"><p className="col-span-full text-sm text-black/55">{visiblePhotos.length} photos from the Watlington Street shoot.</p>{visiblePhotos.map((photo) => <figure key={photo.file} className="group relative aspect-[4/5] overflow-hidden rounded-2xl bg-white shadow-soft sm:rounded-[1.5rem]"><Image src={`/gallery/photos/${photo.file}.jpg`} alt={`Pink Beauty ${photo.category.toLowerCase()} photoshoot`} fill className="object-cover transition duration-500 group-hover:scale-105" sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw" /><figcaption className="absolute bottom-2 left-2 rounded-full bg-black/55 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[.14em] text-white backdrop-blur">{photo.category}</figcaption></figure>)}</div>}{filter === "Videos" && <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"><p className="col-span-full text-sm text-black/55">30 short films from the Watlington Street shoot.</p>{videos.map((video) => <figure key={video} className="overflow-hidden rounded-2xl bg-black shadow-soft sm:rounded-[1.5rem]"><video controls preload="metadata" poster={`/gallery/posters/${video}.jpg`} className="aspect-[9/16] w-full object-cover"><source src={`/gallery/videos/${video}.mp4`} type="video/mp4" />Your browser does not support video playback.</video><figcaption className="bg-white px-4 py-3 text-[10px] font-bold uppercase tracking-[.14em] text-black/50">Pink Beauty film</figcaption></figure>)}</div>}</div></section>;
}
