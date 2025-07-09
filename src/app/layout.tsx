import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from '@/components/Providers'
import Navigation from '@/components/Navigation'
import BackgroundWrapper from '@/components/BackgroundWrapper'

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Club Connect - BRAC University",
  description: "Centralized club management system for BRAC University",
};

export function generateViewport() {
  return {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased min-h-screen`}
      >
        <Providers>
          <BackgroundWrapper>
            <Navigation />
            <main className="pb-4">
              {children}
            </main>
          </BackgroundWrapper>
        </Providers>
      </body>
    </html>
  );
}
