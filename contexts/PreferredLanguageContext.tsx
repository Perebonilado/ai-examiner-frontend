import { RootState } from "@/config/redux-config";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useModalContext } from "./ModalContext";

interface ContextOptions {}

const PreferredLanguageContext =  React.createContext<ContextOptions | null>(null);

const PreferredLanguageProvider: React.FC<React.PropsWithChildren> = ({
    children,
  }) => {
    const { loading, loadingMessage } = useSelector(
      (state: RootState) => state.loadingAndErrorState
    );
    const { setModalContent } = useModalContext();
  
    // useEffect(() => {
    //   if (loading) {
    //     setModalContent(<AppLoader loaderMessage={loadingMessage} />);
    //   } else {
    //     setModalContent(null);
    //   }
    // }, [loading]);
  
    return (
      <PreferredLanguageContext.Provider value={{}}>
        {children}
      </PreferredLanguageContext.Provider>
    );
  };

  export default PreferredLanguageProvider
  