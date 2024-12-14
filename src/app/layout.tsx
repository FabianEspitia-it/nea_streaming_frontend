import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { GoogleAnalytics } from "@next/third-parties/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: "500",
  style: "normal",
});

export const metadata: Metadata = {
  title: "Nea Streaming",
  description: "El servicio de streaming más parchado",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="bg-black">
      <body className={poppins.className}>
        <ToastContainer />

        {children}
      </body>
      <GoogleAnalytics gaId="G-YYBXWKDRM0" />
    </html>
  );
}
