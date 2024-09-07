import React, { ElementRef, FC } from "react";
import Button from "../ui/Button";
import useClickOutside from "@/hooks/useClickOutside";
import { useModalContext } from "@/contexts/ModalContext";
import { useRouter } from "next/router";
import Dialog from "./Dialog";

interface Props {
  title?: string;
  body?: string;
}

const MaxGenerationModal: FC<Props> = ({
  title = "Max Generation Reached!",
  body = "Please, upgrade your plan to continue generating questions",
}) => {
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
        <h1 className="text-lg font-bold text-center">{title}</h1>
        <div>
          <p className="text-base text-center">{body}</p>
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
