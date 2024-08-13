import React, { FC } from "react";

interface Props {
  data: [string, string];
}

const AccountSettingsInformationItem: FC<Props> = ({
  data: [title, value],
}) => {
  return (
    <div>
      <div className="flex iems center gap-x-5 gap-y-1 w-full max-w-[450px] text-sm">
        <p style={{ flex: 1 }} className="font-medium">
          {title}
        </p>
        <p style={{ flex: 1 }} className="text-gray-400">
          {value}
        </p>
      </div>
    </div>
  );
};

export default AccountSettingsInformationItem;
