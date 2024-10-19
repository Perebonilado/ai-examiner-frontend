import React, { FC, PropsWithChildren } from "react";
import { motion } from "framer-motion";

interface Props {
  className?: string;
}

const TransitionLeft: FC<PropsWithChildren<Props>> = ({
  children,
  className = "",
}) => {
  return (
    <motion.div
      initial={{ translateX: 20 }}
      whileInView={{ translateX: 0, transition: { duration: 0.8 } }}
      viewport={{ once: true }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default TransitionLeft;
