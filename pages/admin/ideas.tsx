import { NextPage } from "next";
import AdminLayout from "@/@modules/admin/AdminLayout";
import IdeasView from "@/@modules/admin/insights/IdeasView";

const Page: NextPage = () => (
  <AdminLayout title="Ideas">
    <IdeasView />
  </AdminLayout>
);

export default Page;
