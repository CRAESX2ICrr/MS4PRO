'use client';

import React, { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // ✅ Import router
import { CartContext } from '@/components/context/CartContext';
import axios from 'axios';
import Image from 'next/image';

const CartPage = () => {
  const router = useRouter(); // ✅ Initialize router
  const { cartItems, setCartItems, user, removeFromCart } = useContext(CartContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCart = async () => {
      if (!user?.id) {
        setCartItems([]);
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(`http://localhost:3001/api/cart?user_id=${user.id}`);
        setCartItems(res.data);
      } catch (err) {
        console.error('Failed to fetch cart:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [user, setCartItems]);

  if (!user) {
    return <p className="p-4 text-red-500">Please log in to view your cart.</p>;
  }

  if (loading) return <p className="p-4 text-white">Loading cart...</p>;

  const total = cartItems.reduce((sum, car) => sum + Number(car.price_per_day), 0);

  return (
    <div className="flex flex-col items-center space-y-12 mt-12 px-4">
      {cartItems.length === 0 ? (
        <p className="text-gray-400 text-lg">Your cart is empty.</p>
      ) : (
        <>
          {cartItems.map((car) => (
            <div
              key={car.id}
              className="w-full max-w-4xl bg-neutral-900 rounded-xl overflow-hidden shadow-md hover:shadow-yellow-500/30 transition-all duration-300"
            >
              <div className="flex flex-col md:flex-row">
                {/* Image on left */}
                <div className="relative w-full md:w-1/2 h-60 md:h-auto">
                  <Image
                    src={car.image_url}
                    alt={car.name || 'Car image'}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Content on right */}
                <div className="w-full md:w-1/2 p-4 space-y-1">
                  <h2 className="text-xl font-bold text-yellow-300">{car.name}</h2>
                  <p className="text-sm text-gray-300">Brand: {car.brand}</p>
                  <p className="text-sm text-gray-300">Year: {car.model_year}</p>
                  <p className="text-sm text-gray-300">Fuel: {car.fuel_type}</p>
                  <p className="text-sm text-gray-300">Transmission: {car.transmission}</p>
                  <p className="text-base font-semibold text-white mt-2">₹{car.price_per_day}/day</p>

                  <button
                    onClick={() => removeFromCart(car.car_id || car.id)}
                    className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Total Price Display */}
          <div className="w-full max-w-4xl text-right pr-2">
            <p className="text-xl text-white font-semibold">
              Total: ₹{total}
            </p>
          </div>

          {/* Proceed to Checkout Button */}
          <button
            onClick={() => router.push('/receipt')}
            className="mt-8 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 rounded text-black font-bold"
          >
            Proceed to Checkout
          </button>
        </>
      )}
    </div>
  );
};

export default CartPage;
