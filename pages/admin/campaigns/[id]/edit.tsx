import { NextPage } from "next";
import { useRouter } from "next/router";
import AdminLayout from "@/@modules/admin/AdminLayout";
import CampaignEditorView from "@/@modules/admin/campaigns/CampaignEditorView";

const EditCampaignPage: NextPage = () => {
  const { query, isReady } = useRouter();
  const id = typeof query.id === "string" ? query.id : "";
  return (
    <AdminLayout title="Write the email" bare>
      {isReady && id ? <CampaignEditorView key={id} id={id} /> : null}
    </AdminLayout>
  );
};

export default EditCampaignPage;
