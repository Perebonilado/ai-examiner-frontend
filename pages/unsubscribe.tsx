import React, { FC, FormEvent, ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import cn from "classnames";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import AppHead from "@/@shared/components/AppHead";
import AppMark from "@/@shared/components/AppLayout/AppMark";
import Spinner from "@/@shared/components/Spinner";
import { siteFontClass, sitePalette } from "@/@shared/components/site/siteTheme";
import { useResubscribeMutation, useUnsubscribeMutation } from "@/api-services/admin.service";
import { UnsubscribeReason } from "@/models/admin.model";

const CONTACT = "aiexaminerapp@gmail.com";

const REASONS: { value: UnsubscribeReason; label: string }[] = [
  { value: "too_many", label: "Too many emails" },
  { value: "not_useful", label: "They’re not useful to me" },
  { value: "stopped_using", label: "I don’t study with AI Examiner any more" },
  { value: "other", label: "Something else" },
];

type View =
  | { kind: "missing" }
  | { kind: "working" }
  | { kind: "invalid" }
  | { kind: "offline" }
  | { kind: "unsubscribed"; email: string }
  | { kind: "subscribed"; email: string };

/** A link the server doesn't recognise (expired, mistyped) vs. a request that didn't get through. */
const isBadLink = (error: unknown) => {
  const status = (error as FetchBaseQueryError | undefined)?.status;
  return status === 400 || status === 401 || status === 403 || status === 404 || status === 410 || status === 422;
};

const Marker: FC<{ children: ReactNode }> = ({ children }) => (
  <span className="rounded-md bg-[var(--hy)] px-2 [box-decoration-break:clone] [-webkit-box-decoration-break:clone]">
    {children}
  </span>
);

const pill =
  "inline-flex min-h-12 items-center justify-center rounded-full px-[22px] py-2 text-[15px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50";

/** The unsubscribe link in every marketing email. Unsubscribes on arrival; offers a way back. */
const UnsubscribePage: NextPage = () => {
  const router = useRouter();
  const token = typeof router.query.token === "string" ? router.query.token.trim() : "";
  const [unsubscribe] = useUnsubscribeMutation();
  const [resubscribe, { isLoading: resubscribing }] = useResubscribeMutation();
  const [view, setView] = useState<View>({ kind: "working" });
  const [reason, setReason] = useState<UnsubscribeReason | "">("");
  const [reasonState, setReasonState] = useState<"idle" | "sending" | "sent" | "failed">("idle");
  const [switchFailed, setSwitchFailed] = useState(false);
  const started = useRef(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const run = useCallback(async () => {
    setView({ kind: "working" });
    try {
      const result = await unsubscribe({ token }).unwrap();
      setView({ kind: "unsubscribed", email: result.email });
    } catch (error) {
      setView({ kind: isBadLink(error) ? "invalid" : "offline" });
    }
  }, [token, unsubscribe]);

  useEffect(() => {
    if (!router.isReady || started.current) return;
    started.current = true;
    if (!token) setView({ kind: "missing" });
    else run();
  }, [router.isReady, token, run]);

  // A new message on the page: move focus to its heading so it is read out.
  useEffect(() => {
    if (view.kind !== "working") headingRef.current?.focus();
  }, [view.kind]);

  const handleResubscribe = async () => {
    setSwitchFailed(false);
    try {
      const result = await resubscribe({ token }).unwrap();
      setView({ kind: "subscribed", email: result.email });
    } catch {
      setSwitchFailed(true);
    }
  };

  const handleUnsubscribeAgain = async () => {
    setSwitchFailed(false);
    try {
      const result = await unsubscribe({ token }).unwrap();
      setReasonState("idle");
      setView({ kind: "unsubscribed", email: result.email });
    } catch {
      setSwitchFailed(true);
    }
  };

  const handleReason = async (e: FormEvent) => {
    e.preventDefault();
    if (!reason) return;
    setReasonState("sending");
    try {
      await unsubscribe({ token, reason }).unwrap();
      setReasonState("sent");
    } catch {
      setReasonState("failed");
    }
  };

  const heading = (children: ReactNode) => (
    <h1
      ref={headingRef}
      tabIndex={-1}
      className="text-[38px] font-semibold leading-[1.08] tracking-[-0.035em] focus:outline-none md:text-[48px]"
    >
      {children}
    </h1>
  );
  const text = "text-[17px] leading-[1.65] text-[#3f3f47]";
  const homeLink = (
    <Link href="/" className="text-[15px] font-medium text-[var(--hp)] hover:text-[var(--hp-hover)] hover:underline">
      Go to AI Examiner
    </Link>
  );
  const switchError = switchFailed && (
    <p role="alert" className="text-[15px] font-medium text-[#b42318]">
      That didn&apos;t go through. Check your connection and try again.
    </p>
  );

  let body: ReactNode;
  switch (view.kind) {
    case "working":
      body = (
        <div className="flex items-center gap-3 py-10 text-[17px] text-[#3f3f47]">
          <Spinner size="sm" />
          <p role="status">Unsubscribing you…</p>
        </div>
      );
      break;
    case "missing":
      body = (
        <>
          {heading("This link isn’t complete")}
          <p className={text}>
            Use the Unsubscribe link at the bottom of one of our emails. If it still doesn&apos;t work, write to{" "}
            <a href={`mailto:${CONTACT}`} className="text-[var(--hp)] underline">
              {CONTACT}
            </a>{" "}
            and we&apos;ll take you off the list.
          </p>
          <div>{homeLink}</div>
        </>
      );
      break;
    case "invalid":
      body = (
        <>
          {heading("This link has expired")}
          <p className={text}>
            Open the newest email from us and use its Unsubscribe link, or write to{" "}
            <a href={`mailto:${CONTACT}`} className="text-[var(--hp)] underline">
              {CONTACT}
            </a>{" "}
            and we&apos;ll take you off the list.
          </p>
          <div>{homeLink}</div>
        </>
      );
      break;
    case "offline":
      body = (
        <>
          {heading("We couldn’t reach AI Examiner")}
          <p className={text}>You haven&apos;t been unsubscribed yet. Check your connection and try again.</p>
          <div className="flex flex-wrap items-center gap-x-[18px] gap-y-3">
            <button type="button" onClick={run} className={cn(pill, "bg-[var(--hp)] text-white hover:bg-[var(--hp-hover)]")}>
              Try again
            </button>
            {homeLink}
          </div>
        </>
      );
      break;
    case "subscribed":
      body = (
        <>
          {heading(
            <>
              You’re <Marker>subscribed</Marker> again
            </>
          )}
          <p className={text}>
            {view.email} will get AI Examiner&apos;s emails about new features, study tips and offers again.
          </p>
          <div className="flex flex-wrap items-center gap-x-[18px] gap-y-3">
            <button
              type="button"
              onClick={handleUnsubscribeAgain}
              className={cn(pill, "border-[1.5px] border-[var(--hk)] bg-white text-[var(--hk)] hover:bg-[#f7f7f8]")}
            >
              Unsubscribe
            </button>
            {homeLink}
          </div>
          {switchError}
        </>
      );
      break;
    case "unsubscribed":
      body = (
        <>
          {heading(
            <>
              You’re <Marker>unsubscribed</Marker>
            </>
          )}
          <p className={text}>
            {view.email} won&apos;t get marketing emails from AI Examiner any more. You&apos;ll still get emails about
            your account, like password resets and viva results.
          </p>
          <div className="flex flex-wrap items-center gap-x-[18px] gap-y-3">
            <button
              type="button"
              onClick={handleResubscribe}
              disabled={resubscribing}
              className={cn(pill, "border-[1.5px] border-[var(--hk)] bg-white text-[var(--hk)] hover:bg-[#f7f7f8]")}
            >
              Unsubscribed by mistake? Resubscribe
            </button>
            {homeLink}
          </div>
          {switchError}

          {reasonState === "sent" ? (
            <p role="status" className="mt-[18px] rounded-[20px] bg-[#f7f7f8] p-6 text-[17px] font-medium">
              Thank you for telling us.
            </p>
          ) : (
            <form onSubmit={handleReason} className="mt-[18px] flex flex-col gap-3.5 rounded-[20px] bg-[#f7f7f8] p-6">
              <fieldset className="flex flex-col gap-1">
                <legend className="mb-2.5 text-[17px] font-semibold">Would you tell us why? (optional)</legend>
                {REASONS.map((r) => (
                  <label key={r.value} className="flex min-h-11 cursor-pointer items-center gap-3 text-[15px] text-[#33333b]">
                    <input
                      type="radio"
                      name="why"
                      value={r.value}
                      checked={reason === r.value}
                      onChange={() => setReason(r.value)}
                      className="h-5 w-5 shrink-0 accent-[#5b2ad6]"
                    />
                    {r.label}
                  </label>
                ))}
              </fieldset>
              {reasonState === "failed" && (
                <p role="alert" className="text-[15px] font-medium text-[#b42318]">
                  That didn&apos;t send. Try again.
                </p>
              )}
              <button
                type="submit"
                disabled={!reason || reasonState === "sending"}
                className={cn(pill, "min-h-[46px] self-start bg-[var(--hp)] text-white hover:bg-[var(--hp-hover)]")}
              >
                {reasonState === "sending" ? "Sending…" : "Send"}
              </button>
            </form>
          )}
        </>
      );
      break;
  }

  return (
    <>
      <AppHead>
        <title>Email preferences · AI Examiner</title>
        <meta name="robots" content="noindex" />
      </AppHead>
      <div style={sitePalette} className={cn(siteFontClass, "flex min-h-[100dvh] flex-col bg-white text-[var(--hk)]")}>
        <header className="flex h-14 items-center px-5">
          <AppMark size={15} className="!text-[var(--hk)]" />
        </header>
        <main className="flex flex-1 justify-center px-5 pb-16 pt-10 md:pt-12">
          <div className="flex w-full max-w-[560px] flex-col gap-[22px]">{body}</div>
        </main>
        <footer className="px-5 py-5 text-center text-[12.5px] text-[#6b6b74]">
          © {new Date().getFullYear()} AI Examiner · Questions?{" "}
          <a href={`mailto:${CONTACT}`} className="text-[var(--hp)] underline underline-offset-2">
            {CONTACT}
          </a>
        </footer>
      </div>
    </>
  );
};

export default UnsubscribePage;
