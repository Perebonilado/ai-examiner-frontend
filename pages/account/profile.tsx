import PersonalInformationContainer from "@/@modules/account/PersonalInformationContainer";
import AppHead from "@/@shared/components/AppHead";
import { AppLoader } from "@/@shared/components/AppLoader";
import UserManagementBar from "@/@shared/components/UserManagementBar";
import { useGetUserProfileQuery } from "@/api-services/user.service";
import { useModalContext } from "@/contexts/ModalContext";
import AppLayout from "@/layouts/AppLayout";
import React, { FC, useEffect } from "react";
import { toast } from "react-toastify";

const Profile: FC = () => {
  const { data, isLoading, error } = useGetUserProfileQuery("");

  const { setModalContent } = useModalContext();

  useEffect(() => {
    if (error && "status" in error) {
      if ("data" in error) {
        const { message } = error.data as { message: string };
        toast.error(message);
      } else toast.error("Oops! Something went wrong");
    }
  }, [error]);

  useEffect(() => {
    if (isLoading) {
      setModalContent(<AppLoader />);
    } else {
      setModalContent(null);
    }
  }, [isLoading]);

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
