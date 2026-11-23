import { NextPage } from "next";
import AdminLayout from "@/@modules/admin/AdminLayout";
import FollowUpsView from "@/@modules/admin/insights/FollowUpsView";

const Page: NextPage = () => (
  <AdminLayout title="Follow-ups">
    <FollowUpsView />
  </AdminLayout>
);

export default Page;
