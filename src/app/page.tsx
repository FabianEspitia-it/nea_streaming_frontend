"use client";

import Hero from "@/components/Hero";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-black">
      <Image
        src="/images/gogo_logo.png"
        alt="Background"
        layout="fill"
        objectFit="cover"
        quality={100}
        className="z-0"
      />

      <div className="absolute inset-0 bg-black opacity-50"></div>
      <main className="flex flex-col justify-center items-center flex-1 px-8 max-w-screen-xl mx-auto">
        <Hero />
      </main>
    </div>
  );
}
