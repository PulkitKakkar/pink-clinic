import { Award, BadgeCheck, HeartHandshake, Sparkles } from "lucide-react";

const features = [
  { icon: BadgeCheck, title: "Experienced professionals", text: "A highly trained team dedicated to considered, personal results." },
  { icon: Sparkles, title: "Advanced technology", text: "Clinic-grade devices and protocols selected for safety and performance." },
  { icon: HeartHandshake, title: "Trusted by thousands", text: "A loyal client community built through care, honesty and consistency." },
  { icon: Award, title: "Accredited training", text: "Career-focused education with recognised qualifications and real support." },
];

export function WhyPink() {
  return <section id="why" className="bg-pink-light/55 py-24 sm:py-32"><div className="container-site"><div className="grid gap-14 lg:grid-cols-[.8fr_1.2fr] lg:items-end"><div><p className="eyebrow">Why choose Pink</p><h2 className="section-title">Expert care.<br /><em className="font-normal text-pink">Genuine confidence.</em></h2><p className="mt-6 max-w-md text-sm leading-7 text-black/55">For over a decade, Pink has brought together beauty artistry, advanced aesthetics and professional education under one trusted name.</p></div><div className="grid gap-px overflow-hidden rounded-[2rem] bg-black/10 sm:grid-cols-2">{features.map(({ icon: Icon, title, text }) => <article key={title} className="bg-white p-7 sm:p-9"><Icon size={25} strokeWidth={1.5} className="text-pink" /><h3 className="mt-8 text-lg font-bold tracking-tight">{title}</h3><p className="mt-3 text-sm leading-6 text-black/50">{text}</p></article>)}</div></div></div></section>;
}
