import React, { FC } from "react";
import cn from "classnames";
import Link from "next/link";

interface Props {
  title: string;
  isActive: boolean;
  link: string;
  icon: React.ReactNode;
}

const SidebarItem: FC<Props> = ({ title, isActive, link, icon }) => {
  const styling = cn(
    `flex items-center gap-3 py-4 pl-8 pr-2 font-semibold text-sm cursor-pointer text-white`,
    {
      "bg-[#F2E1FF] !text-black": isActive,
    }
  );
  return (
    <Link href={link}>
      <div className={styling}>
        <span style={{ fill: isActive ? "#2F004F" : "white" }}>{icon}</span>
        <p>{title}</p>
      </div>
    </Link>
  );
};

export default SidebarItem;
