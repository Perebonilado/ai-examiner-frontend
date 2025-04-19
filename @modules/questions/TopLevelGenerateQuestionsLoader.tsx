import ProgressBar from "@ramonak/react-progress-bar";
import React, { FC } from "react";
import { motion } from "framer-motion";

interface Props {
  percentageLoading: number;
}

const TopLevelGenerateQuestionsLoader: FC<Props> = ({ percentageLoading }) => {
  return (
    <motion.div
      initial={{ y: -100, opacity: 0, x: '-50%' }}
      animate={{ y: 0, opacity: 1, x: '-50%' }}
      transition={{
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1], // MUI's standard easing
      }}
      className="fixed bg-white p-3 border rounded-lg w-full max-w-[600px] max-md:max-w-[85vw] z-[5000] top-5 max-md:top-28 left-1/2 -translate-x-1/2 shadow-md"
    >
      <p className="text-xs font-bold mb-2">
        {percentageLoading < 100 ? "Preparing Test" : "Your test is ready!"}
      </p>
      <div className="flex items-center gap-2">
        <div style={{ flex: 1 }}>
          <ProgressBar
            completed={percentageLoading}
            height="6px"
            customLabel=" "
          />
        </div>
        <p className="text-xs">{percentageLoading}%</p>
      </div>
    </motion.div>
  );
};

export default TopLevelGenerateQuestionsLoader;
