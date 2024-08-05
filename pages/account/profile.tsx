import PersonalInformationContainer from "@/@modules/account/PersonalInformationContainer";
import AppHead from "@/@shared/components/AppHead";
import UserManagementBar from "@/@shared/components/UserManagementBar";
import { useGetUserProfileQuery } from "@/api-services/user.service";
import { useModalContext } from "@/contexts/ModalContext";
import AppLayout from "@/layouts/AppLayout";
import React, { FC } from "react";

const Profile: FC = () => {
  const { data } = useGetUserProfileQuery("");

  return (
    <>
      <AppHead title="Profile" />
      <AppLayout>
        <UserManagementBar pageTitle="Profile" />
        <div className="mt-8">
          {data && <PersonalInformationContainer {...data} />}
        </div>
      </AppLayout>
    </>
  );
};

export default Profile;
