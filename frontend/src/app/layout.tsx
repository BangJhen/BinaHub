import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BinaHub",
  description: "Platform penyalur tenaga kerja ex-narapidana dengan mitigasi risiko berbasis AI"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
