import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { founder, teamMembers, type TeamMember } from "@/lib/team";

export const metadata: Metadata = {
  title: "Meet our team | Beauty, skin & hair specialists in Reading",
  description: "Meet Chandni and the Pink Beauty team. Discover the experience and expertise behind our facials, laser, skin, hair, massage and academy training in Reading.",
  alternates: { canonical: "/team" },
};

function Credentials({ member }: { member: TeamMember }) {
  return (
    <dl className="flex flex-wrap gap-x-8 gap-y-4 border-y border-black/10 py-4">
      <div><dt className="text-[10px] font-bold uppercase tracking-[.18em] text-black/55">Qualification</dt><dd className="mt-1 text-sm font-semibold">{member.level}</dd></div>
      <div><dt className="text-[10px] font-bold uppercase tracking-[.18em] text-black/55">Experience</dt><dd className="mt-1 text-sm font-semibold">{member.experience}</dd></div>
    </dl>
  );
}

export default function TeamPage() {
  return (
    <main>
      <section className="relative overflow-hidden bg-[#210013] pb-12 text-white sm:pb-20">
        <div className="pointer-events-none absolute -right-24 top-20 h-96 w-96 rounded-full border border-pink/25" aria-hidden="true" />
        <div className="container-site relative grid gap-8 lg:grid-cols-[1.2fr_.8fr] lg:items-end">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.28em] text-pink-light">The people behind Pink</p>
            <h1 className="mt-5 font-display text-6xl leading-[.95] tracking-[-.05em] sm:text-8xl">Expert hands.<br /><span className="italic text-pink-light">Personal care.</span></h1>
          </div>
          <div className="max-w-lg lg:pb-2">
            <p className="text-sm leading-7 text-white/75 sm:text-base sm:leading-8">Meet the people who make Pink Beauty feel like Pink. A team of practitioners, educators and specialists, each bringing their own experience and a shared love of looking after you.</p>
            <a href="#our-specialists" className="mt-6 inline-flex min-h-11 items-center gap-3 text-xs font-bold uppercase tracking-[.15em] text-pink-light">Get to know us <ArrowDown size={16} /></a>
          </div>
        </div>
      </section>

      <section aria-labelledby="founder-heading" className="section-shell bg-cream">
        <div className="container-site grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-pink-light sm:aspect-square">
            <Image src={founder.image!} alt="Chandni, founder and director of Pink Beauty" fill priority sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
          </div>
          <div>
            <p className="eyebrow">Leading Pink forward</p>
            <h2 id="founder-heading" className="font-display text-6xl tracking-[-.04em] sm:text-7xl">{founder.name}</h2>
            <p className="mt-2 text-sm font-semibold text-pink-dark">{founder.role}</p>
            <p className="my-6 text-sm leading-7 text-black/65 sm:text-base sm:leading-8">{founder.bio}</p>
            <Credentials member={founder} />
            <ul className="mt-5 flex flex-wrap gap-2" aria-label="Chandni’s expertise">{founder.expertise.map((item) => <li key={item} className="rounded-full bg-pink-light/70 px-3 py-2 text-xs font-medium text-pink-berry">{item}</li>)}</ul>
            <Link href="/courses" className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-pink-dark">Explore the academy <ArrowUpRight size={17} /></Link>
            <aside aria-label="Chandni’s story" className="mt-6 rounded-2xl border border-pink/15 bg-white p-5 sm:p-6">
              <p className="text-[10px] font-bold uppercase tracking-[.18em] text-pink-dark">Chandni’s story</p>
              <h3 className="mt-3 font-display text-2xl leading-tight">From a personal vision to a community of care.</h3>
              <p className="mt-3 text-sm leading-7 text-black/65">Since starting Pink in 2010, Chandni Chowdhary has grown her vision into two branches and an academy. Listening to clients and understanding their individual needs remain at the heart of her approach.</p>
              <p className="mt-3 text-sm leading-7 text-black/65">Through Pink Beauty Academy, she has trained hundreds of students, sharing practical techniques alongside guidance on client trust, business skills and confidence. She remains closely involved in choosing treatments, guiding the team and mentoring aspiring beauty professionals.</p>
            </aside>
          </div>
        </div>
      </section>

      <section id="our-specialists" aria-labelledby="specialists-heading" className="section-shell scroll-mt-6 bg-white">
        <div className="container-site">
          <div className="mb-8 max-w-2xl sm:mb-12"><p className="eyebrow">Our specialists</p><h2 id="specialists-heading" className="section-title">A personal touch.<br />A wealth of experience.</h2><p className="mt-5 text-sm leading-7 text-black/65">From your first conversation to your treatment and aftercare, get to know the expertise behind your visit.</p></div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {teamMembers.map((member) => (
              <article key={member.slug} id={member.slug} aria-labelledby={`${member.slug}-heading`} className="flex scroll-mt-6 flex-col overflow-hidden rounded-[1.5rem] border border-black/10 bg-cream">
                <div className="relative aspect-[4/5] overflow-hidden bg-[#f4e7ee]">
                  {member.image ? <Image src={member.image} alt={`${member.name}, ${member.role.toLowerCase()} at Pink Beauty`} width={member.portrait?.width ?? 1066} height={1600} sizes="(min-width: 1280px) 36vw, (min-width: 768px) 54vw, 120vw" className="absolute h-auto max-w-none" style={{ width: `${(member.portrait?.zoom ?? 1) * 100}%`, left: `${(1 - (member.portrait?.zoom ?? 1)) * 50}%`, top: `${member.portrait?.top ?? 0}%` }} /> : <div aria-hidden="true" className="flex h-full items-center justify-center bg-gradient-to-br from-pink-light to-[#ecdae4]"><span className="font-display text-[9rem] italic text-pink-berry/25">{member.name[0]}</span></div>}
                </div>
                <div className="flex flex-1 flex-col p-6 sm:p-7">
                  <h3 id={`${member.slug}-heading`} className="font-display text-4xl tracking-[-.03em]">{member.name}</h3>
                  <p className="mt-1 text-xs font-bold text-pink-dark">{member.role}</p>
                  <div className="mt-5"><Credentials member={member} /></div>
                  <p className="my-5 text-sm leading-7 text-black/65">{member.bio}</p>
                  <ul className="mt-auto flex flex-wrap gap-2" aria-label={`${member.name}’s expertise`}>{member.expertise.map((item) => <li key={item} className="rounded-full border border-pink/15 bg-white px-3 py-1.5 text-[11px] font-medium text-pink-berry">{item}</li>)}</ul>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell bg-pink-berry text-white">
        <div className="container-site text-center"><p className="text-[10px] font-bold uppercase tracking-[.25em] text-pink-light">Let’s find your fit</p><h2 className="mx-auto mt-4 max-w-2xl font-display text-4xl leading-tight tracking-[-.04em] sm:text-6xl">Your next visit starts<br />with a conversation.</h2><p className="mx-auto mt-5 max-w-lg text-sm leading-7 text-white/75">Tell us what you’re looking for and we’ll help you choose a treatment and the right member of our team.</p><Link href="/contact?interest=A%20consultation" className="button-light mt-7">Talk to our team <ArrowUpRight size={17} /></Link></div>
      </section>
    </main>
  );
}
