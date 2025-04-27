import React, { ElementRef, FC, useRef } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import CloseIcon from "@/icons/CloseIcon";
import useClickOutside from "@/hooks/useClickOutside";

interface Props {
  imageUrl: string;
  close: () => void;
}

const EnlargedImage: FC<Props> = ({ imageUrl, close }) => {
  const ref = useClickOutside<ElementRef<"div">>(() => {
    close();
  });
  return (
    <motion.div
      initial={{ translateY: -100 }}
      whileInView={{ translateY: 0, transition: { duration: 0.3 } }}
      viewport={{ once: true }}
      ref={ref}
      className="relative w-[80%] h-[85%] rounded-lg overflow-hidden  backdrop-blur-sm bg-black"
    >
      <span
        onClick={() => close()}
        className="absolute top-5 right-10 z-30 cursor-pointer bg-[#FFFFFF] rounded-full p-1"
      >
        <CloseIcon fill="red"/>
      </span>
      <Image
        layout="fill"
        objectFit="contain"
        objectPosition="50% 50%"
        src={imageUrl}
        alt={""}
      />
    </motion.div>
  );
};

export default EnlargedImage;
