import React, { FC } from "react";
import UserManagementBox from "./UserManagementBox";

interface Props {
  pageTitle: string;
}

const UserManagementBar: FC<Props> = ({ pageTitle }) => {
  return (
    <section className="flex items-center mt-7">
      <div style={{ flex: 1 }}>
        <h2 className="text-2xl font-bold">{pageTitle}</h2>
      </div>
      <div style={{ flex: 1 }} className="flex justify-end items-center">
        <UserManagementBox />
      </div>
    </section>
  );
};

export default UserManagementBar;
