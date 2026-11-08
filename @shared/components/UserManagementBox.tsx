import { useGetUserProfileQuery } from "@/api-services/user.service";
import useClickOutside from "@/hooks/useClickOutside";
import React, { ElementRef, FC, useState } from "react";
import cn from "classnames";
import UserManagementPopUp from "./UserManagementPopUp";

/** Account button (initials) that opens the account menu below it. */
const UserManagementBox: FC = () => {
  const [isPopUp, setIsPopUp] = useState(false);

  const popUpContainer = useClickOutside<ElementRef<"div">>(() => {
    setIsPopUp(false);
  });

  const { data } = useGetUserProfileQuery("");
  const initial = data?.firstName?.trim().charAt(0).toUpperCase() || "U";

  return (
    <div
      className="flex items-center justify-end relative"
      ref={popUpContainer}
    >
      <button
        type="button"
        aria-label="Account"
        aria-haspopup="menu"
        aria-expanded={isPopUp}
        title="Account"
        onClick={() => {
          setIsPopUp(!isPopUp);
        }}
        className={cn(
          "grid place-items-center w-10 h-10 rounded-lg transition-colors hover:bg-hover",
          { "bg-hover": isPopUp }
        )}
      >
        <span
          aria-hidden="true"
          className="grid h-8 w-8 place-items-center rounded-full bg-accent-100 text-xs font-bold text-accent-900"
        >
          {initial}
        </span>
      </button>
      {data && (
        <UserManagementPopUp
          {...data}
          isOpen={isPopUp}
          position="top-[calc(100%+6px)] right-0"
        />
      )}
    </div>
  );
};

export default UserManagementBox;
