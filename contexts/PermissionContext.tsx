"use client";

import { useGetPermissionsQuery } from "@/api-services/permission.service";
import { accessToken } from "@/constants";
import React, { useEffect } from "react";
import Cookies from "js-cookie";
import { toast } from "react-toastify";

interface ContextOptions {}

const PermissionContext = React.createContext<ContextOptions | null>(null);

const PermissionProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const isUserLoggedIn = Cookies.get(accessToken);

  const { error } = useGetPermissionsQuery("", { skip: !isUserLoggedIn });

  useEffect(() => {
    if (error && "status" in error) {
      if ("data" in error) {
        const { message } = error.data as { message: string };
        toast.error(message);
      } else toast.error("Oops! Something went wrong");
    }
  }, [error]);

  useEffect(() => {
    if (typeof Promise.withResolvers === "undefined") {
      if (window)
        // @ts-expect-error This does not exist outside of polyfill which this is doing
        window.Promise.withResolvers = function () {
          let resolve, reject;
          const promise = new Promise((res, rej) => {
            resolve = res;
            reject = rej;
          });
          return { promise, resolve, reject };
        };
    }
  }, []);

  return (
    <PermissionContext.Provider value={{}}>
      {children}
    </PermissionContext.Provider>
  );
};

export default PermissionProvider;

export const usePermissionContext: () => ContextOptions = () => {
  const context = React.useContext(PermissionContext);
  if (!context)
    throw new Error(
      "Permission context can only be used within permission provider"
    );
  return context;
};
