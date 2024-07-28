import TextField from "@/@shared/ui/Input/TextField";
import React, { FC } from "react";

interface Props {
  firstName: string;
  lastName: string;
  email: string;
}

const PersonalInformationContainer: FC<Props> = ({
  firstName,
  lastName,
  email,
}) => {
  return (
    <div className="w-full max-w-[800px]">
      <h3 className="text-lg font-bold mb-10">Personal Information</h3>

      <div className="flex flex-col gap-8">
        <div className="flex items-center gap-9">
          <div style={{ flex: 1 }}>
            <label className="font-semibold">First Name</label>
          </div>
          <div style={{ flex: 2 }}>
            <TextField value={firstName} disabled />
          </div>
        </div>
        <div className="flex items-center gap-9">
          <div style={{ flex: 1 }}>
            <label>Last Name</label>
          </div>
          <div style={{ flex: 2 }}>
            <TextField value={lastName} disabled />
          </div>
        </div>
        <div className="flex items-center gap-9">
          <div style={{ flex: 1 }}>
            <label>Email</label>
          </div>
          <div style={{ flex: 2 }}>
            <TextField value={email} disabled />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalInformationContainer;
