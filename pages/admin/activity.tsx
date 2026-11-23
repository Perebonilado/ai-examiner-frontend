import { NextPage } from "next";
import AdminLayout from "@/@modules/admin/AdminLayout";
import ActivityView from "@/@modules/admin/ActivityView";

const AdminActivityPage: NextPage = () => (
  <AdminLayout title="Activity log">
    <ActivityView />
  </AdminLayout>
);

export default AdminActivityPage;
