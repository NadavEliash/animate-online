import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Animate Online",
  description: "Created by Nadav Eliash",

};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="pencil.svg" sizes="any" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}