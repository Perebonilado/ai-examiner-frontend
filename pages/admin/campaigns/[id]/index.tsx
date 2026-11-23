import { NextPage } from "next";
import { useRouter } from "next/router";
import AdminLayout from "@/@modules/admin/AdminLayout";
import CampaignReportView from "@/@modules/admin/campaigns/CampaignReportView";

const CampaignReportPage: NextPage = () => {
  const { query, isReady } = useRouter();
  const id = typeof query.id === "string" ? query.id : "";
  return (
    <AdminLayout title="Campaign">
      {isReady && id ? <CampaignReportView key={id} id={id} /> : null}
    </AdminLayout>
  );
};

export default CampaignReportPage;
