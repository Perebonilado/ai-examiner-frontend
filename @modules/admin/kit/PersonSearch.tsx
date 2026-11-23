import React, { FC, KeyboardEvent, useEffect, useId, useState } from "react";
import cn from "classnames";
import { Search, X } from "lucide-react";
import { useGetAdminUsersQuery } from "@/api-services/admin.service";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { initialsOf } from "../format";
import { Avatar } from "../ui";

interface Props {
  /** Free text: matches names and emails. */
  value: string;
  onChange: (text: string) => void;
  /** Picks one person from the suggestions. */
  onPick: (person: { id: string; name: string }) => void;
  placeholder?: string;
  className?: string;
}

/**
 * Search by name or email. Typing filters as you go; the suggestions underneath narrow it to
 * one person.
 */
export const PersonSearch: FC<Props> = ({ value, onChange, onPick, placeholder = "Search people", className }) => {
  const id = useId();
  const [text, setText] = useState(value);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const typed = useDebouncedValue(text.trim(), 300);

  // Keep the box in step when the filter is cleared elsewhere.
  useEffect(() => setText(value), [value]);
  useEffect(() => {
    if (typed !== value.trim()) onChange(typed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typed]);

  const { data, isFetching } = useGetAdminUsersQuery(
    { search: typed, pageSize: 6, sort: "last_active" },
    { skip: !open || typed.length < 2 }
  );
  const people = open && typed.length >= 2 ? (data?.users ?? []) : [];
  const listId = `${id}-list`;

  const pick = (i: number) => {
    const p = people[i];
    if (!p) return;
    onPick({ id: p.id, name: p.name });
    setText("");
    setOpen(false);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" && people.length) {
      e.preventDefault();
      setOpen(true);
      setActive((a) => Math.min(people.length - 1, a + 1));
    } else if (e.key === "ArrowUp" && people.length) {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === "Enter" && active >= 0) {
      e.preventDefault();
      pick(active);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div className={cn("relative", className)}>
      <div className="flex h-10 items-center gap-2 rounded-[10px] border border-control bg-surface px-3 text-muted transition-colors focus-within:border-ink">
        <Search size={15} strokeWidth={2} aria-hidden="true" className="shrink-0" />
        <input
          id={id}
          type="text"
          role="combobox"
          aria-expanded={people.length > 0}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
          aria-label={placeholder}
          autoComplete="off"
          value={text}
          placeholder={placeholder}
          onChange={(e) => {
            setText(e.target.value);
            setOpen(true);
            setActive(-1);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          onKeyDown={onKeyDown}
          className="h-full min-w-0 flex-1 bg-transparent text-[16px] text-ink placeholder:text-faint focus:outline-none md:text-[13px]"
        />
        {text && (
          <button
            type="button"
            aria-label="Clear the search"
            onClick={() => {
              setText("");
              onChange("");
            }}
            className="grid h-6 w-6 shrink-0 place-items-center rounded-full hover:bg-hover hover:text-ink"
          >
            <X size={13} strokeWidth={2.4} aria-hidden="true" />
          </button>
        )}
      </div>
      {open && typed.length >= 2 && (
        <ul
          id={listId}
          role="listbox"
          aria-label="People"
          className="absolute left-0 right-0 top-full z-30 mt-1.5 rounded-[12px] border border-line bg-surface p-1.5 shadow-pop"
        >
          {people.length === 0 ? (
            <li className="px-2.5 py-2 text-[13px] text-muted">{isFetching ? "Searching…" : "No one matches."}</li>
          ) : (
            <>
              <li role="presentation" className="px-2.5 pb-1 pt-0.5 text-[11.5px] font-semibold text-muted">
                Show only one person
              </li>
              {people.map((p, i) => (
                <li
                  key={p.id}
                  id={`${listId}-${i}`}
                  role="option"
                  aria-selected={i === active}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pick(i)}
                  onMouseEnter={() => setActive(i)}
                  className={cn(
                    "flex cursor-pointer items-center gap-2.5 rounded-[9px] px-2.5 py-1.5",
                    i === active && "bg-hover"
                  )}
                >
                  <Avatar initials={initialsOf(p.name)} seed={p.id} size={26} online={p.online} />
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate text-[13px] font-semibold text-ink">{p.name}</span>
                    <span className="truncate text-[12px] text-muted">{p.email ?? "Guest"}</span>
                  </span>
                </li>
              ))}
            </>
          )}
        </ul>
      )}
    </div>
  );
};
