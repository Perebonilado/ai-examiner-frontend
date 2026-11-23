import { NextPage } from "next";
import { useRouter } from "next/router";
import AdminLayout from "@/@modules/admin/AdminLayout";
import CampaignReviewView from "@/@modules/admin/campaigns/CampaignReviewView";

const ReviewCampaignPage: NextPage = () => {
  const { query, isReady } = useRouter();
  const id = typeof query.id === "string" ? query.id : "";
  return (
    <AdminLayout title="Review and send" bare>
      {isReady && id ? <CampaignReviewView key={id} id={id} /> : null}
    </AdminLayout>
  );
};

export default ReviewCampaignPage;
