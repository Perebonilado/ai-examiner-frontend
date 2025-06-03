import Link from "next/link";
import React, { forwardRef } from "react";
import Button from "../ui/Button";
import { logout } from "@/utils";
import cn from "classnames";

interface Props {
  firstName: string;
  lastName: string;
  email: string;
  isOpen: boolean;
  position?: string;
  showSignOut?: boolean;
}

const UserManagementPopUp = forwardRef<HTMLDivElement, Props>(
  (
    {
      firstName,
      lastName,
      email,
      isOpen,
      position = "top-full right-0",
      showSignOut = true,
    },
    ref
  ) => {
    const baseStyles = cn(
      `w-[240px] p-4 shadow-md bg-white rounded-lg absolute ${position} z-[800]`,
      {
        ["block"]: isOpen,
        ["hidden"]: !isOpen,
      }
    );

    return (
      <div className={baseStyles} ref={ref}>
        <div className="pb-8">
          <p className="text-sm font-bold">
            {firstName} {lastName}
          </p>
          <p className="text-xs text-gray-400">{email}</p>
        </div>

        <div
          className={cn(
            "flex flex-col gap-y-3 pb-[12px]",
            {
              ["border-b border-b-gray-200"]: showSignOut,
            }
          )}
        >
          <Link href={"/account/profile"}>
            <Button
              title="View Profile"
              variant="text"
              size="small"
              className="!text-black"
            />
          </Link>
          <Link href={"/account/settings"}>
            <Button
              title="Manage your subscription"
              variant="text"
              size="small"
              className="!text-black"
            />
          </Link>
          {/* <Link href={""}>
            <Button
              title="Support"
              variant="text"
              size="small"
              className="!text-black"
            />
          </Link> */}
        </div>
        {showSignOut && (
          <div className="pt-[12px]">
            <Button
              title="Log out"
              variant="text"
              size="small"
              className="!text-black"
              onClick={() => {
                logout(() => {
                  window.location.pathname = "/auth/login";
                });
              }}
            />
          </div>
        )}
      </div>
    );
  }
);

export default UserManagementPopUp;
