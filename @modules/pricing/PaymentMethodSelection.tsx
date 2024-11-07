import Dialog from "@/@shared/components/Dialog";
import Button from "@/@shared/ui/Button";
import Checkbox from "@/@shared/ui/Input/Checkbox/Checkbox";
import React, { FC, useState } from "react";

type SelectedOption = "card" | "transfer";

interface Props {
  handleContinue: (selectedOption: SelectedOption) => void;
}

const PaymentMethodSelection: FC<Props> = ({ handleContinue }) => {
  const [selectionOption, setSelectionOption] =
    useState<SelectedOption>("card");

  return (
    <Dialog>
      <p className="font-bold">How would you like to pay?</p>

      <div className="mt-7 flex flex-col gap-4">
        <div
          onClick={() => {
            setSelectionOption("card");
          }}
          className="!cursor-pointer w-fit flex items-center text-sm"
        >
          <Checkbox shape="round" checked={selectionOption === "card"} />
          <p>Card</p>
        </div>

        <div
          className="flex items-center w-fit text-sm cursor-pointer"
          onClick={() => {
            setSelectionOption("transfer");
          }}
        >
          <Checkbox shape="round" checked={selectionOption === "transfer"} />
          <div>
            <p>Transfer</p>
            {/* <p className="text-xs text-[#939393]">Only available in Nigeria</p> */}
          </div>
        </div>

        <Button
          title="Continue"
          className="mt-5"
          onClick={() => {
            handleContinue(selectionOption);
          }}
        />
      </div>
    </Dialog>
  );
};

export default PaymentMethodSelection;
