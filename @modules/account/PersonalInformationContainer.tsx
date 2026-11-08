import TextField from "@/@shared/ui/Input/TextField";
import React, { FC } from "react";
import { Lock } from "lucide-react";
import AccountSection from "./AccountSection";

interface Props {
  firstName: string;
  lastName: string;
  email: string;
}

const lock = <Lock size={14} strokeWidth={1.75} aria-hidden="true" />;

const PersonalInformationContainer: FC<Props> = ({
  firstName,
  lastName,
  email,
}) => {
  return (
    <AccountSection title="Personal information" id="acct-personal-information">
      <div className="rounded-xl border border-edge bg-surface p-4 shadow-xs md:p-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-x-4 md:gap-y-[18px]">
          <TextField label="First name" value={firstName} disabled readOnly endicon={lock} />
          <TextField label="Last name" value={lastName} disabled readOnly endicon={lock} />
          <div className="md:col-span-2">
            <TextField label="Email" type="email" value={email} disabled readOnly endicon={lock} />
          </div>
        </div>
      </div>
    </AccountSection>
  );
};

export default PersonalInformationContainer;
