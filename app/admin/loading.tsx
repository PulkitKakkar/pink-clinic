import { AdminHeader } from "@/components/admin/admin-header";
import { PageLoader } from "@/components/ui/page-loader";

export default function AdminLoading() {
  return <><AdminHeader /><PageLoader label="Loading admin dashboard" /></>;
}
