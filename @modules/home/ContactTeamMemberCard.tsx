import Button from "@/@shared/ui/Button";
import ArrowDiagonalRightIcon from "@/icons/ArrowDiagonalRightIcon";
import Image from "next/image";
import React, { FC } from "react";

interface Props {
  name: string;
  image: string;
  body: string;
  actionType: "call" | "text";
  phone?: string;
  messageLink?: string;
  actionText: string;
  title: string;
}

const ContactTeamMemberCard: FC<Props> = ({
  actionText,
  actionType,
  body,
  image,
  name,
  messageLink,
  phone,
  title
}) => {
  return (
    <div className="w-full max-w-[300px] h-[400px] shadow-lg flex flex-col p-4 rounded-xl">
      <div style={{ flex: 1 }} className="flex items-center justify-center">
        <div className="w-[150px] h-[150px] rounded-full relative overflow-hidden">
          <Image
            layout="fill"
            objectFit="cover"
            objectPosition="100% 50%"
            src={image}
            alt={name}
          />
        </div>
      </div>
      <div
        style={{ flex: 1 }}
        className="flex flex-col items-center justify-center gap-3 text-center"
      >
        <div>
          <p className="font-medium">{name}</p>
          {/* <p className="text-xs text-gray-400">{title}</p> */}
        </div>
        <p className="text-xs mb-3">{body}</p>

        {actionType === "text" && (
          <a href={messageLink}>
            <Button
              title={actionText}
              endicon={<ArrowDiagonalRightIcon fill="#1B8FF9" />}
              variant="text"
              size="small"
              className="!text-[#1B8FF9]"
            />
          </a>
        )}

        {actionType === "call" && (
          <a href={`tel:${phone}`}>
            <Button
              title={actionText}
              endicon={<ArrowDiagonalRightIcon fill="#1B8FF9" />}
              variant="text"
              size="small"
              className="!text-[#1B8FF9]"
            />
          </a>
        )}
      </div>
    </div>
  );
};

export default ContactTeamMemberCard;
