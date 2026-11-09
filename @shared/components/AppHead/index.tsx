import React, { FC, PropsWithChildren } from "react";

import Head from "next/head";
import Script from "next/script";

interface Props {
  title?: string;
}

const AppHead: FC<PropsWithChildren<Props>> = ({ title, children }) => {
  return (
    <Head>
      {/* Zoom stays allowed (WCAG 1.4.4). Text fields are 16px on phones so iOS doesn't zoom on focus. */}
      <meta
        key="viewport"
        name="viewport"
        content="width=device-width, initial-scale=1, viewport-fit=cover"
      />

      <meta
        name="Generate questions from your study documents"
        content="Generate questions from your study documents"
      />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta
        name="apple-mobile-web-app-title"
        content="Generate questions from your study documents"
      />
      <meta
        name="description"
        content="Generate questions from your study documents"
      />
      <meta name="format-detection" content="telephone=no" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="msapplication-TileColor" content="#2B5797" />
      <meta name="msapplication-tap-highlight" content="no" />
      <meta name="theme-color" content="#360B58" />

      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      <link rel="manifest" href="/manifest.json" />
      <link rel="shortcut icon" href="/favicon.ico" />
      <title>AI Examiner</title>

      <script
        async
        src="https://www.googletagmanager.com/gtag/js?id=G-8F87VFDMSQ"
      ></script>
      <script>
        {`
          window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-8F87VFDMSQ');
          `}
      </script>

      <script>
        {`
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-WXV3SGHG');`}
      </script>
      <script>
        {
        `
         (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-M5DRN2FJ');
          `
        }
      </script>
    
      {children}
    </Head>
  );
};

export default AppHead;
