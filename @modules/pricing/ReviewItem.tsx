import FiveStarsIcon from "@/icons/FiveStarsIcon";
import React, { FC } from "react";

interface Props {
  fullname: string;
  review: string;
}

const ReviewItem: FC<Props> = ({ fullname, review }) => {
  return (
    <div className="w-[250px] h-[250px] rounded-full border border-[#9D6EC2] bg-[#F7F4FF] flex flex-col items-center pt-7 gap-3 p-6 text-center">
      <p style={{ flex: 1 }} className="text-base font-semibold">
        {fullname}
      </p>
      <div style={{ flex: 1 }}>
        <FiveStarsIcon />
      </div>
      <p style={{ flex: 4 }} className="text-xs leading-relaxed">{review}</p>
    </div>
  );
};

export default ReviewItem;
