import { NextPage } from "next";
import AdminLayout from "@/@modules/admin/AdminLayout";
import CampaignsView from "@/@modules/admin/campaigns/CampaignsView";

const AdminCampaignsPage: NextPage = () => (
  <AdminLayout title="Campaigns">
    <CampaignsView />
  </AdminLayout>
);

export default AdminCampaignsPage;
