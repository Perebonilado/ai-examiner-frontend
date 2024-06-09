import React, { FC, HTMLAttributes, PropsWithChildren } from "react";

interface Props extends HTMLAttributes<HTMLDivElement> {}

const Container: FC<PropsWithChildren<Props>> = ({ children, ...props }) => {
  return (
    <div
      className={`w-full max-w-screen-2xl mx-auto px-10 max-sm:px-2 ${props.className}`}
    >
      {children}
    </div>
  );
};

export default Container;