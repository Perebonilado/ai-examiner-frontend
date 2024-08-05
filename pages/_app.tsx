import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Provider } from "react-redux";
import { reduxStore } from "@/config/redux-config";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ModalProvider from "@/contexts/ModalContext";
import "react-tooltip/dist/react-tooltip.css";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import PermissionProvider from "@/contexts/PermissionContext";
import LoaderProvider from "@/contexts/LoaderContext";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Provider store={reduxStore}>
      <PermissionProvider>
        <ModalProvider>
          <LoaderProvider>
            <Component {...pageProps} />
          </LoaderProvider>
        </ModalProvider>
      </PermissionProvider>
      <ToastContainer />
      <Analytics />
      <SpeedInsights />
    </Provider>
  );
}
