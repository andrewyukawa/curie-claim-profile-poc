import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Curie - Claim Your Profile",
  description: "Claim your Curie profile using NPI verification",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

