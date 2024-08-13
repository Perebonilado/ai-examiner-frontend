import { useGetUserProfileQuery } from "@/api-services/user.service";
import useClickOutside from "@/hooks/useClickOutside";
import React, { ElementRef, FC, useState } from "react";
import Avatar from "./Avatar";
import UserManagementPopUp from "./UserManagementPopUp";

const UserManagementBox: FC = () => {
  const [isPopUp, setIsPopUp] = useState(false);

  const popUpContainer = useClickOutside<ElementRef<"div">>(() => {
    setIsPopUp(false);
  });

  const { data } = useGetUserProfileQuery("");

  return (
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
  );
};

export default UserManagementBox;
