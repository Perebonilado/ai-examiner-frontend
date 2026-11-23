import { NextPage } from "next";
import AdminLayout from "@/@modules/admin/AdminLayout";
import InsightsView from "@/@modules/admin/insights/InsightsView";

const Page: NextPage = () => (
  <AdminLayout title="Insights">
    <InsightsView />
  </AdminLayout>
);

export default Page;
