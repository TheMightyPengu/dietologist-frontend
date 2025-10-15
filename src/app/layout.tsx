"use client";
console.log("Rendering Layout Component");

import Navbar from "@/components/Navbar";
import "@/styles/globals.css";
import Head from "next/head";
import Footer from "@/components/Footer";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <Head>
        <title>Biki Dietologist</title>
        <meta name="description" content="Personalized nutrition guidance for a healthier life." />
      </Head> 
      <body>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}