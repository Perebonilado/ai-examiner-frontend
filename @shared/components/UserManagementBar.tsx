import React, { ElementRef, FC, useState } from "react";
import Avatar from "./Avatar";
import UserManagementPopUp from "./UserManagementPopUp";
import useClickOutside from "@/hooks/useClickOutside";

interface Props {
  pageTitle: string;
}

const UserManagementBar: FC<Props> = ({ pageTitle }) => {
  const [isPopUp, setIsPopUp] = useState(false);

  const popUpContainer = useClickOutside<ElementRef<"div">>(() => {
    setIsPopUp(false);
  });

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
          <UserManagementPopUp
            firstName="Perebonilado"
            lastName="Eradiri"
            email="perebonilado@gmail.com"
            isOpen={isPopUp}
          />
        </div>
      </div>
    </section>
  );
};

export default UserManagementBar;
