import { redirect } from "next/navigation";

export default async function LegacyServicePage({ params }: { params: Promise<{ slug: string }> }) {
  redirect(`/contact?serviceSlug=${(await params).slug}`);
}
