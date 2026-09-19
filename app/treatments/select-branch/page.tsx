import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Choose Your Treatment Branch",
  description: "Choose your Pink Beauty Salon branch to see accurate treatment pricing and availability.",
};

export default function SelectBranchPage() {
  redirect("/products-services");
}
