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
    `flex items-center gap-3 py-2 px-4 font-semibold text-sm cursor-pointer`,
    {
      "bg-black text-white rounded-full": isActive,
    }
  );
  return (
    <Link href={link}>
      <div className={styling}>
        <span style={{ fill: isActive ? "lightgrey" : "black" }}>{icon}</span>
        <p>{title}</p>
      </div>
    </Link>
  );
};

export default SidebarItem;
