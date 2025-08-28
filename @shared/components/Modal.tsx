import { AnimatePresence, motion } from "framer-motion";
import React, { FC, PropsWithChildren } from "react";

const fadeVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const Modal: FC<PropsWithChildren> = ({ children }) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        className="fixed w-screen h-screen top-0 bottom-0 left-0 z-[1000] flex items-center justify-center"
        style={{
          backdropFilter: "blur(1.5px)",
          background: "rgba(0, 0, 0, 0.384)",
        }}
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={fadeVariants}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default Modal;
