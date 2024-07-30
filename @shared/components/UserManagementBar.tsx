import React, { ElementRef, FC, useEffect, useState } from "react";
import Avatar from "./Avatar";
import UserManagementPopUp from "./UserManagementPopUp";
import useClickOutside from "@/hooks/useClickOutside";
import { useGetUserProfileQuery } from "@/api-services/user.service";
import { useModalContext } from "@/contexts/ModalContext";
import { toast } from "react-toastify";
import { AppLoader } from "./AppLoader";

interface Props {
  pageTitle: string;
}

const UserManagementBar: FC<Props> = ({ pageTitle }) => {
  const [isPopUp, setIsPopUp] = useState(false);

  const popUpContainer = useClickOutside<ElementRef<"div">>(() => {
    setIsPopUp(false);
  });

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
    <section className="flex items-center mt-7">
      <div style={{ flex: 1 }}>
        <h2 className="text-2xl font-bold">{pageTitle}</h2>
      </div>
      <div style={{ flex: 1 }} className="flex justify-end items-center">
        <div
          className="flex items-center justify-end relative"
          ref={popUpContainer}
        >
          <Avatar
            fallBack="U"
            imageUrl="/home/me.jpg"
            size="md"
            alt="user image"
            slateBg={false}
            onClick={() => {
              setIsPopUp(!isPopUp);
            }}
          />
          {data && <UserManagementPopUp
            {...data}
            isOpen={isPopUp}
          />}
        </div>
      </div>
    </section>
  );
};

export default UserManagementBar;
