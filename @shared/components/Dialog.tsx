import CloseIcon from "@/icons/CloseIcon";
import React, { FC, forwardRef, PropsWithChildren } from "react";
import { useModalContext } from "@/contexts/ModalContext";
import { AnimatePresence, motion } from "framer-motion";

const fadeVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const Dialog = forwardRef<HTMLDivElement, PropsWithChildren>(
  ({ children }, ref) => {
    const { setModalContent } = useModalContext();
    return (
      <AnimatePresence mode="wait">
        <motion.div
          className="w-full relative max-w-[400px] max-md:max-w-[320px] max-sm:max-w-[95vw] rounded-xl shadow-lg p-4 py-14 flex flex-col gap-10 items-center justify-center bg-white"
          ref={ref}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={fadeVariants}
          transition={{ duration: 0.3 }}
        >
          <button
            className="absolute top-5 right-5 cursor-pointer"
            onClick={() => {
              setModalContent(null);
            }}
          >
            <CloseIcon />
          </button>
          <section className="pt-4">{children}</section>
        </motion.div>
      </AnimatePresence>
    );
  }
);

export default Dialog;
