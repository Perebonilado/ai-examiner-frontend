import React, { FC, PropsWithChildren } from "react";
import { motion } from "framer-motion";

interface Props {
  className?: string;
  style?: Object;
}

const TransitionDown: FC<PropsWithChildren<Props>> = ({
  children,
  className = "",
  style = {},
}) => {
  return (
    <motion.div
      initial={{ translateY: -20 }}
      whileInView={{ translateY: 0, transition: { duration: 0.8 } }}
      viewport={{ once: true }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
};
export default TransitionDown;
