import { AppLoader } from "@/@shared/components/AppLoader";
import ConfirmationDialog from "@/@shared/components/ConfirmationDialog";
import Dialog from "@/@shared/components/Dialog";
import Button from "@/@shared/ui/Button";
import { useDeleteQuestionMutation } from "@/api-services/questions.service";
import { useModalContext } from "@/contexts/ModalContext";
import useClickOutside from "@/hooks/useClickOutside";
import React, { ElementRef, FC, useEffect } from "react";
import { toast } from "react-toastify";

interface Props {
  questionId: string;
}

const DeleteQuestionConfirmation: FC<Props> = ({ questionId }) => {
  const { setModalContent } = useModalContext();
  const ref = useClickOutside<ElementRef<"div">>(() => {
    setModalContent(null);
  });

  const [deleteQuestion, { isSuccess, isLoading, error }] =
    useDeleteQuestionMutation();

  useEffect(() => {
    if (error && "status" in error) {
      if ("data" in error) {
        const { message } = error.data as { message: string };
        toast.error(message);
      } else toast.error("Oops! Something went wrong");
    }
  }, [error]);

  //   useEffect(() => {
  //     if (isLoading) {
  //       setModalContent(<AppLoader loaderMessage="Deleting Questions" />);
  //     }
  //   }, [isLoading]);

  useEffect(() => {
    if (isSuccess) {
      setModalContent(null);
      toast.success("Question Successfully deleted");
      setModalContent(null);
    }
  }, [isSuccess]);

  return (
    <ConfirmationDialog
      title="Delete Questions ?"
      message="This can't be undone"
      confirmationText="Delete"
      onConfirm={() => {
        deleteQuestion({ questionId });
      }}
    />
    // <Dialog ref={ref}>
    //   <div
    //     className="w-full flex flex-col gap-5 justify-center bg-white"
    //     ref={ref}
    //   >
    //     <h1 className="text-lg font-bold text-center">
    //       Are you sure you want to delete these set of questions?
    //     </h1>

    //     <div className="flex gap-2">
    //       <Button
    //         title="Yes"
    //         fullWidth
    //         variant="contained"
    //         size="large"
    //         onClick={() => {
    //           deleteQuestion({ questionId });
    //         }}
    //       />
    //       <Button
    //         title="No"
    //         onClick={() => {
    //           setModalContent(null);
    //         }}
    //         fullWidth
    //         variant="outlined"
    //         size="large"
    //       />
    //     </div>
    //   </div>
    // </Dialog>
  );
};

export default DeleteQuestionConfirmation;
