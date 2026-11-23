import { NextPage } from "next";
import { useRouter } from "next/router";
import AdminLayout from "@/@modules/admin/AdminLayout";
import ConversationView from "@/@modules/admin/insights/ConversationView";

const Page: NextPage = () => {
  const { query, isReady } = useRouter();
  const value = typeof query.key === "string" ? query.key : "";
  return <AdminLayout title="Conversation">{isReady && value ? <ConversationView conversationKey={value} /> : null}</AdminLayout>;
};

export default Page;
