'use client';

import React from 'react';

const brands = [
  "Mercedes-Benz",
  "BMW",
  "Audi",
  "Jaguar",
  "Land Rover",
  "MG",
  "Suzuki",
  "Lexus",
  "Volvo",
  "Mini",
  "Tata"
];

export default function Brand() {
  return (
    <section className="bg-black py-16 overflow-hidden">
      <h2 className="text-center text-yellow-400 text-3xl font-extrabold mb-10 tracking-wide">
        Top Brands We Offer
      </h2>

      <div className="relative w-full overflow-hidden">
        <div className="flex animate-scroll whitespace-nowrap gap-24">
          {[...brands, ...brands].map((brand, index) => (
            <span
              key={index}
              className="text-white text-4xl font-semibold tracking-wider min-w-max"
            >
              {brand}
            </span>
          ))}
        </div>
      </div>

      {/* Custom CSS for seamless animation */}
      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
      `}</style>
    </section>
  );
}
