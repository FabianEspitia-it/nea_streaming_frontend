import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import SessionWarmup from "@/components/SessionWarmup";
import "./globals.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: "500",
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
    <html lang="es">
      <body className={poppins.className}>
        <SessionWarmup />
        <ToastContainer />

        {children}
      </body>
    </html>
  );
}
