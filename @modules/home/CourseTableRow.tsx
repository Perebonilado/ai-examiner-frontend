import Button from "@/@shared/ui/Button";
import Link from "next/link";
import React, { FC } from "react";

interface Props {
  title: string;
  description: string;
  topicCount: number;
  createdAt: Date;
}

const CourseTableRow: FC<Props> = ({
  createdAt,
  description,
  title,
  topicCount,
}) => {
  return (
    <div className="flex items-center text-sm  text-gray-700 w-full gap-6 border-b border-b-gray-200 px-3 py-4">
      <div style={{ flex: 1 }}>
        <Link href={"/topics/3"}>
          <p className="text-[#007bff] underline">{title}</p>
        </Link>
      </div>
      <div style={{ flex: 2 }}>{description}</div>
      <div style={{ flex: 1 }}>{topicCount}</div>
      <div style={{ flex: 1 }}>{createdAt.toDateString()}</div>
      <div style={{ flex: 1 }} className="flex items-center gap-3">
        <Button title="Edit" size="small" />
        <Button
          title="Delete"
          size="small"
          className="!bg-rose-600 !border-rose-600"
        />
      </div>
    </div>
  );
};

export default CourseTableRow;
