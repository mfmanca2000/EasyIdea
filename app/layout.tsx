import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Easy Idea - Save Your App Ideas",
  description: "Quickly save and manage your app ideas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
