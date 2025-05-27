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
  title: "PDF Extractor Tool",
  description:
    "A web application to extract text from PDF files using pdftotext.",
  keywords: ["PDF", "Text Extraction", "pdftotext", "Next.js"],
  openGraph: {
    title: "PDF Extractor Tool",
    description:
      "Extract text from PDF files easily using our web application.",
    images: [
      {
        url: "/demo.png", // Replace with the actual path to your image
        width: 1200,
        height: 630,
        alt: "PDF Extractor Tool",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PDF Extractor Tool",
    description:
      "Extract text from PDF files easily using our web application.",
    images: ["/demo.png"], // Replace with the actual path to your image
  },
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
