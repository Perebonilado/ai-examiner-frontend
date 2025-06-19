import Link from "next/link";
import React, { forwardRef } from "react";
import Button from "../ui/Button";
import { logout } from "@/utils";
import cn from "classnames";
import { useModalContext } from "@/contexts/ModalContext";
import UpgradeAccountForm from "./UpgradeAccountForm";

interface Props {
  firstName: string;
  lastName: string;
  role: string;
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
      role,
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

    const { setModalContent } = useModalContext()

    return (
      <div className={baseStyles} ref={ref}>
        <div
          className={cn({
            ["pb-8"]: role.toLowerCase() !== "guest",
            ["pb-3"]: role.toLowerCase() == "guest",
          })}
        >
          <p className="text-sm font-bold">
            {firstName} {role.toLowerCase() === "guest" ? "" : lastName}
          </p>
          {role.toLowerCase() !== "guest" && (
            <p className="text-xs text-gray-400">{email}</p>
          )}
        </div>

        <div
          className={cn("flex flex-col gap-y-3 pb-[12px]", {
            ["border-b border-b-gray-200"]: showSignOut,
          })}
        >
          {role.toLowerCase() == "guest" && (
            <Button
              title="Upgrade Account"
              variant="contained"
              size="small"
              onClick={()=>{
                setModalContent(<UpgradeAccountForm />)
              }}
            />
          )}
          {role.toLowerCase() !== "guest" && (
            <Link href={"/account/profile"}>
              <Button
                title="View Profile"
                variant="text"
                size="small"
                className="!text-black"
              />
            </Link>
          )}
          {role.toLowerCase() !== "guest" && (
            <Link href={"/account/settings"}>
              <Button
                title="Manage your subscription"
                variant="text"
                size="small"
                className="!text-black"
              />
            </Link>
          )}
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
