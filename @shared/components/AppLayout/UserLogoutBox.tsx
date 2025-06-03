import React, { ElementRef, FC, useState } from "react";
import Avatar from "../Avatar";
import { useGetUserProfileQuery } from "@/api-services/user.service";
import LogoutIconAlt from "@/icons/LogoutIconAlt";
import { useSelector } from "react-redux";
import { RootState } from "@/config/redux-config";
import cn from "classnames";
import useClickOutside from "@/hooks/useClickOutside";
import UserManagementPopUp from "../UserManagementPopUp";
import { logout } from "@/utils";

const UserLogoutBox: FC = () => {
  const { data } = useGetUserProfileQuery("");
  const { navOpen: isOpen } = useSelector(
    (state: RootState) => state.navigationSliceReducer
  );
  const [isPopUp, setIsPopUp] = useState(false);

  const popUpContainer = useClickOutside<ElementRef<"div">>(() => {
    setIsPopUp(false);
  });

  return !data ? null : (
    <div
      className={cn("py-10 w-full mt-auto flex items-center gap-2", {
        ["flex-col gap-4"]: !isOpen,
      })}
    >
      <div className="relative" ref={popUpContainer}>
        <Avatar
          fallBack="U"
          imageUrl="https://avatar.iran.liara.run/public/49"
          size={"sm"}
          alt="user image"
          slateBg={false}
          onClick={() => {
            setIsPopUp(!isPopUp);
          }}
        />
        <UserManagementPopUp
          {...data}
          isOpen={isPopUp}
          position="bottom-full left-full"
          showSignOut={false}
        />
      </div>
      {isOpen && (
        <div className="text-white">
          <p className="max-w-[100px] truncate text-ellipsis font-semibold text-sm">
            {data.firstName}
          </p>
        </div>
      )}

      <button
        className="ml-auto"
        onClick={() => {
          logout(() => {
            window.location.pathname = "/auth/login";
          });
        }}
      >
        <LogoutIconAlt />
      </button>
    </div>
  );
};

export default UserLogoutBox;
