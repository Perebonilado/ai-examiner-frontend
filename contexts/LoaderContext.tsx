import { RootState } from "@/config/redux-config";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useModalContext } from "./ModalContext";
import { AppLoader } from "@/@shared/components/AppLoader";

interface ContextOptions {}

const LoaderContext = React.createContext<ContextOptions | null>(null);

const LoadingAndErrorProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const { loading, loadingMessage } = useSelector(
    (state: RootState) => state.loadingAndErrorState
  );
  const { setModalContent } = useModalContext();

  useEffect(() => {
    if (loading) {
      setModalContent(<AppLoader loaderMessage={loadingMessage} />);
    } else {
      setModalContent(null);
    }
  }, [loading]);

  return (
    <LoaderContext.Provider value={{}}>
      {children}
    </LoaderContext.Provider>
  );
};

export default LoadingAndErrorProvider;
