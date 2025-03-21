import React, { FC } from "react";

const GetMinutesInfoCard: FC = () => {
  return (
    <div className="p-4 pt-6 bg-[#F4F4F4] min-h-[230px] rounded-lgy">
      <h2 className="text-2xl font-bold">Get more minutes</h2>
      <p className="mt-4 text-sm leading-relaxed">
        To participate in viva calls and connect with the AI on our platform,
        you'll need credits. It's important to manage these credits carefully,
        as they are consumed based on the duration of your calls.
      </p>
    </div>
  );
};

export default GetMinutesInfoCard;
