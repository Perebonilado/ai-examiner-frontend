import React, { ElementRef, FC, useState } from "react";
import Avatar from "./Avatar";
import UserManagementPopUp from "./UserManagementPopUp";
import useClickOutside from "@/hooks/useClickOutside";
import { useGetUserProfileQuery } from "@/api-services/user.service";
import { useModalContext } from "@/contexts/ModalContext";

interface Props {
  pageTitle: string;
}

const UserManagementBar: FC<Props> = ({ pageTitle }) => {
  const [isPopUp, setIsPopUp] = useState(false);

  const popUpContainer = useClickOutside<ElementRef<"div">>(() => {
    setIsPopUp(false);
  });

  const { data } = useGetUserProfileQuery("");

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
            imageUrl="https://avatar.iran.liara.run/public/49"
            size="md"
            alt="user image"
            slateBg={false}
            onClick={() => {
              setIsPopUp(!isPopUp);
            }}
          />
          {data && <UserManagementPopUp {...data} isOpen={isPopUp} />}
        </div>
      </div>
    </section>
  );
};

export default UserManagementBar;
