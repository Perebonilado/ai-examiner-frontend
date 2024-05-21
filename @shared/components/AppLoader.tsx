import React, { FC } from "react";

interface Props {
  loaderMessage?: string;
}

export const AppLoader: FC<Props> = ({ loaderMessage }) => {
  return (
    <div className="flex flex-col gap-4 justify-center items-center h-screen fixed z-[8000] top-0 left-0 w-screen bg-black bg-opacity-80">
      <div className="border-8 border-solid border-gray-300 border-t-[#2F004F] rounded-full w-12 h-12 animate-spin"></div>
      {loaderMessage && (
        <p className="w-full max-w-[500px] px-3 mx-auto text-center max-md:text-sm font-semibold text-white">
          {loaderMessage}
        </p>
      )}
    </div>
  );
};
