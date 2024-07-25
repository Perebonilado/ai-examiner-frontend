import React, { FC } from "react";
import Image from "next/image";
import c from "classnames";
import s from "./styles.module.css";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
  imageUrl?: string;
  fallBack: string;
  shape?: "round" | "square";
  allowEnlarge?: boolean;
  alt: string;
  slateBg?: boolean;
}

const Avatar: FC<Props> = ({
  size = "md",
  imageUrl,
  fallBack,
  shape = "round",
  alt,
  slateBg = true,
  ...props
}) => {
  const rootClassName = c(s.root, {
    [s.sm]: size === "sm",
    [s.md]: size === "md",
    [s.lg]: size === "lg",
    [s.round]: shape === "round",
    [s.square]: shape === "square",
    [s.slateBg]: slateBg === true,
  });

  return (
    <div className={rootClassName} {...props}>
      {imageUrl ? (
        <div className="w-full h-full relative rounded-full overflow-hidden">
          <Image
            layout="fill"
            objectFit="cover"
            objectPosition="50% 50%"
            style={{
              cursor: "pointer",
            }}
            src={imageUrl}
            alt={alt}
          />
        </div>
      ) : (
        <p
          className={`font-bold border border-rose-700 ${
            size === "lg" ? "text-4xl" : "text-lg"
          }`}
        >
          {fallBack.toUpperCase()}
        </p>
      )}
    </div>
  );
};

export default Avatar;
