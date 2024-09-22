"use client";

import localFont from "next/font/local";
import "./globals.css";
import { MetaMaskUIProvider } from "@metamask/sdk-react-ui";

const nounsFontSolid = localFont({
  src: "./fonts/LondrinaSolid-Black.ttf",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Londrina+Solid:wght@100;300;400;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${nounsFontSolid.variable} ${nounsFontSolid.variable} antialiased`}
      >
        <MetaMaskUIProvider
          sdkOptions={{
            dappMetadata: {
              name: "Example React UI Dapp",
              url: window.location.href,
            },
          }}
        >
          {children}
        </MetaMaskUIProvider>
      </body>
    </html>
  );
}
