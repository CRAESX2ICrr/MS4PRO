'use client';

import React, { useEffect, useState, useContext } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { CartContext } from '@/components/context/CartContext';

const RentalPage = () => {
  const [cars, setCars] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    brand: '',
    fuel_type: '',
    transmission: '',
    price_sort: '',
  });

  const router = useRouter();
  const { addToCart, user } = useContext(CartContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [carsRes, bookingsRes] = await Promise.all([
          fetch('http://localhost:3001/api/cars'),
          fetch('http://localhost:3001/api/admin/bookings')
        ]);
        
        const carsData = await carsRes.json();
        const bookingsData = await bookingsRes.json();
        
        setCars(carsData);
        setBookings(bookingsData);
        
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Refresh data every 2 minutes
    const interval = setInterval(fetchData, 120000);
    return () => clearInterval(interval);
  }, []);

  const isCarBooked = (carId) => {
    const now = new Date();
    return bookings.some(booking => 
      booking.car_id === carId && 
      booking.status === 'confirmed' &&
      new Date(booking.pickup_date) <= now && 
      new Date(booking.return_date) >= now
    );
  };

  const handleAddToCart = (car) => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    if (isCarBooked(car.id)) {
      alert('This car is currently booked and unavailable.');
      return;
    }

    addToCart(car);
    router.push('/cart');
  };

  const filteredCars = cars
    .filter((car) => {
      const matchesBrand = !filters.brand || car.brand === filters.brand;
      const matchesFuel = !filters.fuel_type || car.fuel_type === filters.fuel_type;
      const matchesTrans = !filters.transmission || car.transmission === filters.transmission;
      return matchesBrand && matchesFuel && matchesTrans;
    })
    .sort((a, b) => {
      if (filters.price_sort === 'low-high') return a.price_per_day - b.price_per_day;
      if (filters.price_sort === 'high-low') return b.price_per_day - a.price_per_day;
      return 0;
    });

  if (loading) {
    return (
      <div className="text-white text-center py-20">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-yellow-500 border-r-transparent"></div>
        <p className="mt-2">Loading available cars...</p>
      </div>
    );
  }

  return (
    <section className="bg-black min-h-screen px-6 py-12 text-white flex flex-col items-center">
      <h1 className="text-4xl font-bold text-yellow-500 mb-10 text-center">Available Cars</h1>

      {/* Filter Options */}
      <div className="w-full max-w-5xl flex flex-col md:flex-row md:items-center gap-4 mb-10">
        <select
          onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
          value={filters.brand}
          className="bg-neutral-800 text-white px-4 py-2 rounded w-full md:w-1/4"
        >
          <option value="">All Brands</option>
          {[...new Set(cars.map(car => car.brand))].map((brand) => (
            <option key={brand} value={brand}>{brand}</option>
          ))}
        </select>

        <select
          onChange={(e) => setFilters({ ...filters, fuel_type: e.target.value })}
          value={filters.fuel_type}
          className="bg-neutral-800 text-white px-4 py-2 rounded w-full md:w-1/4"
        >
          <option value="">All Fuel Types</option>
          <option value="Petrol">Petrol</option>
          <option value="Diesel">Diesel</option>
          <option value="Electric">Electric</option>
          <option value="Hybrid">Hybrid</option>
        </select>

        <select
          onChange={(e) => setFilters({ ...filters, transmission: e.target.value })}
          value={filters.transmission}
          className="bg-neutral-800 text-white px-4 py-2 rounded w-full md:w-1/4"
        >
          <option value="">All Transmissions</option>
          <option value="Manual">Manual</option>
          <option value="Automatic">Automatic</option>
        </select>

        <select
          onChange={(e) => setFilters({ ...filters, price_sort: e.target.value })}
          value={filters.price_sort}
          className="bg-neutral-800 text-white px-4 py-2 rounded w-full md:w-1/4"
        >
          <option value="">Sort by Price</option>
          <option value="low-high">Low to High</option>
          <option value="high-low">High to Low</option>
        </select>
      </div>

      {/* Car Listings */}
      <div className="space-y-10 w-full max-w-5xl">
        {filteredCars.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-xl text-yellow-500">No cars match your filters</p>
            <button 
              onClick={() => setFilters({
                brand: '',
                fuel_type: '',
                transmission: '',
                price_sort: ''
              })}
              className="mt-4 text-yellow-400 hover:underline"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          filteredCars.map((car) => {
            const booked = isCarBooked(car.id);
            
            return (
              <div
                key={car.id}
                className={`bg-neutral-900 rounded-xl overflow-hidden shadow-lg transition-all duration-300 flex flex-col md:flex-row ${
                  booked ? 'opacity-80 border-2 border-red-500' : 'hover:shadow-yellow-500/20 border-2 border-transparent'
                }`}
              >
                <div className="relative w-full md:w-1/2 aspect-[4/3]">
                  <Image
                    src={car.image_url}
                    alt={car.name}
                    fill
                    className="object-cover rounded-t-xl md:rounded-l-xl md:rounded-t-none"
                    priority
                  />
                  {booked && (
                    <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                      <span className="text-white font-bold text-lg bg-red-600 px-4 py-2 rounded-lg">
                        Booked
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-6 flex flex-col justify-between w-full md:w-1/2">
                  <div>
                    <h2 className="text-2xl font-bold text-yellow-400 mb-2">{car.name}</h2>
                    <p className="text-sm text-gray-300">Brand: {car.brand}</p>
                    <p className="text-sm text-gray-300">Year: {car.model_year}</p>
                    <p className="text-sm text-gray-300">Fuel: {car.fuel_type}</p>
                    <p className="text-sm text-gray-300">Transmission: {car.transmission}</p>
                    <p className="text-lg font-semibold text-white mt-2">₹{car.price_per_day}/day</p>
                  </div>

                  <button
                    className={`mt-6 w-full font-bold py-3 px-4 rounded-lg transition ${
                      booked
                        ? 'bg-gray-600 cursor-not-allowed'
                        : 'bg-yellow-500 hover:bg-yellow-600 text-black transform hover:scale-105'
                    }`}
                    onClick={() => handleAddToCart(car)}
                    disabled={booked}
                  >
                    {booked ? 'Currently Unavailable' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};

export default RentalPage;