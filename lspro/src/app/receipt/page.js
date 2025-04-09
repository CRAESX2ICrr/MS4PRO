'use client';

import { useContext, useState } from 'react';
import { CartContext } from '@/components/context/CartContext';
import Image from 'next/image';
import axios from 'axios';

const ReceiptPage = () => {
  const { cartItems, user } = useContext(CartContext);
  const [durations, setDurations] = useState(
    cartItems.reduce((acc, item) => {
      acc[item.id] = 1;
      return acc;
    }, {})
  );
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (carId, delta) => {
    setDurations(prev => ({
      ...prev,
      [carId]: Math.max(1, (prev[carId] || 1) + delta),
    }));
  };

  const total = cartItems.reduce(
    (sum, item) => sum + item.price_per_day * (durations[item.id] || 1),
    0
  );
  const handleConfirmBooking = async () => {
    if (!user?.email) return alert('You must be logged in');

    setLoading(true);
    try {
      const today = new Date();

      const bookings = cartItems.map(car => {
        const days = durations[car.id];
        const pickupDate = today.toISOString().split('T')[0];
        const returnDate = new Date(today.getTime() + days * 86400000)
          .toISOString().split('T')[0];

        return {
          car_id: car.id,
          pickup_date: pickupDate,
          return_date: returnDate,
          price_per_day: car.price_per_day, // ✅ include this for total calculation
        };
      });

      await axios.post('http://localhost:3001/api/bookings', {
        user_email: user.email,
        bookings,
      });

      setSuccess(true);
    } catch (err) {
      console.error('Booking failed:', err);
      alert('Something went wrong!');
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="p-8 text-white max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold mb-4">Booking Receipt</h1>

      {cartItems.map(car => (
        <div key={car.id} className="bg-neutral-800 rounded-lg p-4 flex flex-col md:flex-row">
          <div className="relative w-full md:w-1/2 h-48">
            <Image src={car.image_url} alt={car.name} fill className="object-cover rounded-lg" />
          </div>
          <div className="md:ml-6 mt-4 md:mt-0 space-y-1 flex-1">
            <h2 className="text-xl font-bold text-yellow-300">{car.name}</h2>
            <p>₹{car.price_per_day} per day</p>
            <div className="flex items-center space-x-4 mt-2">
              <button onClick={() => handleChange(car.id, -1)} className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded">-</button>
              <span>{durations[car.id]} day(s)</span>
              <button onClick={() => handleChange(car.id, 1)} className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded">+</button>
            </div>
            <p className="text-sm mt-1 text-gray-400">
              Subtotal: ₹{durations[car.id] * car.price_per_day}
            </p>
          </div>
        </div>
      ))}

      <div className="text-xl font-bold text-right mt-6">
        Total: ₹{total}
      </div>

      <button
        onClick={handleConfirmBooking}
        disabled={loading}
        className="mt-6 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
      >
        {loading ? 'Booking...' : 'Confirm Booking'}
      </button>

      {success && (
        <p className="text-green-400 mt-4 font-semibold">
          Booking confirmed successfully! 🎉
        </p>
      )}
    </div>
  );
};

export default ReceiptPage;
