import { NextPage } from "next";
import AdminLayout from "@/@modules/admin/AdminLayout";
import { AssistantPage } from "@/@modules/admin/insights/AskPanel";

const Page: NextPage = () => (
  <AdminLayout title="Ask Claude">
    <AssistantPage />
  </AdminLayout>
);

export default Page;
