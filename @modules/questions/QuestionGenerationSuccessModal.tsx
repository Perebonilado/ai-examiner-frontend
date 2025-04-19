import Button from "@/@shared/ui/Button";
import React, { FC } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ProgressBar from "@ramonak/react-progress-bar";
import CloseIcon from "@/icons/CloseIcon";

const fadeVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

interface Props {
  percentageLoading: number;
  handleStartTest: () => void;
  handleClose: () => void;
}

const QuestionGenerationSuccessModal: FC<Props> = ({
  handleStartTest,
  percentageLoading,
  handleClose
}) => {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed w-screen h-screen top-0 left-0 z-[1000] flex items-center justify-center"
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
        <div className="md:max-w-[450px] max-w-[95vw] w-[90vw] flex flex-col items-center justify-center bg-white py-14 max-h-[90vh] rounded-xl relative">
          <button className="absolute top-5 right-5" onClick={handleClose}>
            <CloseIcon />
          </button>
          <p className="text-center px-3 text-2xl font-semibold tracking-wide text-gray-800">
            {"Your test is ready!"}
          </p>
          <p className="text-sm text-center text-gray-500 leading-relaxed max-w-xs mt-1">
            {"You may begin your test."}
          </p>

          <div className="px-8 mt-4 mb-8 w-full">
            <ProgressBar
              completed={percentageLoading}
              height="6px"
              customLabel=" "
            />
          </div>

          <div className="mt-6">
            <Button
              title="Start Test"
              size="large"
              className="mt-4"
              onClick={handleStartTest}
              fullWidth
            />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default QuestionGenerationSuccessModal;
