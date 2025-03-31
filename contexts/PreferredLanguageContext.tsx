import { RootState } from "@/config/redux-config";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useModalContext } from "./ModalContext";
import { useGetPreferredLanguageQuery } from "@/api-services/preferred-language.service";
import Dialog from "@/@shared/components/Dialog";
import PreferredLanguageModal from "@/@shared/components/PreferredLanguageModal";
import { accessToken } from "@/constants";
import Cookies from "js-cookie";

interface ContextOptions {}

const PreferredLanguageContext = React.createContext<ContextOptions | null>(
  null
);

const PreferredLanguageProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const { loading, loadingMessage } = useSelector(
    (state: RootState) => state.loadingAndErrorState
  );
  const { setModalContent } = useModalContext();
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);

  useEffect(() => {
    const isLoggedIn = Cookies.get(accessToken);

    if (isLoggedIn) {
      setIsUserLoggedIn(true);
    }
  }, [Cookies.get(accessToken)]);

  const { data } = useGetPreferredLanguageQuery("", {skip: !isUserLoggedIn});


  useEffect(() => {
    if (data && !data.preferredLanguageSet && !loading) {
      setModalContent(<PreferredLanguageModal />);
    }
  }, [data, loading]);

  return (
    <PreferredLanguageContext.Provider value={{}}>
      {children}
    </PreferredLanguageContext.Provider>
  );
};

export default PreferredLanguageProvider;
