import { NextPage } from "next";
import AdminLayout from "@/@modules/admin/AdminLayout";
import OverviewView from "@/@modules/admin/OverviewView";

const AdminOverviewPage: NextPage = () => (
  <AdminLayout title="Overview">
    <OverviewView />
  </AdminLayout>
);

export default AdminOverviewPage;
