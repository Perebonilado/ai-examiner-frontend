import { NextPage } from "next";
import { useRouter } from "next/router";
import AdminLayout from "@/@modules/admin/AdminLayout";
import UserDetailView from "@/@modules/admin/UserDetailView";

const AdminUserPage: NextPage = () => {
  const { query, isReady } = useRouter();
  const id = typeof query.id === "string" ? query.id : "";
  return (
    <AdminLayout title="User">
      {isReady && id ? <UserDetailView id={id} /> : null}
    </AdminLayout>
  );
};

export default AdminUserPage;
