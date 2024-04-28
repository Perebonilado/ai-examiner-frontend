import React, { FC } from "react";
import Image from "next/image";
import c from "classnames";
import s from "./styles.module.css";

interface Props {
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
    <div className={rootClassName}>
      {imageUrl ? (
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
      ) : (
        <p className={`font-bold ${size === "lg" ? "text-4xl" : "text-lg"}`}>
          {fallBack.toUpperCase()}
        </p>
      )}
    </div>
  );
};

export default Avatar;
