import { NextPage } from "next";
import { useRouter } from "next/router";
import AdminLayout from "@/@modules/admin/AdminLayout";
import TestAttemptView from "@/@modules/admin/insights/TestAttemptView";

const Page: NextPage = () => {
  const { query, isReady } = useRouter();
  const value = typeof query.key === "string" ? query.key : "";
  return <AdminLayout title="Test attempt">{isReady && value ? <TestAttemptView attemptKey={value} /> : null}</AdminLayout>;
};

export default Page;
