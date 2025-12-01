import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Upload, Sparkles, Clock, Shield, Zap } from "lucide-react";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";

const beforeAfterImages = [
  {
    old: "/landmarkold.jpg",
    new: "/landmarknew.jpg",
    label: "Historic Landmark Restored",
  },
  {
    old: "/girlold.jpg",
    new: "/girlnew.jpg",
    label: "Portrait Brought Back to Life",
  },
  {
    old: "/familyold.jpg",
    new: "/familynew.jpg",
    label: "Cherished Family Memory Revived",
  },
];

export default function Home() {
  return (
    <>
      <div className="min-h-screen bg-white text-gray-900">
        {/* Hero Section */}
        <section className="relative overflow-hidden px-6 pt-24 pb-32 md:pt-32 md:pb-40">
          <div className="absolute inset-0 bg-grid-gray-100/50 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
          
          <div className="relative mx-auto max-w-7xl text-center">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              Bring Your Old Photos
              <span className="block text-amber-600 mt-2">Back to Life</span>
            </h1>
            <p className="mt-8 text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Qudely uses advanced AI to restore faded, damaged, or old photographs 
              with stunning clarity — in seconds.
            </p>
            
            <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/upload"
                className="group inline-flex items-center gap-3 bg-gray-900 text-white px-8 py-5 rounded-full text-lg font-semibold hover:bg-gray-800 transition-all transform hover:scale-105 shadow-xl"
              >
                Try Qudely for Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/upload"
                className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium"
              >
                <Upload className="w-5 h-5" />
                No signup required
              </Link>
            </div>
          </div>
        </section>

        {/* Before & After Gallery */}
        <section className="px-6 py-20 bg-gray-50">
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold">
                See the Magic in Action
              </h2>
              <p className="mt-4 text-xl text-gray-600">
                Drag the slider to reveal the restored image
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-10">
              {beforeAfterImages.map((item, index) => (
                <div key={index} className="group">
                  <div className="relative overflow-hidden rounded-2xl shadow-2xl bg-white">
                    <BeforeAfterSlider
                      before={item.old}
                      after={item.new}
                      label={item.label}
                    />
                  </div>
                  <p className="mt-6 text-center text-lg font-medium text-gray-800">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="px-6 py-24">
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold">
                Restore Memories with Confidence
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-12">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 text-amber-600 mb-6">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">AI-Powered Precision</h3>
                <p className="text-gray-600 leading-relaxed">
                  Advanced neural networks repair scratches, enhance colors, and sharpen details 
                  while preserving authenticity.
                </p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 text-amber-600 mb-6">
                  <Zap className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">Lightning Fast</h3>
                <p className="text-gray-600 leading-relaxed">
                  Get professional-grade restorations in under 10 seconds. 
                  No waiting, no complex software.
                </p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 text-amber-600 mb-6">
                  <Shield className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">Privacy First</h3>
                <p className="text-gray-600 leading-relaxed">
                  Your photos are processed securely and automatically deleted 
                  after restoration.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-6 py-24 bg-gray-900 text-white">
          <div className="mx-auto max-w-4xl text-center">
            <Clock className="w-16 h-16 mx-auto mb-6 text-amber-500" />
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Don’t Let Memories Fade Away
            </h2>
            <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
              Restore your precious photos today — completely free, no account needed.
            </p>
            <Link
              href="/upload"
              className="inline-flex items-center gap-3 bg-amber-500 text-gray-900 px-10 py-6 rounded-full text-xl font-bold hover:bg-amber-400 transition-all transform hover:scale-105 shadow-2xl"
            >
              Restore Your First Photo Free
              <ArrowRight className="w-6 h-6" />
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-6 py-12 border-t border-gray-200">
          <div className="mx-auto max-w-7xl text-center text-gray-600">
            <p className="text-lg font-medium text-gray-900">Qudely</p>
            <p className="mt-2">Preserving yesterday, for tomorrow.</p>
          </div>
        </footer>
      </div>
    </>
  );
              }
