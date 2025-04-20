import React, { FC, PropsWithChildren } from "react";

interface Props {
  title: string;
  description: string;
  handleClick?: () => void;
}

const AdditionalSettingsItem: FC<PropsWithChildren<Props>> = ({
  description,
  title,
  children,
  handleClick
}) => {
  return (
    <div className="flex items-center gap-8 cursor-pointer" onClick={handleClick}>
      <div style={{ flex: 3 }}>
        <p className="font-semibold mb-1">{title}</p>
        <p className="text-xs">{description}</p>
      </div>

      <div style={{ flex: 1 }} className="flex items-center justify-end">
        {children}
      </div>
    </div>
  );
};

export default AdditionalSettingsItem;
