import { Award, BadgeCheck, HeartHandshake, Sparkles } from "lucide-react";

const features = [
  { icon: BadgeCheck, title: "Experienced professionals", text: "A highly trained team dedicated to considered, personal results." },
  { icon: Sparkles, title: "Advanced technology", text: "Clinic-grade devices and protocols selected for safety and performance." },
  { icon: HeartHandshake, title: "Trusted by thousands", text: "A loyal client community built through care, honesty and consistency." },
  { icon: Award, title: "Accredited training", text: "Career-focused education with recognised qualifications and real support." },
];

export function WhyPink() {
  return <section id="why" className="section-shell bg-pink-light/55"><div className="container-site"><div className="grid gap-8 sm:gap-14 lg:grid-cols-[.8fr_1.2fr] lg:items-end"><div><p className="eyebrow">Why choose Pink</p><h2 className="section-title">Expert care.<br /><em className="font-normal text-pink">Genuine confidence.</em></h2><p className="mt-4 max-w-md text-sm leading-6 text-black/55 sm:mt-6 sm:leading-7">For over a decade, Pink has brought together beauty artistry, advanced aesthetics and professional education under one trusted name.</p></div><div className="grid gap-3 sm:grid-cols-2 sm:gap-px sm:overflow-hidden sm:rounded-[2rem] sm:bg-black/10">{features.map(({ icon: Icon, title, text }) => <article key={title} className="flex gap-4 rounded-2xl bg-white p-4 sm:block sm:rounded-none sm:p-9"><Icon size={23} strokeWidth={1.5} className="shrink-0 text-pink" /><div><h3 className="text-sm font-bold tracking-tight sm:mt-8 sm:text-lg">{title}</h3><p className="mt-1 text-xs leading-5 text-black/50 sm:mt-3 sm:text-sm sm:leading-6">{text}</p></div></article>)}</div></div></div></section>;
}
