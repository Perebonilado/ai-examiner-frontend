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
import { useEffect } from "react";
import PreferredLanguageProvider from "@/contexts/PreferredLanguageContext";

export default function App({ Component, pageProps }: AppProps) {
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
    <>
      <noscript>
        <iframe
          src="https://www.googletagmanager.com/ns.html?id=GTM-WXV3SGHG"
          height="0"
          width="0"
          style={{ display: "none", visibility: "hidden" }}
        ></iframe>
      </noscript>
      <Provider store={reduxStore}>
        <PermissionProvider>
          <ModalProvider>
            <LoaderProvider>
              <PreferredLanguageProvider>
                <Component {...pageProps} />
              </PreferredLanguageProvider>
            </LoaderProvider>
          </ModalProvider>
        </PermissionProvider>
        <ToastContainer />
        <Analytics />
        <SpeedInsights />
      </Provider>
    </>
  );
}
