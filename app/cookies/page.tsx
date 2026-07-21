import type { Metadata } from "next";
import { PolicyPage } from "@/components/policy-page";

export const metadata: Metadata = { title: "Cookie Notice", description: "How Pink Beauty uses essential browser storage and third-party services.", alternates: { canonical: "/cookies" } };

export default function CookiesPage() {
  return <PolicyPage eyebrow="Website preferences" title="Cookies." intro="Pink Beauty Salon & Academy and Pink Beauty Clinic use cookies and similar browser storage to operate this website and remember useful choices." sections={[
    { title: "What cookies are", body: "Cookies are small text files placed on your device. Similar technologies, including local browser storage, can remember information between pages or visits. Some are necessary for the website to work; optional technologies should be used only with the appropriate consent." },
    { title: "Essential storage", body: "The site may store your selected Pink Beauty branch, basket contents, security settings and session information so core features remain available as you move between pages. These technologies are necessary to provide a service you request and cannot always be switched off through the site." },
    { title: "Analytics and third-party services", body: "If enabled, analytics help us understand how visitors use the site so we can improve it. Embedded or linked services such as payment providers, Google, Instagram or content platforms may also use their own technologies under their own policies. Non-essential technologies should not be set until any consent required by law has been obtained." },
    { title: "Your controls", body: "You can reject or withdraw consent for non-essential cookies where a cookie control is provided, and can block or clear cookies and stored website data through your browser. Blocking essential storage may affect the basket, selected branch, checkout, login or other site features." },
  ]} />;
}
