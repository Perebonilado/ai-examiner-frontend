import { FooterLink } from "@/models/footer.model";
import Link from "next/link";
import React, { FC } from "react";

interface Props extends FooterLink {}

const FooterLinksContainer: FC<Props> = ({ links, title, type }) => {
  return (
    <div>
      <p className="text-[#939393]">{title.toUpperCase()}</p>
      <div className="flex flex-col gap-3 mt-4 text-sm">
        {links.map((link, idx) => {
          if (type === "link") {
            return (
              <Link href={link.link} key={idx}>
                <p>{link.title}</p>
              </Link>
            );
          } else if (type === "email") {
            return <a href={`mailto:${link.link}`}>{link.title}</a>;
          } else {
            return <p>{link.title}</p>;
          }
        })}
      </div>
    </div>
  );
};

export default FooterLinksContainer;
