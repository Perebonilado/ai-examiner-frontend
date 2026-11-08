import React, { FC, PropsWithChildren } from "react";
import AccountSettingsInformationItem from "./AccountSettingsInformationItem";
import AccountSection from "./AccountSection";

interface Props {
  title: string;
  data: [string, string][];
}

// A titled settings section: key / value rows in a bordered box, actions in its footer
const AccountSettingInformationItemContainer: FC<PropsWithChildren<Props>> = ({
  title,
  data,
  children,
}) => {
  const rows = (data || []).filter(([key]) => Boolean(key));
  const id = `acct-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

  return (
    <AccountSection title={title} id={id}>
      <div className="rounded-xl border border-edge bg-surface shadow-xs">
        <dl className="m-0">
          {rows.map((d, idx) => (
            <AccountSettingsInformationItem data={d} key={idx} />
          ))}
        </dl>
        {children && (
          <div className="flex flex-col-reverse items-stretch gap-2.5 rounded-b-xl border-t border-line bg-canvas p-3 md:flex-row md:flex-wrap md:items-center md:justify-end md:px-4 md:py-3">
            {children}
          </div>
        )}
      </div>
    </AccountSection>
  );
};

export default AccountSettingInformationItemContainer;
