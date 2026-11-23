import { NextPage } from "next";
import AdminLayout from "@/@modules/admin/AdminLayout";
import UsersView from "@/@modules/admin/UsersView";

const AdminUsersPage: NextPage = () => (
  <AdminLayout title="Users">
    <UsersView />
  </AdminLayout>
);

export default AdminUsersPage;
