import React, { FC, FormEvent, useState } from "react";
import Link from "next/link";
import cn from "classnames";
import { Lock, UserPlus } from "lucide-react";
import {
  useAddAdminMutation,
  useGetAdminTeamQuery,
  useGetAdminUsersQuery,
  useGetAdminViewsQuery,
  useRemoveAdminMutation,
} from "@/api-services/admin.service";
import { AdminTeamMember } from "@/models/admin.model";
import Spinner from "@/@shared/components/Spinner";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import AdminDialog from "./AdminDialog";
import { formatDate, formatDayAndTime, initialsOf } from "./format";
import { Avatar, Chip, ErrorState, LoadingBlock, PageHeader, buttonClass, inputClass } from "./ui";

const looksLikeEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

/** The error message the API sent, or a plain fallback. */
const apiMessage = (error: unknown, fallback: string) => {
  const data = (error as { data?: { message?: unknown } })?.data;
  return typeof data?.message === "string" ? data.message : fallback;
};

const AddAdmin: FC<{ existing: Set<string> }> = ({ existing }) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState<string | null>(null);
  const [addAdmin, { isLoading }] = useAddAdminMutation();
  const typed = useDebouncedValue(email.trim(), 300);
  // Suggest accounts as you type a name or email.
  const { data: matches } = useGetAdminUsersQuery(
    { search: typed, pageSize: 5, plan: "", sort: "last_active" },
    { skip: typed.length < 2 || looksLikeEmail(typed) }
  );
  const suggestions = (matches?.users ?? []).filter((u) => u.email && !existing.has(u.email.toLowerCase()));

  const submit = async (value: string) => {
    const clean = value.trim().toLowerCase();
    setAdded(null);
    if (!looksLikeEmail(clean)) {
      setError("Enter an email address, like name@example.com.");
      return;
    }
    if (existing.has(clean)) {
      setError("They're already an admin.");
      return;
    }
    setError(null);
    try {
      await addAdmin(clean).unwrap();
      setEmail("");
      setAdded(clean);
    } catch (e) {
      setError(apiMessage(e, "We couldn't add them. Try again in a moment."));
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    submit(email);
  };

  return (
    <section aria-labelledby="add-h" className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-5">
      <div className="flex flex-col gap-0.5">
        <h2 id="add-h" className="text-[15px] font-bold text-ink">
          Add an admin
        </h2>
        <p className="text-[13px] text-subtle">
          They get the whole admin, except adding or removing admins. They sign in with this email as usual; if
          they don&apos;t have an account yet, access starts once they sign up with it.
        </p>
      </div>
      <form onSubmit={onSubmit} className="flex flex-wrap items-start gap-2.5" noValidate>
        <div className="relative min-w-0 flex-[1_1_320px]">
          <label htmlFor="admin-email" className="sr-only">
            Email address or name
          </label>
          <input
            id="admin-email"
            type="text"
            inputMode="email"
            autoComplete="off"
            value={email}
            placeholder="Email, or search by name"
            aria-invalid={!!error}
            aria-describedby={error ? "admin-email-error" : undefined}
            onChange={(e) => {
              setEmail(e.target.value);
              setError(null);
              setAdded(null);
            }}
            className={cn(inputClass, error && "border-danger focus:border-danger focus:ring-danger-line")}
          />
          {suggestions.length > 0 && (
            <ul
              aria-label="Matching people"
              className="absolute left-0 right-0 top-full z-20 mt-1.5 rounded-[12px] border border-line bg-surface p-1.5 shadow-pop"
            >
              {suggestions.map((u) => (
                <li key={u.id}>
                  <button
                    type="button"
                    onClick={() => setEmail(u.email ?? "")}
                    className="flex w-full items-center gap-2.5 rounded-[9px] px-2.5 py-1.5 text-left hover:bg-hover"
                  >
                    <Avatar initials={initialsOf(u.name)} seed={u.id} size={26} />
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate text-[13px] font-semibold text-ink">{u.name}</span>
                      <span className="truncate text-[12px] text-muted">{u.email}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <button type="submit" disabled={isLoading || !email.trim()} className={buttonClass.primary}>
          {isLoading ? <Spinner size="xs" tone="current" /> : <UserPlus size={16} strokeWidth={1.8} aria-hidden="true" />}
          {isLoading ? "Adding…" : "Add admin"}
        </button>
      </form>
      <p aria-live="polite" className="text-[13px] empty:hidden">
        {error ? (
          <span id="admin-email-error" className="font-medium text-danger">
            {error}
          </span>
        ) : added ? (
          <span className="font-medium text-success-strong">{added} is now an admin.</span>
        ) : null}
      </p>
    </section>
  );
};

const MemberRow: FC<{
  member: AdminTeamMember;
  you: string;
  canManage: boolean;
  onRemove: (m: AdminTeamMember) => void;
}> = ({ member, you, canManage, onRemove }) => {
  const isYou = member.email === you;
  const name = member.name ?? member.email;
  return (
    <li className="flex flex-wrap items-center gap-x-3 gap-y-2 px-5 py-3.5">
      <Avatar initials={member.initials} seed={member.userId ?? member.email} size={36} />
      <span className="flex min-w-0 flex-[1_1_220px] flex-col gap-0.5">
        <span className="flex min-w-0 flex-wrap items-center gap-2">
          {member.userId ? (
            <Link href={`/admin/users/${member.userId}`} className="truncate font-semibold text-ink hover:text-accent">
              {name}
            </Link>
          ) : (
            <span className="truncate font-semibold text-ink">{name}</span>
          )}
          {member.owner ? (
            <Chip tone="ink" size="sm">
              Owner
            </Chip>
          ) : (
            <Chip tone="violet" size="sm">
              Admin
            </Chip>
          )}
          {isYou && <span className="text-[12px] font-semibold text-muted">You</span>}
        </span>
        <span className="truncate text-[13px] text-muted">
          {member.name ? member.email : ""}
          {!member.userId && "No account with this email yet"}
        </span>
      </span>
      {member.owner ? (
        <span
          className="ml-auto inline-flex items-center gap-1.5 text-[12.5px] text-muted"
          title="Owners come from the ADMIN_EMAILS setting on the server and can't be removed here."
        >
          <Lock size={13} strokeWidth={2} aria-hidden="true" />
          Set on the server
        </span>
      ) : (
        <>
          <span className="text-[12.5px] text-subtle">
            Added {member.addedOn ? formatDate(member.addedOn) : ""}
            {member.addedBy ? ` by ${member.addedBy}` : ""}
          </span>
          {canManage && (
            <button type="button" onClick={() => onRemove(member)} className={cn(buttonClass.small, "ml-auto")}>
              Remove<span className="sr-only"> {name}</span>
            </button>
          )}
        </>
      )}
    </li>
  );
};

/** Who can open the admin. Owners (set on the server) add and remove admins here. */
const VIEW_KIND = { conversation: "a conversation", test: "a test attempt", document: "a document" } as const;
const viewHref = (v: { kind: keyof typeof VIEW_KIND; key: string }) =>
  v.kind === "conversation" ? `/admin/conversations/${v.key}` : v.kind === "test" ? `/admin/tests/${v.key}` : `/admin/documents/${v.key}`;

/** Every time an admin opened a student's chat, test or upload: kept so access stays accountable. */
const ViewLog: FC = () => {
  const { data } = useGetAdminViewsQuery();
  const [all, setAll] = useState(false);
  if (!data) return null;
  const shown = all ? data : data.slice(0, 8);
  return (
    <section aria-labelledby="views-h" className="overflow-hidden rounded-2xl border border-line bg-surface">
      <div className="flex flex-col gap-0.5 border-b border-line px-5 py-3.5">
        <h2 id="views-h" className="text-[15px] font-bold text-ink">
          Who opened what
        </h2>
        <p className="text-[13px] text-subtle">Each time an admin reads a student’s conversation, test or upload, it’s noted here.</p>
      </div>
      {data.length === 0 ? (
        <p className="px-5 py-5 text-[13px] text-muted">Nothing opened yet.</p>
      ) : (
        <ul className="divide-y divide-line">
          {shown.map((v, i) => (
            <li key={`${v.at}-${i}`} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-5 py-2.5 text-[13px]">
              <span className="w-[120px] shrink-0 font-mono text-[11.5px] text-muted">{formatDayAndTime(v.at)}</span>
              <span className="min-w-0 flex-1 text-body">
                <b className="font-semibold text-ink">{v.admin}</b> opened{" "}
                <Link href={viewHref(v)} className="font-semibold text-accent hover:text-accent-900">
                  {VIEW_KIND[v.kind]}
                </Link>{" "}
                from {v.student.userId ? <Link href={`/admin/users/${v.student.userId}`} className="font-semibold text-ink hover:text-accent">{v.student.name}</Link> : v.student.name}
              </span>
            </li>
          ))}
        </ul>
      )}
      {data.length > 8 && (
        <button type="button" onClick={() => setAll((a) => !a)} className="w-full border-t border-line px-5 py-2.5 text-left text-[13px] font-semibold text-accent hover:bg-canvas">
          {all ? "Show fewer" : `Show all ${data.length}`}
        </button>
      )}
    </section>
  );
};

const TeamView: FC = () => {
  const { data, isLoading, isError, refetch } = useGetAdminTeamQuery(undefined, { refetchOnMountOrArgChange: true });
  const [removing, setRemoving] = useState<AdminTeamMember | null>(null);
  const [removeAdmin, removeState] = useRemoveAdminMutation();

  const confirmRemove = async () => {
    if (!removing) return;
    try {
      await removeAdmin(removing.email).unwrap();
      setRemoving(null);
    } catch {
      // The error toast has said so; the dialog stays open to try again.
    }
  };

  const owners = data?.admins.filter((a) => a.owner) ?? [];
  const admins = data?.admins.filter((a) => !a.owner) ?? [];

  return (
    <>
      <PageHeader
        title="Admins"
        subtitle={
          data
            ? `${owners.length} ${owners.length === 1 ? "owner" : "owners"} · ${admins.length} ${
                admins.length === 1 ? "admin" : "admins"
              }`
            : " "
        }
      />

      {isLoading ? (
        <LoadingBlock label="Loading the admins" />
      ) : !data ? (
        isError ? (
          <ErrorState onRetry={refetch} />
        ) : null
      ) : (
        <>
          {data.canManage ? (
            <AddAdmin existing={new Set(data.admins.map((a) => a.email))} />
          ) : (
            <p className="rounded-2xl border border-line bg-surface px-5 py-4 text-[13px] text-subtle">
              Only owners can add or remove admins. Ask an owner if someone needs access.
            </p>
          )}

          <section aria-labelledby="team-h" className="overflow-hidden rounded-2xl border border-line bg-surface">
            <h2 id="team-h" className="border-b border-line px-5 py-3.5 text-[15px] font-bold text-ink">
              Everyone with access
            </h2>
            <ul className="divide-y divide-line">
              {[...owners, ...admins].map((m) => (
                <MemberRow key={m.email} member={m} you={data.you} canManage={data.canManage} onRemove={setRemoving} />
              ))}
            </ul>
          </section>

          <ViewLog />
        </>
      )}

      <AdminDialog
        open={!!removing}
        title="Remove this admin?"
        onClose={() => setRemoving(null)}
        actions={
          <>
            <button type="button" onClick={() => setRemoving(null)} className={buttonClass.secondary}>
              Cancel
            </button>
            <button type="button" onClick={confirmRemove} disabled={removeState.isLoading} className={buttonClass.danger}>
              {removeState.isLoading && <Spinner size="xs" tone="current" />}
              Remove admin
            </button>
          </>
        }
      >
        {removing && (
          <p>
            <b className="font-semibold text-ink">{removing.name ?? removing.email}</b> ({removing.email}) will lose
            access to the admin straight away. Their AI Examiner account isn&apos;t touched, and you can add them back
            any time.
          </p>
        )}
      </AdminDialog>
    </>
  );
};

export default TeamView;
