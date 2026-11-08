import React, { FC } from "react";
import UserManagementBox from "./UserManagementBox";

interface Props {
  pageTitle: string;
}

const UserManagementBar: FC<Props> = ({ pageTitle }) => {
  return (
    <section className="flex items-center gap-4 mt-7">
      <div className="flex-1 min-w-0">
        <h2 className="text-2xl font-bold tracking-[-0.02em] text-ink truncate">
          {pageTitle}
        </h2>
      </div>
      <div className="flex justify-end items-center">
        <UserManagementBox />
      </div>
    </section>
  );
};

export default UserManagementBar;
