import React, { ElementRef, FC } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { X } from "lucide-react";
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
      initial={{ opacity: 0, translateY: 12 }}
      whileInView={{ opacity: 1, translateY: 0, transition: { duration: 0.25 } }}
      viewport={{ once: true }}
      ref={ref}
      className="relative w-[80%] h-[85%] max-md:w-[calc(100vw-16px)] max-md:h-[80dvh] rounded-2xl overflow-hidden bg-ink shadow-pop"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={() => close()}
        className="absolute top-3 right-3 z-30 grid place-items-center w-9 h-9 rounded-full bg-surface text-ink shadow-xs hover:bg-well transition-colors"
      >
        <X size={18} strokeWidth={1.75} />
      </button>
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
