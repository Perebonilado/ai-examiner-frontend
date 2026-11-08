import React, { ElementRef, FC } from "react";
import Button from "../ui/Button";
import useClickOutside from "@/hooks/useClickOutside";
import { useModalContext } from "@/contexts/ModalContext";
import { useRouter } from "next/router";
import Dialog from "./Dialog";
import { Gauge } from "lucide-react";

interface Props {
  title?: string;
  body?: string;
  handleClose?: () => void;
}

const MaxGenerationModal: FC<Props> = ({
  title = "You've hit the limit!",
  body = "An upgrade is required to generate further questions",
  handleClose,
}) => {
  const { setModalContent } = useModalContext();
  const ref = useClickOutside<ElementRef<"div">>(() => {
    handleClose && handleClose();
    setModalContent(null);
  });
  const router = useRouter();
  return (
    <Dialog ref={ref} handleClose={handleClose}>
      <div
        className="-mt-8 w-full flex flex-col items-center text-center bg-surface"
        ref={ref}
      >
        <span className="grid place-items-center w-[52px] h-[52px] mb-4 rounded-full bg-warning-bg text-warning">
          <Gauge size={22} strokeWidth={1.75} aria-hidden />
        </span>
        <h2 className="text-xl font-bold tracking-[-0.02em] text-ink [text-wrap:balance]">
          {title}
        </h2>
        <p className="mt-1.5 text-[15px] leading-normal text-subtle [text-wrap:balance]">
          {body}
        </p>

        <div className="mt-[22px] w-full">
          <Button
            title="Upgrade plan"
            onClick={() => {
              router.push("/pricing");
              handleClose && handleClose();
            }}
            size="large"
            fullWidth
          />
        </div>
      </div>
    </Dialog>
  );
};

export default MaxGenerationModal;
