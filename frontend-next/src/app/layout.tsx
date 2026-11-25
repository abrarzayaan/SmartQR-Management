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
    <html lang="en" className="dark">
      <body className="font-sans antialiased bg-canvas text-ink selection:bg-emerald-500/25 selection:text-emerald-200">
        <Providers>
          {children}
          <Toaster
            position="bottom-right"
            theme="dark"
            closeButton
            richColors
            toastOptions={{
              style: {
                background: "#181A1F",
                border: "1px solid #272B34",
                color: "#F3F4F6",
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
