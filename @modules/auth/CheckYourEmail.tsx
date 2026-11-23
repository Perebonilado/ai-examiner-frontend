import React, { FC, useEffect, useState } from "react";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import Button from "@/@shared/ui/Button";
import { useResendConfirmationMutation } from "@/api-services/auth.service";

const WAIT_SECONDS = 60;

/** "Send it again", with a short wait so people don't flood their own inbox. */
export const ResendLink: FC<{ email: string; startWaiting?: boolean }> = ({ email, startWaiting = true }) => {
  const [resend, { isLoading }] = useResendConfirmationMutation();
  const [wait, setWait] = useState(startWaiting ? WAIT_SECONDS : 0);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  return (
    <div className="flex flex-col items-center gap-1.5">
      <Button
        title={wait > 0 ? `Send it again in ${wait}s` : isLoading ? "Sending…" : "Send it again"}
        variant="outlined"
        size="large"
        type="button"
        fullWidth
        disabled={wait > 0 || isLoading}
        onClick={async () => {
          try {
            await resend({ email }).unwrap();
            setSent(true);
            setWait(WAIT_SECONDS);
          } catch {
            // The error toast says so.
          }
        }}
      />
      <p aria-live="polite" className="min-h-[20px] text-[13px] text-subtle">
        {sent ? "Sent. Check your inbox, and the spam folder too." : ""}
      </p>
    </div>
  );
};

/** After an email sign-up: the account opens once they tap the link we emailed. */
const CheckYourEmail: FC<{ email: string; onUseAnotherEmail: () => void }> = ({ email, onUseAnotherEmail }) => (
  <div className="flex flex-col items-center gap-6 text-center">
    <span className="grid h-14 w-14 place-items-center rounded-full bg-accent-100 text-accent-900">
      <MailCheck size={26} strokeWidth={1.8} aria-hidden />
    </span>
    <div className="flex flex-col gap-3">
      <h2 className="text-2xl font-bold tracking-[-0.02em] text-ink">Check your email</h2>
      <p className="text-[15px] leading-relaxed text-subtle">
        We sent a link to <b className="font-semibold text-ink break-all">{email}</b>. Tap it to confirm your email and your account will be ready.
      </p>
    </div>
    <div className="w-full">
      <ResendLink email={email} />
    </div>
    <p className="text-[14px] text-subtle">
      Wrong address?{" "}
      <button type="button" onClick={onUseAnotherEmail} className="font-semibold text-accent hover:underline">
        Use a different email
      </button>
    </p>
    <p className="text-[14px] text-subtle">
      Already confirmed?{" "}
      <Link href="/auth/login" className="font-semibold text-accent hover:underline">
        Log in
      </Link>
    </p>
  </div>
);

export default CheckYourEmail;
