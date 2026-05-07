import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI App Generator",
  description: "Generate working CRUD apps from JSON configuration"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
