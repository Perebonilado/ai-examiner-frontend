import React, { FC } from "react";

interface Props {
  img: string;
}

const TwitterReviewCard: FC<Props> = ({ img }) => {
  return (
    <div
      style={{ boxShadow: "0 3px 8px 0 #F2E1FF" }}
      className="flex-shrink-0 w-[300px] sm:w-[350px] md:w-[400px] h-[200px] sm:h-[225px] md:h-[250px] rounded-xl shadow-md overflow-hidden bg-white"
    >
      <img
        src={img}
        alt="Twitter review"
        className="w-full h-full object-contain"
      />
    </div>
  );
};

export default TwitterReviewCard;
