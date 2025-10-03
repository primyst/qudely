"use client";

import Slider from "react-slick";
import Link from "next/link";

const images = [
  { old: "/landmarkold.jpg", new: "/landmarknew.jpg" },
  { old: "/girlold.jpg", new: "/girlnew.jpg" },
  { old: "/familyold.jpg", new: "/familynew.jpg" },
  { old: "/cowboyold.jpg", new: "/cowboynew.jpg" },
];

export default function LandingPage() {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

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

      {/* Before/After Slider */}
      <section className="mt-12 w-full max-w-4xl px-4">
        <h2 className="text-2xl font-bold text-center mb-6">Before & After AI Magic</h2>
        <Slider {...settings}>
          {images.map((img, idx) => (
            <div key={idx} className="flex justify-center space-x-4">
              <div className="flex flex-col items-center">
                <img src={img.old} alt="Before" className="w-64 h-64 object-cover rounded shadow" />
                <span className="mt-2 font-medium">Before</span>
              </div>
              <div className="flex flex-col items-center">
                <img src={img.new} alt="After" className="w-64 h-64 object-cover rounded shadow" />
                <span className="mt-2 font-medium">After</span>
              </div>
            </div>
          ))}
        </Slider>
      </section>

      {/* Footer / By Primyst */}
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
      
