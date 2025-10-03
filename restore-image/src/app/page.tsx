"use client";

import React from "react";
import Link from "next/link";
import BeforeAfterSlider from "react-before-after-slider-component";
import "react-before-after-slider-component/dist/build.css";

const images = [
  { old: "/landmarkold.jpg", new: "/landmarknew.jpg" },
  { old: "/girlold.jpg", new: "/girlnew.jpg" },
  { old: "/familyold.jpg", new: "/familynew.jpg" },
  { old: "/cowboyold.jpg", new: "/cowboynew.jpg" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
      {/* Hero Section */}
      <header className="w-full bg-blue-600 text-white py-12 flex flex-col items-center space-y-4">
        <h1 className="text-4xl font-bold">Qudely</h1>
        <p className="text-lg max-w-xl text-center">
          Restore and colorize your old photos using AI — see the magic before your eyes!
        </p>
        <div className="space-x-4 mt-4">
          <Link href="/auth/login" className="px-6 py-2 bg-white text-blue-600 rounded font-semibold">
            Login
          </Link>
          <Link href="/auth/signup" className="px-6 py-2 border border-white rounded font-semibold">
            Sign Up
          </Link>
        </div>
      </header>

      {/* Draggable Before/After Slider */}
      <section className="mt-12 w-full max-w-4xl px-4 space-y-8">
        <h2 className="text-2xl font-bold text-center mb-6">Before & After AI Magic</h2>
        {images.map((img, idx) => (
          <div key={idx} className="rounded shadow overflow-hidden">
            <BeforeAfterSlider
              firstImage={Object.assign(new Image(), { src: img.old })}
              secondImage={Object.assign(new Image(), { src: img.new })}
              width={640}
              height={400}
            />
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer className="mt-16 py-8 w-full text-center bg-gray-100">
        <p className="text-sm mb-2">By Primyst</p>
        <div className="space-x-4">
          <a href="https://aq-portfolio-rose.vercel.app/" target="_blank" className="text-blue-600 underline">Portfolio</a>
          <a href="https://github.com/primyst" target="_blank" className="text-blue-600 underline">GitHub</a>
          <a href="https://x.com/ApexDev026" target="_blank" className="text-blue-600 underline">X</a>
          <a href="https://www.instagram.com/qudus.26" target="_blank" className="text-blue-600 underline">Instagram</a>
        </div>
      </footer>
    </div>
  );
}