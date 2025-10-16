"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Cpu, Heart, Zap, ChevronRight } from "lucide-react";

export default function LandingPage() {
  const [sliderPositions, setSliderPositions] = useState([50, 50, 50]);

  const images = [
    { old: "/landmarkold.jpg", new: "/landmarknew.jpg", label: "Historic Landmark" },
    { old: "/girlold.jpg", new: "/girlnew.jpg", label: "Portrait Restoration" },
    { old: "/familyold.jpg", new: "/familynew.jpg", label: "Family Memory" },
  ];

  const BeforeAfterSlider = ({ oldImg, newImg, index }) => {
    const handleMouseMove = (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = (x / rect.width) * 100;
      setSliderPositions((prev) => {
        const newPos = [...prev];
        newPos[index] = Math.max(0, Math.min(100, percentage));
        return newPos;
      });
    };

    const handleTouchMove = (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.touches[0].clientX - rect.left;
      const percentage = (x / rect.width) * 100;
      setSliderPositions((prev) => {
        const newPos = [...prev];
        newPos[index] = Math.max(0, Math.min(100, percentage));
        return newPos;
      });
    };

    return (
      <div
        className="relative w-full h-full overflow-hidden bg-gray-900 cursor-col-resize"
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
      >
        {/* New Image (After) */}
        <img
          src={newImg}
          alt="Restored"
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        {/* Old Image (Before) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${sliderPositions[index]}%` }}
        >
          <img
            src={oldImg}
            alt="Original"
            className="w-screen h-full object-cover"
            style={{ width: `${(100 / sliderPositions[index]) * 100}%` }}
          />
        </div>

        {/* Slider Handle */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-white cursor-col-resize"
          style={{ left: `${sliderPositions[index]}%` }}
        >
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full p-3 shadow-lg">
            <ChevronRight className="w-4 h-4 text-gray-900 inline" />
            <ChevronRight className="w-4 h-4 text-gray-900 -ml-2 inline" />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      {/* Hero Section */}
      <header className="relative w-full py-24 flex flex-col items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: "2s" }}></div>
        </div>

        <div className="relative z-10 px-4 text-center">
          <div className="mb-6 inline-block">
            <div className="px-4 py-2 bg-blue-500/20 border border-blue-400/50 rounded-full">
              <p className="text-blue-300 text-sm font-semibold">AI-Powered Photo Restoration</p>
            </div>
          </div>

          <h1 className="text-6xl md:text-7xl font-black mb-6 text-white tracking-tight">
            Qudely
          </h1>

          <p className="text-xl md:text-2xl max-w-3xl mx-auto mb-8 text-slate-300 leading-relaxed font-light">
            Restore and colorize your cherished old photos with cutting-edge AI — bring your memories back to life in seconds.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              href="/auth/login"
              className="px-8 py-4 bg-white text-slate-900 font-semibold rounded-lg hover:bg-slate-100 transition transform hover:scale-105"
            >
              Login
            </Link>
            <Link
              href="/auth/signup"
              className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition transform hover:scale-105"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </header>

      {/* Benefits Section */}
      <section className="py-20 px-4 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <Cpu className="w-8 h-8" />,
              title: "AI-Powered Magic",
              desc: "Transform old photos instantly with intelligent restoration & colorization.",
              color: "from-blue-500 to-cyan-500",
            },
            {
              icon: <Heart className="w-8 h-8" />,
              title: "Preserve Memories",
              desc: "Bring family moments and historical photos back to life in vivid detail.",
              color: "from-pink-500 to-rose-500",
            },
            {
              icon: <Zap className="w-8 h-8" />,
              title: "Easy & Fast",
              desc: "No technical skills required — upload, restore, and download in seconds.",
              color: "from-yellow-500 to-orange-500",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="group relative p-8 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 hover:border-slate-500 transition-all hover:shadow-2xl hover:shadow-blue-500/20"
            >
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${item.color} mb-4`}>
                <div className="text-white">{item.icon}</div>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
              <p className="text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Before/After Slider Section */}
      <section className="py-20 px-4 w-full">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Before & After AI Magic</h2>
            <p className="text-slate-400 text-lg">Drag the slider to see the transformation</p>
          </div>

          <div className="space-y-12">
            {images.map((img, idx) => (
              <div key={idx} className="group">
                <p className="text-slate-300 font-semibold mb-4 ml-2">{img.label}</p>
                <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl shadow-blue-500/20 aspect-video bg-slate-900">
                  <BeforeAfterSlider oldImg={img.old} newImg={img.new} index={idx} />
                  
                  {/* Labels */}
                  <div className="absolute top-4 left-4 z-20 bg-black/50 backdrop-blur px-3 py-1 rounded text-white text-sm font-semibold">
                    Before
                  </div>
                  <div className="absolute top-4 right-4 z-20 bg-black/50 backdrop-blur px-3 py-1 rounded text-white text-sm font-semibold">
                    After
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 w-full">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-12 md:p-20 text-center shadow-2xl">
          <h3 className="text-4xl md:text-5xl font-black text-white mb-6">Ready to revive your memories?</h3>
          <p className="text-lg md:text-xl text-blue-100 mb-10 font-light">
            Start your free trial today and see the magic in seconds.
          </p>
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 px-10 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-slate-100 transition transform hover:scale-105"
          >
            Get Started Now <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-20 py-12 w-full text-center bg-black/30 border-t border-slate-700">
        <p className="text-slate-400 text-sm mb-6">Made by Primyst</p>
        <div className="flex flex-wrap justify-center gap-6">
          {[
            { label: "Portfolio", url: "https://aq-portfolio-rose.vercel.app/" },
            { label: "GitHub", url: "https://github.com/primyst" },
            { label: "X", url: "https://x.com/ApexDev026" },
            { label: "Instagram", url: "https://www.instagram.com/qudus.26" },
          ].map((link) => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-blue-400 transition font-medium"
            >
              {link.label}
            </a>
          ))}
        </div>
      </footer>
    </div>
  );
}