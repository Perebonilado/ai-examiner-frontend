import React, { FC, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import { CircleAlert, CircleCheck } from "lucide-react";
import { AppLogo } from "@/@shared/components/AppLogo";
import Spinner from "@/@shared/components/Spinner";
import Button from "@/@shared/ui/Button";
import TextField from "@/@shared/ui/Input/TextField";
import { flush, track } from "@/@shared/analytics/track";
import { useConfirmEmailMutation } from "@/api-services/auth.service";
import { accessToken } from "@/constants";
import { ResendLink } from "./CheckYourEmail";

type State = "confirming" | "confirmed" | "already" | "invalid";

/** The page the confirmation email links to: confirms the address, then opens the app. */
const ConfirmEmail: FC = () => {
  const router = useRouter();
  const [confirm] = useConfirmEmailMutation();
  const [state, setState] = useState<State>("confirming");
  const [reason, setReason] = useState("");
  const [email, setEmail] = useState("");
  const [askEmail, setAskEmail] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    if (!router.isReady || started.current) return;
    started.current = true;
    const token = typeof router.query.token === "string" ? router.query.token : "";
    if (!token) {
      setState("invalid");
      return;
    }
    confirm({ token })
      .unwrap()
      .then((res) => {
        if (res.data?.token) {
          Cookies.set(accessToken, res.data.token, {
            expires: 365,
            secure: !`${process.env.NEXT_PUBLIC_BASE_URL}`.includes("localhost"),
          });
          track("email_confirmed");
          flush(true);
          setState("confirmed");
          setTimeout(() => router.replace("/new-document"), 1200);
        } else setState("already");
      })
      .catch((error: { data?: { message?: unknown } }) => {
        setReason(typeof error?.data?.message === "string" ? error.data.message : "");
        setState("invalid");
      });
  }, [router, confirm]);

  return (
    <div className="mx-auto w-full max-w-[450px] px-2 py-6 max-sm:max-w-full">
      <div className="mx-auto my-12 flex justify-center">
        <AppLogo />
      </div>

      {state === "confirming" && (
        <div role="status" className="flex flex-col items-center gap-4 text-center">
          <Spinner size="md" />
          <p className="text-[15px] text-subtle">Confirming your email…</p>
        </div>
      )}

      {state === "confirmed" && (
        <div role="status" className="flex flex-col items-center gap-4 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-success-bg text-success">
            <CircleCheck size={26} strokeWidth={1.8} aria-hidden />
          </span>
          <h2 className="text-2xl font-bold tracking-[-0.02em] text-ink">Email confirmed</h2>
          <p className="text-[15px] text-subtle">Your account is ready. Taking you in…</p>
        </div>
      )}

      {state === "already" && (
        <div className="flex flex-col items-center gap-5 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-success-bg text-success">
            <CircleCheck size={26} strokeWidth={1.8} aria-hidden />
          </span>
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold tracking-[-0.02em] text-ink">Already confirmed</h2>
            <p className="text-[15px] text-subtle">Your email was confirmed before. Log in to carry on.</p>
          </div>
          <Button title="Log in" size="large" fullWidth onClick={() => router.push("/auth/login")} />
        </div>
      )}

      {state === "invalid" && (
        <div className="flex flex-col items-center gap-5 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-danger-bg text-danger">
            <CircleAlert size={26} strokeWidth={1.8} aria-hidden />
          </span>
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold tracking-[-0.02em] text-ink">This link doesn’t work any more</h2>
            <p className="text-[15px] leading-relaxed text-subtle">
              {reason || "It may have expired, or a newer link was sent."} Enter your email and we’ll send a fresh link.
            </p>
          </div>
          {askEmail ? (
            <div className="flex w-full flex-col gap-3 text-left">
              <ResendLink email={email} startWaiting={false} />
            </div>
          ) : (
            <form
              className="flex w-full flex-col gap-4 text-left"
              onSubmit={(e) => {
                e.preventDefault();
                if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) setAskEmail(true);
              }}
            >
              <TextField
                label="Email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button title="Continue" type="submit" size="large" fullWidth />
            </form>
          )}
          <Link href="/auth/login" className="text-[14px] font-semibold text-accent hover:underline">
            Back to log in
          </Link>
        </div>
      )}
    </div>
  );
};

export default ConfirmEmail;
