"use client";

import React from "react";
import Link from "next/link";
import BeforeAfterSlider from "react-before-after-slider-component";
import "react-before-after-slider-component/dist/build.css";
import { Cpu, Heart, Zap } from "lucide-react";

const images = [
  { old: "/landmarkold.jpg", new: "/landmarknew.jpg" },
  { old: "/girlold.jpg", new: "/girlnew.jpg" },
  { old: "/familyold.jpg", new: "/familynew.jpg" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Hero Section */}
      <header className="relative w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-20 flex flex-col items-center">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-4 text-center tracking-tight">Qudely</h1>
        <p className="text-lg md:text-xl max-w-2xl text-center mb-8 leading-relaxed">
          Restore and colorize your old photos with AI — bring your memories back to life effortlessly.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/auth/login"
            className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition"
          >
            Login
          </Link>
          <Link
            href="/auth/signup"
            className="px-8 py-3 border border-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition"
          >
            Sign Up
          </Link>
        </div>
        <div className="absolute bottom-0 w-full h-24 bg-gradient-to-t from-gray-50 to-transparent"></div>
      </header>

      {/* Benefits Section */}
      <section className="py-16 px-4 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        {[
          {
            icon: <Cpu className="w-12 h-12 text-blue-600" />,
            title: "AI-Powered Magic",
            desc: "Transform old photos instantly with intelligent restoration & colorization.",
          },
          {
            icon: <Heart className="w-12 h-12 text-red-500" />,
            title: "Preserve Memories",
            desc: "Bring family moments and historical photos back to life in vivid detail.",
          },
          {
            icon: <Zap className="w-12 h-12 text-yellow-500" />,
            title: "Easy & Fast",
            desc: "No technical skills required — upload, restore, and download in seconds.",
          },
        ].map((item, idx) => (
          <div
            key={idx}
            className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition flex flex-col items-center gap-4"
          >
            {item.icon}
            <h3 className="text-xl font-bold mb-2">{item.title}</h3>
            <p className="text-gray-600">{item.desc}</p>
          </div>
        ))}
      </section>

      {/* Draggable Before/After Slider */}
      <section className="py-20 px-4 w-full max-w-6xl mx-auto space-y-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">Before & After AI Magic</h2>
        {images.map((img, idx) => (
          <div
            key={idx}
            className="relative w-full overflow-hidden rounded-2xl shadow-md bg-gray-200 aspect-[16/9] max-h-[600px] mx-auto"
          >
            <BeforeAfterSlider
              firstImage={{ imageUrl: img.old }}
              secondImage={{ imageUrl: img.new }}
            />
          </div>
        ))}
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center">
        <h3 className="text-3xl md:text-4xl font-bold mb-4">Ready to revive your photos?</h3>
        <p className="text-lg md:text-xl mb-8">Start your free trial today and see the magic in seconds.</p>
        <Link
          href="/auth/signup"
          className="px-10 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition"
        >
          Sign Up Now
        </Link>
      </section>

      {/* Footer */}
      <footer className="mt-16 py-8 w-full text-center bg-gray-100 border-t">
        <p className="text-sm mb-2">By Primyst</p>
        <div className="space-x-4">
          <a href="https://aq-portfolio-rose.vercel.app/" target="_blank" className="text-blue-600 hover:underline">Portfolio</a>
          <a href="https://github.com/primyst" target="_blank" className="text-blue-600 hover:underline">GitHub</a>
          <a href="https://x.com/ApexDev026" target="_blank" className="text-blue-600 hover:underline">X</a>
          <a href="https://www.instagram.com/qudus.26" target="_blank" className="text-blue-600 hover:underline">Instagram</a>
        </div>
      </footer>
    </div>
  );
}