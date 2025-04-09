'use client';

import React from "react";
import FeaturedCars from "@/components/FeaturedCars";
import Brand from "@/components/brand"; // 👈 import the Brand component

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Welcome Section */}
      <section className="text-center py-12 px-6">
        <h1 className="text-4xl font-extrabold text-yellow-400 mb-4">
          Welcome to CarGO-A
        </h1>
        <p className="text-gray-300 max-w-2xl mx-auto">
          Explore premium rides, manage your rentals, and get rolling in style!
        </p>
      </section>

      {/* Featured Cars Section */}
      <FeaturedCars />

      {/* HR Divider */}
      <hr className="my-12 border-t-4 border-yellow-500 w-2/3 mx-auto rounded-full" />

      {/* Why Choose Us Section */}
      <section className="bg-black py-60 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <div
            className="rounded-2xl overflow-hidden shadow-xl md:ml-[-140px]"
            style={{ width: '680px', height: '280px' }}
          >
            <img
              src="/car4.png"
              alt="Luxury car"
              style={{ width: '100%', height: '100%', objectFit: 'fill' }}
              className="transition-transform duration-500 hover:scale-105"
            />
          </div>

          {/* Features */}
          <div>
            <h2 className="text-3xl font-bold text-yellow-500 mb-4">
              Why Choose CarGO-A?
            </h2>
            <p className="text-gray-400 mb-6 leading-relaxed text-sm">
              We redefine exotic car rental experiences with unmatched comfort,
              performance, and convenience — all wrapped in pure luxury.
            </p>

            <div className="space-y-3">
              <div className="flex items-center gap-3 bg-neutral-900 px-4 py-3 rounded-lg shadow hover:shadow-yellow-500/10 transition text-sm">
                <span className="text-yellow-400 font-bold">∞</span>
                <span className="text-white">Unlimited Mileage</span>
              </div>
              <div className="flex items-center gap-3 bg-neutral-900 px-4 py-3 rounded-lg shadow hover:shadow-yellow-500/10 transition text-sm">
                <span className="text-yellow-400 font-bold">$</span>
                <span className="text-white">No Damage Deposit</span>
              </div>
              <div className="flex items-center gap-3 bg-neutral-900 px-4 py-3 rounded-lg shadow hover:shadow-yellow-500/10 transition text-sm">
                <span className="text-yellow-400 font-bold">✦</span>
                <span className="text-white">Luxury Fleet Selection</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Marquee Component */}
      <Brand />

      {/* HR Divider */}
      <hr className="my-12 border-t-4 border-yellow-500 w-2/3 mx-auto rounded-full" />

      
      <section className="bg-black py-60 px-6 text-white">
  <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center mb-20">
    <div className="text-center md:text-left space-y-6">
      <h2 className="text-4xl md:text-5xl font-extrabold">GIVE THE GIFT OF DRIVING</h2>
      <button
        disabled
        className="bg-yellow-500 text-black font-bold py-2 px-6 rounded-md opacity-50 cursor-not-allowed"
      >
        Coming Soon
      </button>
    </div>

    <div className="shadow-[0_10px_30px_rgba(128,128,128,0.4)] rounded-xl overflow-hidden">
      <img
        src="/giftcard.png"
        alt="Gift Card"
        className="w-full object-cover"
      />
    </div>
  </div>

  <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center mt-40">
  <div className="shadow-[0_10px_30px_rgba(128,128,128,0.4)] rounded-xl overflow-hidden">
    <img
      src="/cargal.png"
      alt="Car Gallery"
      className="w-full object-cover"
    />
  </div>

  <div className="text-center md:text-left space-y-4">
    <h2 className="text-4xl md:text-5xl font-extrabold">
      EXPLORE OUR GALLERY
    </h2>
    <button className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-6 rounded-md transition">
      View Gallery
    </button>
  </div>
</div>

</section>



    </div>
  );
}


