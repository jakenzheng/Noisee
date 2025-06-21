import React from "react"
import type { Metadata } from "next"
import "./globals.css"
import AudioReactiveBall from "../components/AudioReactiveBall"


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="relative z-10">
        <AudioReactiveBall />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  )
}

export const metadata: Metadata = {
  title: "Noisee",
  description: "The all-in-one app for focus and relaxation.",
  icons: [{ rel: "icon", url: "/favicon.svg" }],
};
