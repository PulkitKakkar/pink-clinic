import { PolicyPage } from "@/components/policy-page";

export default function AccessibilityPage() {
  return <PolicyPage eyebrow="Inclusive access" title="Accessibility." intro="Pink Beauty Salon & Academy and Pink Beauty Clinic aim to make this website, our services and our learning experiences usable by as many people as possible." sections={[
    { title: "Using this website", body: "The site is designed to support keyboard navigation, labelled controls, responsive layouts, text resizing and a skip-to-content link. We aim to use clear language, meaningful headings, visible focus states and sufficient colour contrast. Some third-party booking, payment, map, social-media or content services may have their own accessibility arrangements." },
    { title: "Tell us about a problem", body: "If something prevents you from finding information, booking, buying or contacting us, tell us which page or task caused the problem and what format or assistance you need. Contact Pink Beauty Salon & Academy on 0118 996 2711 or info@pinkbeautysalons.co.uk, or Pink Beauty Clinic on 0118 402 8505 or pinkbeautyreading@gmail.com. We will try to provide the information or service another way." },
    { title: "Visiting a branch", body: "Contact the relevant business before travelling to discuss step-free access, seating, mobility, communication, sensory needs or other reasonable adjustments. The team can explain the facilities at that location and help plan your visit." },
    { title: "Courses and consultations", body: "Tell Pink Beauty Salon & Academy or Pink Beauty Clinic about learning, communication, health or access requirements as early as possible so reasonable adjustments can be discussed. Adjustments remain subject to treatment safety, professional standards and the essential learning or assessment requirements of an accredited course." },
  ]} />;
}
