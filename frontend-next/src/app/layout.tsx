import type { Metadata } from "next";
import { Toaster } from "sonner";
import Providers from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "SmartQR — Dynamic QR Code Studio & Manager",
  description:
    "Create, customize, track, and manage dynamic QR codes with real-time scannability protection.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-canvas text-ink selection:bg-blue-100 selection:text-blue-900">
        <Providers>
          {children}
          <Toaster
            position="bottom-right"
            theme="light"
            closeButton
            richColors
            toastOptions={{
              style: {
                background: "#ffffff",
                border: "1px solid #e5e7eb",
                color: "#111827",
                boxShadow: "0 10px 25px -5px rgba(16, 24, 40, 0.1)",
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
