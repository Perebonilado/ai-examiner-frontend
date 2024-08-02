"use client";

import { useGetPermissionsQuery } from "@/api-services/permission.service";
import { accessToken } from "@/constants";
import { PermissionModel } from "@/models/permission.model";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { toast } from "react-toastify";

interface ContextOptions {
  setPermissions: React.Dispatch<React.SetStateAction<PermissionModel | null>>;
  permissions: PermissionModel | null;
}

const PermissionContext = React.createContext<ContextOptions | null>(null);

const PermissionProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [permissions, setPermissions] = useState<PermissionModel | null>(null);

  const isUserLoggedIn = Cookies.get(accessToken);

  const { data, error } = useGetPermissionsQuery("", { skip: !isUserLoggedIn });

  useEffect(() => {
    if (data) {
      setPermissions(data);
    }
  }, [data]);

  useEffect(() => {
    if (error && "status" in error) {
      if ("data" in error) {
        const { message } = error.data as { message: string };
        toast.error(message);
      } else toast.error("Oops! Something went wrong");
    }
  }, [error]);

  return (
    <PermissionContext.Provider value={{ setPermissions, permissions }}>
      {children}
    </PermissionContext.Provider>
  );
};

export default PermissionProvider

export const usePermissionContext: () => ContextOptions = () => {
  const context = React.useContext(PermissionContext);
  if (!context)
    throw new Error(
      "Permission context can only be used within permission provider"
    );
  return context;
};
