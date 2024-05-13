import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export const useActiveNavLink = () => {
  const { pathname } = useRouter();
  const [activeNavLink, setActiveNavLink] = useState<string | undefined>("/");

  const getActiveLink = () => {
    return pathname;
  };

  useEffect(() => {
    setActiveNavLink(getActiveLink());
  }, [pathname]);

  return [activeNavLink];
};
