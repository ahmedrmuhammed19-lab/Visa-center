import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Branch Directory | Global EIS",
  description: "Find visa application centers across Egypt. Powered by Global EIS.",
  keywords: ["visa", "Egypt", "Global EIS", "branch directory", "VFS", "TLScontact"],
  authors: [{ name: "Global EIS" }],
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {/* Live aurora background */}
        <div className="aurora-bg">
          <div className="aurora-blob b1"></div>
          <div className="aurora-blob b2"></div>
          <div className="aurora-blob b3"></div>
          <div className="aurora-blob b4"></div>
        </div>
        <div className="grid-overlay"></div>
        <div className="noise-overlay"></div>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange={false}
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
