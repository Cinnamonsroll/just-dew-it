import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Just Dew It - Mountain Dew Flavor Tracker",
  description: "Track every Mountain Dew flavor you've tried",
  icons: {
    icon: "/mtn-dew.png",
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#97d700" },
    { media: "(prefers-color-scheme: dark)", color: "#97d700" },
  ],
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
