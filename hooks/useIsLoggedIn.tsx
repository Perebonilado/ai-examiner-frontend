import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { accessToken } from "@/constants";

export const useIsLoggedIn = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = Cookies.get(accessToken);

    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  return { isLoggedIn };
};
