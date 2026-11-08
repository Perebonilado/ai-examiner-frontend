import { X } from "lucide-react";
import React, { FC, forwardRef, PropsWithChildren } from "react";
import { useModalContext } from "@/contexts/ModalContext";
import { AnimatePresence, motion } from "framer-motion";

const fadeVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

interface Props {
  handleClose?: () => void;
}

const Dialog = forwardRef<HTMLDivElement, PropsWithChildren<Props>>(
  ({ children, handleClose }, ref) => {
    const { setModalContent } = useModalContext();
    return (
      <AnimatePresence mode="wait">
        <motion.div
          className="w-full relative max-w-[420px] max-md:max-w-[340px] max-sm:max-w-[95vw] rounded-2xl shadow-pop border border-edge p-6 pt-12 flex flex-col gap-8 items-center justify-center bg-surface"
          ref={ref}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={fadeVariants}
          transition={{ duration: 0.3 }}
        >
          <button
            type="button"
            aria-label="Close"
            className="absolute top-4 right-4 cursor-pointer w-8 h-8 grid place-items-center rounded-lg text-subtle hover:bg-hover"
            onClick={() => {
              handleClose && handleClose();
              setModalContent(null);
            }}
          >
            <X size={18} strokeWidth={1.75} aria-hidden="true" />
          </button>
          <section className="pt-4">{children}</section>
        </motion.div>
      </AnimatePresence>
    );
  }
);

export default Dialog;
