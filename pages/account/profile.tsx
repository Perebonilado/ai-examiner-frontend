import PersonalInformationContainer from "@/@modules/account/PersonalInformationContainer";
import AppHead from "@/@shared/components/AppHead";
import { useGetUserProfileQuery } from "@/api-services/user.service";
import AppLayout from "@/layouts/AppLayout";
import React, { FC } from "react";

const Profile: FC = () => {
  const { data } = useGetUserProfileQuery("");

  return (
    <>
      <AppHead title="Profile" />
      <AppLayout>
        <div className="mt-8">
          {data && <PersonalInformationContainer {...data} />}
        </div>
      </AppLayout>
    </>
  );
};

export default Profile;
