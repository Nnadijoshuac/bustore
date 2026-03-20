import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/shared/providers";

export const metadata: Metadata = {
  title: {
    default: "Fluent - Global Payments for Creators and Businesses",
    template: "%s | Fluent",
  },
  description:
    "Receive international payments, manage your balance, and settle funds locally. Built for African freelancers and businesses.",
  keywords: ["payments", "business", "freelance", "africa", "global payments"],
  icons: {
    icon: "/logo_fluent.png",
    shortcut: "/logo_fluent.png",
    apple: "/logo_fluent.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
