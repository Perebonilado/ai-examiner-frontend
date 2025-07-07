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
  username?: string;
  showUsername?: boolean;
}

const Avatar: FC<Props> = ({
  size = "md",
  imageUrl,
  fallBack,
  shape = "round",
  alt,
  slateBg = true,
  username = "",
  showUsername = false,
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
    <div className="flex items-center gap-3 cursor-pointer" {...props}>
      <div className={rootClassName}>
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

      {showUsername && (
        <div className="text-white">
          <p className="max-w-[100px] truncate text-ellipsis font-semibold text-sm m-0">
            {username}
          </p>
        </div>
      )}
    </div>
  );
};

export default Avatar;
