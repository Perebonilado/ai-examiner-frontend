import React, { FC, PropsWithChildren } from "react";
import { motion } from "framer-motion";

const ScaleAndUp: FC<PropsWithChildren> = ({ children }) => {
  return (
    <motion.div
      initial={{ scale: 0.7, }}
      whileInView={{ scale: 1, transition: { duration: 0.2 } }}
      viewport={{ once: true }}
    >
      {children}
    </motion.div>
  );
};

export default ScaleAndUp;
