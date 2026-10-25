import Image from "next/image";
import Link from "next/link";

export function MeetTheTeam() {
  return (
    <section id="meet-the-team" aria-labelledby="team-heading" className="bg-cream py-12 sm:py-20">
      <div className="container-site grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
        <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem]">
          <Image src="/images/photoshoot/team.jpg" alt="The Pink Beauty team" fill className="object-cover" sizes="(min-width: 1024px) 45vw, 100vw" />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[.25em] text-pink">The people behind Pink</p>
          <h2 id="team-heading" className="mt-4 font-display text-5xl tracking-[-.04em] sm:text-7xl">Meet the team.</h2>
          <p className="mt-6 max-w-xl text-base leading-8 text-black/65">Get to know the people who welcome you to Pink Beauty, from your first consultation to your treatment and aftercare.</p>
          <Link href="/team" className="button-primary mt-8">Meet our specialists</Link>
        </div>
      </div>
    </section>
  );
}
