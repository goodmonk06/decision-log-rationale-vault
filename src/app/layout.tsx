import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Decision Log Vault",
  description: "Track important decisions, their context, and rationale",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
