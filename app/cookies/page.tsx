import { PolicyPage } from "@/components/policy-page";

export default function CookiesPage() {
  return <PolicyPage eyebrow="Website preferences" title="Cookies." intro="Cookies and similar browser storage help the website remember useful choices and operate key features." sections={[{ title: "Essential storage", body: "The site stores your selected branch and basket in your browser so these choices remain available as you move between pages." }, { title: "Third-party services", body: "Embedded or linked services such as payment providers, Google, Instagram or content platforms may use their own technologies under their own policies." }, { title: "Your controls", body: "You can clear stored website data through your browser. Doing so may remove your saved branch and basket." }]} />;
}
