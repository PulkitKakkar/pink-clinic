import { redirect } from "next/navigation";

export default async function LegacyServicePage({ params }: { params: Promise<{ slug: string }> }) {
  redirect(`/treatments/select-branch?service=${(await params).slug}`);
}
