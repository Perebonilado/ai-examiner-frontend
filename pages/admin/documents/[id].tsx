import { NextPage } from "next";
import { useRouter } from "next/router";
import AdminLayout from "@/@modules/admin/AdminLayout";
import DocumentView from "@/@modules/admin/insights/DocumentView";

const Page: NextPage = () => {
  const { query, isReady } = useRouter();
  const value = typeof query.id === "string" ? query.id : "";
  return <AdminLayout title="Document">{isReady && value ? <DocumentView documentId={value} /> : null}</AdminLayout>;
};

export default Page;
