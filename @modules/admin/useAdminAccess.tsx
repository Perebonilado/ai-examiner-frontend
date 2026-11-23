import React, { FC, PropsWithChildren } from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { useGetAdminMeQuery } from "@/api-services/admin.service";
import { AppLoader } from "@/@shared/components/AppLoader";
import { buttonClass } from "./ui";

export type AdminAccess = "loading" | "admin" | "denied" | "error";

/** Whether the signed-in person can use the admin pages (`GET /admin/me`). */
export const useAdminAccess = (): { access: AdminAccess; retry: () => void } => {
  const { data, isLoading, isFetching, isError, refetch } = useGetAdminMeQuery();
  if (isLoading || (isFetching && !data)) return { access: "loading", retry: refetch };
  if (data) return { access: data.isAdmin ? "admin" : "denied", retry: refetch };
  if (isError) return { access: "error", retry: refetch };
  return { access: "loading", retry: refetch };
};

const Notice: FC<PropsWithChildren<{ title: string }>> = ({ title, children }) => (
  <main className="grid min-h-[100dvh] place-items-center bg-canvas px-4 py-16">
    <div className="flex w-full max-w-[440px] flex-col items-center gap-4 rounded-2xl border border-line bg-surface px-6 py-10 text-center">
      <span aria-hidden="true" className="grid h-12 w-12 place-items-center rounded-full bg-accent-100 text-accent-900">
        <ShieldCheck size={22} strokeWidth={1.8} />
      </span>
      <h1 className="text-xl font-bold tracking-[-0.015em] text-ink">{title}</h1>
      {children}
    </div>
  </main>
);

/** Shows the admin pages only to admins; everyone else gets a calm note and a way back. */
export const AdminGate: FC<PropsWithChildren> = ({ children }) => {
  const { access, retry } = useAdminAccess();

  if (access === "loading") return <AppLoader loaderMessage="Checking your access" />;

  if (access === "error")
    return (
      <Notice title="We couldn't check your access">
        <p className="text-sm text-subtle">Check your connection and try again.</p>
        <div className="flex flex-wrap justify-center gap-2.5">
          <button type="button" onClick={retry} className={buttonClass.primary}>
            Try again
          </button>
          <Link href="/new-document" className={buttonClass.secondary}>
            Back to the app
          </Link>
        </div>
      </Notice>
    );

  if (access === "denied")
    return (
      <Notice title="You don't have access to this page">
        <p className="text-sm leading-relaxed text-subtle">
          This area is for the AI Examiner team. If you think you should have access, ask someone on the team to
          add your email.
        </p>
        <Link href="/new-document" className={buttonClass.primary}>
          Back to the app
        </Link>
      </Notice>
    );

  return <>{children}</>;
};
