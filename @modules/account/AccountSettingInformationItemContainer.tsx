import React, { FC, PropsWithChildren } from "react";
import AccountSettingsInformationItem from "./AccountSettingsInformationItem";

interface Props {
  title: string;
  data: [string, string][];
}

const AccountSettingInformationItemContainer: FC<PropsWithChildren<Props>> = ({
  title,
  data,
  children,
}) => {
  return (
    <div>
      <h3 className="text-lg font-bold mb-8">{title}</h3>

      <div className="flex flex-col gap-6">
        {data.map((d, idx) => (
          <AccountSettingsInformationItem data={d} key={idx} />
        ))}
        <div className="flex max-sm:items-center gap-5 w-full max-w-[450px] max-sm:flex-col">
          <p style={{ flex: 1 }}></p>
          <div style={{ flex: 1 }}>{children}</div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettingInformationItemContainer;
