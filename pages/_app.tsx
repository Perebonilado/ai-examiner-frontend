import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Provider } from "react-redux";
import { reduxStore } from "@/config/redux-config";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ModalProvider from "@/contexts/ModalContext";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Provider store={reduxStore}>
      <ModalProvider>
        <Component {...pageProps} />
      </ModalProvider>
      <ToastContainer />
    </Provider>
  );
}
