'use client';

import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Modal from "@/@shared/components/Modal";

interface ContextOptions {
  setModalContent: React.Dispatch<React.SetStateAction<React.ReactNode>>;
}

const ModalContext = React.createContext<ContextOptions | null>(null);

const ModalProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [modalContent, setModalContent] = useState<React.ReactNode | null>(
    null
  );
  const router = useRouter();

  useEffect(() => {
    if (modalContent) setModalContent(null);
  }, [router.pathname]);

  return (
    <ModalContext.Provider value={{ setModalContent }}>
      {modalContent ? <Modal>{modalContent}</Modal> : null}
      {children}
    </ModalContext.Provider>
  );
};

export default ModalProvider;

export const useModalContext: () => ContextOptions = () => {
  const context = React.useContext(ModalContext);
  if (!context)
    throw new Error("Modal context can only be used within modal provider");
  return context;
};