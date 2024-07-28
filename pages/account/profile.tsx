import PersonalInformationContainer from "@/@modules/account/PersonalInformationContainer";
import AppHead from "@/@shared/components/AppHead";
import UserManagementBar from "@/@shared/components/UserManagementBar";
import AppLayout from "@/layouts/AppLayout";
import React, { FC } from "react";

const Profile: FC = () => {
  return (
    <>
      <AppHead title="Profile" />
      <AppLayout>
        <UserManagementBar pageTitle="Edit Profile" />
        <div className="mt-8">
          <PersonalInformationContainer
            firstName="Perebonilado"
            lastName="Eradiri"
            email="perebonilado@gmail.com"
          />
        </div>
      </AppLayout>
    </>
  );
};

export default Profile;
