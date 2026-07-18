import { PolicyPage } from "@/components/policy-page";

export default function AccessibilityPage() {
  return <PolicyPage eyebrow="Inclusive access" title="Accessibility." intro="Pink Beauty aims to make its website, services and learning experiences usable by as many people as possible." sections={[{ title: "Using this website", body: "The site supports keyboard navigation, labelled controls, responsive text and a skip-to-content link. If something prevents you from completing a task, contact the team and describe the page and problem." }, { title: "Visiting a branch", body: "Contact the branch before travelling to discuss step-free access, seating, mobility, communication or other reasonable adjustments." }, { title: "Courses and consultations", body: "Tell the academy or clinic about learning, communication or access requirements early so suitable arrangements can be discussed." }]} />;
}
