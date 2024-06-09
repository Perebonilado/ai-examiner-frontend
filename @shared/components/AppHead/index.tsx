import React, { FC } from "react";

import Head from "next/head";

interface Props {
  title?: string;
}

const AppHead: FC<Props> = ({ title }) => {
  return (
    <Head>
      <meta
        name="viewport"
        content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, user-scalable=no, viewport-fit=cover"
      />

      <meta name="pwa-demo" content="pwa-demo" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="pwa-demo" />
      <meta name="description" content="pwa-demo" />
      <meta name="format-detection" content="telephone=no" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="msapplication-TileColor" content="#2B5797" />
      <meta name="msapplication-tap-highlight" content="no" />
      <meta name="theme-color" content="#360B58" />

      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      <link rel="manifest" href="/manifest.json" />
      <link rel="shortcut icon" href="/favicon.ico" />
      <title>AI Examiner {title ? `| ${title}` : ""}</title>
    </Head>
  );
};

export default AppHead;
