import { NextPage } from "next";
import AdminLayout from "@/@modules/admin/AdminLayout";
import ConversationsView from "@/@modules/admin/insights/ConversationsView";

const Page: NextPage = () => (
  <AdminLayout title="Conversations">
    <ConversationsView />
  </AdminLayout>
);

export default Page;
