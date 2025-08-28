import React, { ElementRef, FC } from "react";
import Button from "../ui/Button";
import useClickOutside from "@/hooks/useClickOutside";
import { useModalContext } from "@/contexts/ModalContext";
import { useRouter } from "next/router";
import Dialog from "./Dialog";

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
        className="w-full flex flex-col gap-1 justify-center bg-white"
        ref={ref}
      >
        <h1 className="text-xl font-bold text-center">{title}</h1>
        <div className="mb-6">
          <p className="text-sm text-center">{body}</p>
        </div>

        <div className="mx-auto">
          <Button
            title="Upgrade Plan"
            onClick={() => {
              router.push("/pricing");
              handleClose && handleClose();
            }}
            size="large"
          />
        </div>
      </div>
    </Dialog>
  );
};

export default MaxGenerationModal;
