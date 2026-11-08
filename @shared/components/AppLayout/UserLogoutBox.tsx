import React, { ElementRef, FC, useState } from "react";
import { LogOut } from "lucide-react";
import cn from "classnames";
import { useGetUserProfileQuery } from "@/api-services/user.service";
import useClickOutside from "@/hooks/useClickOutside";
import UserManagementPopUp from "../UserManagementPopUp";
import { logout } from "@/utils";
import UserInitials from "./UserInitials";

interface Props {
  collapsed?: boolean;
}

/** Sidebar footer: initials avatar, name and a log-out button; the avatar opens the account menu. */
const UserLogoutBox: FC<Props> = ({ collapsed = false }) => {
  const { data } = useGetUserProfileQuery("");
  const [isPopUp, setIsPopUp] = useState(false);

  const popUpContainer = useClickOutside<ElementRef<"div">>(() => {
    setIsPopUp(false);
  });

  if (!data) return null;

  const handleLogout = () => {
    logout(() => {
      window.location.pathname = "/auth/login";
    });
  };

  return (
    <div className="relative mt-auto w-full pt-3" ref={popUpContainer}>
      <UserManagementPopUp
        {...data}
        isOpen={isPopUp}
        position={
          collapsed
            ? "bottom-0 left-[calc(100%+12px)]"
            : "bottom-[calc(100%+6px)] left-0"
        }
        showSignOut={collapsed}
      />

      <div
        className={cn(
          "flex items-center gap-2.5 rounded-xl transition-colors",
          collapsed ? "justify-center p-1.5" : "p-2 hover:bg-hover",
          { "bg-hover": isPopUp }
        )}
      >
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={isPopUp}
          title="Account"
          onClick={() => setIsPopUp(!isPopUp)}
          className="flex min-w-0 flex-1 items-center gap-2.5 rounded-lg text-left"
        >
          <UserInitials name={data.firstName} />
          {!collapsed && (
            <span className="min-w-0 flex-1">
              <b className="block truncate text-[13px] font-semibold text-ink">
                {data.firstName}
              </b>
              <span className="block truncate text-xs text-muted">Account</span>
            </span>
          )}
        </button>

        {!collapsed && (
          <button
            type="button"
            aria-label="Log out"
            title="Log out"
            onClick={handleLogout}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-subtle transition-colors hover:bg-surface hover:text-ink"
          >
            <LogOut size={16} strokeWidth={1.75} aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
};

export default UserLogoutBox;
