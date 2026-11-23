import { NextPage } from "next";
import AdminLayout from "@/@modules/admin/AdminLayout";
import DocumentsView from "@/@modules/admin/insights/DocumentsView";

const Page: NextPage = () => (
  <AdminLayout title="Documents">
    <DocumentsView />
  </AdminLayout>
);

export default Page;
