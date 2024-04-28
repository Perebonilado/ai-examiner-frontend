import React, { FC, PropsWithChildren } from "react";

const Modal: FC<PropsWithChildren> = ({ children }) => {
  return (
    <div
      className="fixed w-screen h-screen top-0 left-0 z-[1000] flex items-center justify-center"
      style={{
        backdropFilter: "blur(2px)",
        backgroundColor: "rgba(0,0,0,.164)",
      }}
    >
      {children}
    </div>
  );
};

export default Modal;