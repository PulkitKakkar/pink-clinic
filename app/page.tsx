import { AppointmentCta } from "@/components/sections/cta";
import { Hero } from "@/components/sections/hero";
import { InstagramFeed } from "@/components/sections/instagram";
import { Journey } from "@/components/sections/journey";
import { Results } from "@/components/sections/results";
import { Reviews } from "@/components/sections/reviews";
import { Treatments } from "@/components/sections/treatments";
import { WhyPink } from "@/components/sections/why-pink";
import { locations } from "@/lib/content";

export default function Home() {
  const schema = { "@context": "https://schema.org", "@type": "BeautySalon", name: "Pink Beauty Salon & Academy", url: "https://pinkbeauty.co.uk", telephone: "0118 962 7111", priceRange: "££", address: locations.map(location => ({ "@type": "PostalAddress", streetAddress: location.address, addressLocality: "Reading", addressCountry: "GB" })) };
  return <main><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} /><Hero /><Journey /><WhyPink /><Treatments /><Results /><Reviews /><InstagramFeed /><AppointmentCta /></main>;
}
