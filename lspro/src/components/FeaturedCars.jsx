import React from "react";
import Image from "next/image";

const cars = [
  {
    name: "TATA Curvv",
    image: "/car1.png",
  },
  {
    name: "Maruti Suzuki Ciaz zxi",
    image: "/car2.png",
  },
  {
    name: "MG Astor",
    image: "/car3.png",
  },
];

const FeaturedCars = () => {
  return (
    <section className="bg-black py-10 px-8 text-white">
      <h2 className="text-3xl font-bold text-center text-yellow-500 mb-10">
        FEATURED
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cars.map((car, index) => (
          <div
            key={index}
            className="bg-white text-black rounded-md overflow-hidden shadow-md"
          >
            <Image
              src={car.image}
              alt={car.name}
              width={600}
              height={400}
              className="w-full object-cover"
            />
            <div className="p-4 font-bold text-sm uppercase">
              {car.name}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 flex justify-center">
        <button className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 px-6 rounded">
          View Fleet
        </button>
      </div>
    </section>
  );
};

export default FeaturedCars;
