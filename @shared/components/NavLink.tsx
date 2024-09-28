import Link from "next/link";
import React, { FC } from "react";

interface Props {
  title: string;
  link: string;
  color?: string;
}

const NavLink: FC<Props> = ({ link, title, color = "black" }) => {
  return (
    <Link href={link}>
      <span style={{ color }} className="text-sm">
        {title}
      </span>
    </Link>
  );
};

export default NavLink;
