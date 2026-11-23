import { NextPage } from "next";
import AdminLayout from "@/@modules/admin/AdminLayout";
import TeamView from "@/@modules/admin/TeamView";

const AdminTeamPage: NextPage = () => (
  <AdminLayout title="Admins">
    <TeamView />
  </AdminLayout>
);

export default AdminTeamPage;
