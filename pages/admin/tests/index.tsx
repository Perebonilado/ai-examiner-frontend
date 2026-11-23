import { NextPage } from "next";
import AdminLayout from "@/@modules/admin/AdminLayout";
import TestsView from "@/@modules/admin/insights/TestsView";

const Page: NextPage = () => (
  <AdminLayout title="Tests">
    <TestsView />
  </AdminLayout>
);

export default Page;
