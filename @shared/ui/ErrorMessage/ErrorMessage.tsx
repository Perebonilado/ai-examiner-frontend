import React, { FC, HTMLAttributes } from "react";
import cn from "classnames";

interface Props extends HTMLAttributes<HTMLParagraphElement> {
  message: string;
}

const ErrorMessage: FC<Props> = ({ message, ...props }) => {
  const rootClassName = cn(`text-rose-500 text-xs`, props.className);
  return <p className={rootClassName}>{message}</p>;
};

export default ErrorMessage;
