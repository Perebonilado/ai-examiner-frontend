import Link from "next/link";
import React, { FC, forwardRef } from "react";
import Button from "../ui/Button";
import { logout } from "@/utils";
import { useRouter } from "next/router";
import cn from "classnames";

interface Props {
  firstName: string;
  lastName: string;
  email: string;
  isOpen: boolean;
}

const UserManagementPopUp = forwardRef<HTMLDivElement, Props>(
  ({ firstName, lastName, email, isOpen }, ref) => {
    const router = useRouter();

    const baseStyles = cn(
      `w-[240px] p-4 shadow-md bg-white rounded-lg absolute top-full right-0`,
      {
        ["block"]: isOpen,
        ["hidden"]: !isOpen,
      }
    );

    return (
      <div className={baseStyles} ref={ref}>
        <div className="pb-8">
          <p className="text-sm font-bold">
            {lastName} {firstName}
          </p>
          <p className="text-xs text-gray-400">{email}</p>
        </div>

        <div className="flex flex-col gap-y-3 pb-[12px] border-b border-b-gray-200">
          <Link href={"/account/profile"}>
            <Button
              title="Edit Profile"
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
          <Link href={""}>
            <Button
              title="Support"
              variant="text"
              size="small"
              className="!text-black"
            />
          </Link>
        </div>
        <div className="pt-[12px]">
          <Button
            title="Log out"
            variant="text"
            size="small"
            className="!text-black"
            onClick={() => {
              logout(() => {
                router.push("/auth/login");
              });
            }}
          />
        </div>
      </div>
    );
  }
);

export default UserManagementPopUp;
