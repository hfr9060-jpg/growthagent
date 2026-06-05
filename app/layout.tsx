import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GTM OS AI Video Intelligence Radar",
  description: "HTML frontend for growth_agent runs, topics, reviews, and campaigns."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
