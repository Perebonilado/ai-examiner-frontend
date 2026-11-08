import Link from "next/link";
import React, { forwardRef } from "react";
import { CreditCard, LogOut, UserRound } from "lucide-react";
import Button from "../ui/Button";
import { logout } from "@/utils";
import cn from "classnames";
import { useModalContext } from "@/contexts/ModalContext";
import UpgradeAccountForm from "./UpgradeAccountForm";

interface Props {
  firstName: string;
  lastName: string;
  role: string;
  email: string;
  isOpen: boolean;
  position?: string;
  showSignOut?: boolean;
}

const itemClass =
  "group flex items-center gap-2.5 w-full h-9 px-2.5 rounded-[7px] text-sm font-medium text-body text-left whitespace-nowrap hover:bg-hover hover:text-ink transition-colors";
const iconClass = "shrink-0 text-muted group-hover:text-ink";

/** Account menu: who you are, then View profile / Manage your subscription (and Log out where the row has no button for it). */
const UserManagementPopUp = forwardRef<HTMLDivElement, Props>(
  (
    {
      firstName,
      lastName,
      email,
      isOpen,
      position = "top-full right-0",
      showSignOut = true,
      role,
    },
    ref
  ) => {
    const isGuest = role.toLowerCase() === "guest";
    const baseStyles = cn(
      `w-[240px] p-1.5 rounded-xl bg-surface border border-edge shadow-pop absolute ${position} z-[800]`,
      {
        ["block"]: isOpen,
        ["hidden"]: !isOpen,
      }
    );

    const { setModalContent } = useModalContext();
    const initial = firstName?.trim().charAt(0).toUpperCase() || "U";

    return (
      <div className={baseStyles} ref={ref} role="menu">
        <div className="flex items-center gap-2.5 px-2 pt-2 pb-2.5">
          <span
            aria-hidden="true"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent-100 text-xs font-bold text-accent-900"
          >
            {initial}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-ink">
              {firstName} {isGuest ? "" : lastName}
            </p>
            {!isGuest && <p className="truncate text-xs text-muted">{email}</p>}
          </div>
        </div>

        <div className="h-px bg-line -mx-1.5 mb-1.5" />

        {isGuest && (
          <div className="px-1 pb-1">
            <Button
              title="Upgrade account"
              variant="contained"
              size="small"
              fullWidth
              onClick={() => {
                setModalContent(<UpgradeAccountForm />);
              }}
            />
          </div>
        )}
        {!isGuest && (
          <Link href={"/account/profile"} className={itemClass} role="menuitem">
            <UserRound size={16} strokeWidth={1.75} className={iconClass} />
            View profile
          </Link>
        )}
        {!isGuest && (
          <Link href={"/account/settings"} className={itemClass} role="menuitem">
            <CreditCard size={16} strokeWidth={1.75} className={iconClass} />
            Manage your subscription
          </Link>
        )}

        {showSignOut && (
          <>
            <div className="h-px bg-line -mx-1.5 my-1.5" />
            <button
              type="button"
              role="menuitem"
              className={itemClass}
              onClick={() => {
                logout(() => {
                  window.location.pathname = "/auth/login";
                });
              }}
            >
              <LogOut size={16} strokeWidth={1.75} className={iconClass} />
              Log out
            </button>
          </>
        )}
      </div>
    );
  }
);

export default UserManagementPopUp;
