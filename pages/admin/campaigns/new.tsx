import { NextPage } from "next";
import AdminLayout from "@/@modules/admin/AdminLayout";
import TemplatePickerView from "@/@modules/admin/campaigns/TemplatePickerView";

const NewCampaignPage: NextPage = () => (
  <AdminLayout title="Pick a template" bare>
    <TemplatePickerView />
  </AdminLayout>
);

export default NewCampaignPage;
