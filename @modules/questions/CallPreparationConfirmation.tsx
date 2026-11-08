import React, { FC } from "react";
import CallPrepItem from "./CallPrepItem";
import Button from "@/@shared/ui/Button";
import { useModalContext } from "@/contexts/ModalContext";
import { AudioLines, Bell, ShieldCheck, Sparkles, Timer, X } from "lucide-react";

interface Props {
  handleProceed: () => void;
}

const icon = { size: 17, strokeWidth: 1.75, "aria-hidden": true } as const;

const CallPreparationConfirmation: FC<Props> = ({ handleProceed }) => {
  const { setModalContent } = useModalContext();
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="call-prep-title"
      aria-describedby="call-prep-desc"
      className="w-[min(480px,calc(100vw-40px))] overflow-hidden rounded-2xl border border-edge bg-surface shadow-pop"
    >
      <div className="flex items-start gap-3 px-5 pt-5">
        <div className="min-w-0 flex-1">
          <h2 id="call-prep-title" className="text-lg font-bold tracking-[-0.015em] text-ink">
            Get ready for your AI call
          </h2>
          <p id="call-prep-desc" className="mt-1 text-sm text-subtle">
            For the best experience, ensure you're in a quiet place
          </p>
        </div>
        <button
          type="button"
          aria-label="Close"
          onClick={() => {
            setModalContent(null);
          }}
          className="-mr-2 -mt-1.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg text-subtle transition-colors hover:bg-hover hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-bright"
        >
          <X size={18} strokeWidth={1.75} aria-hidden />
        </button>
      </div>

      <div className="px-5 py-[18px]">
        <ul>
          <CallPrepItem
            instruction="This call will have verbal questions."
            icon={<AudioLines {...icon} />}
          />
          <CallPrepItem
            instruction="AI will analyze your responses to assess your performance."
            icon={<Sparkles {...icon} />}
          />
          <CallPrepItem
            instruction="This call is timed and will last for a maximum duration of 2 minutes."
            icon={<Timer {...icon} />}
          />
          <CallPrepItem
            instruction="You will receive a confirmation when your performance is ready for review."
            icon={<Bell {...icon} />}
          />
        </ul>

        <p className="mt-3 flex gap-2.5 rounded-[10px] bg-well px-3.5 py-3 text-[12.5px] leading-[1.55] text-subtle">
          <ShieldCheck
            size={16}
            strokeWidth={1.75}
            className="mt-px shrink-0 text-muted"
            aria-hidden
          />
          <span>
            By proceeding, you agree to have your responses recorded and
            processed. View our{" "}
            <a
              href="https://aiexaminer.app/privacy-policy"
              target="_blank"
              className="font-semibold text-accent underline underline-offset-2"
            >
              Privacy Policy
            </a>{" "}
            for more details.
          </span>
        </p>
      </div>

      <div className="flex justify-end gap-2.5 border-t border-line bg-canvas px-5 py-3.5">
        <Button
          title="Proceed"
          size="medium"
          onClick={handleProceed}
          className="min-w-[140px] max-md:flex-1"
        />
      </div>
    </div>
  );
};

export default CallPreparationConfirmation;
