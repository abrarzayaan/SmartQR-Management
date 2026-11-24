import type { Metadata } from "next";
import { Toaster } from "sonner";
import Providers from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "SmartQR Platform | Enterprise Dynamic QR Code Engine",
  description:
    "Self-hosted, high-performance Smart Dynamic QR Code Generator, Real-Time Scannability Guard, and Audience Analytics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased selection:bg-blue-600/30 selection:text-blue-200">
        <Providers>
          {children}
          <Toaster
            position="top-right"
            theme="dark"
            closeButton
            richColors
            toastOptions={{
              style: {
                background: "#121824",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "#f8fafc",
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}

