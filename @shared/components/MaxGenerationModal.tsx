import React, { ElementRef, FC } from "react";
import Button from "../ui/Button";
import useClickOutside from "@/hooks/useClickOutside";
import { useModalContext } from "@/contexts/ModalContext";
import { useRouter } from "next/router";
import Dialog from "./Dialog";

const MaxGenerationModal: FC = () => {
  const { setModalContent } = useModalContext();
  const ref = useClickOutside<ElementRef<"div">>(() => {
    setModalContent(null);
  });
  const router = useRouter();
  return (
    <Dialog ref={ref}>
      <div
        className="w-full flex flex-col gap-5 justify-center bg-white"
        ref={ref}
      >
        <h1 className="text-lg font-bold text-center">
          Max Generation Reached!
        </h1>
        <div>
          <p className="text-base text-center">
            Please, upgrade your plan to continue generating questions
          </p>
        </div>

        <Button
          title="Upgrade Plan"
          onClick={() => router.push("/pricing")}
          size="large"
        />
      </div>
    </Dialog>
  );
};

export default MaxGenerationModal;
