'use client';

import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [user, setUser] = useState(null);

  // Load cart when user changes
  useEffect(() => {
    if (user?.id) {
      fetchCartFromBackend(user.id);
    } else {
      setCartItems([]);
    }
  }, [user]);

  const fetchCartFromBackend = async (userId) => {
    try {
      const res = await axios.get(`http://localhost:3001/api/cart?user_id=${userId}`);
      setCartItems(res.data || []);
    } catch (err) {
      console.error('Error fetching cart:', err);
      setCartItems([]);
    }
  };

  const addToCart = async (car) => {
    const updatedCart = [...cartItems, car];
    setCartItems(updatedCart);

    if (user?.id) {
      try {
        await axios.post('http://localhost:3001/api/cart', {
          user_id: user.id,
          cart: updatedCart.map((item) => ({ car_id: item.car_id || item.id })),
        });
      } catch (err) {
        console.error('Error adding to cart:', err.response?.data || err.message);
      }
    }
  };

  const removeFromCart = async (carId) => {
    if (!user?.id) return;

    try {
      await axios.delete('http://localhost:3001/api/cart/remove', {
        data: {
          user_id: user.id,
          car_id: carId,
        },
      });

      // Update local state immediately
      setCartItems((prev) => prev.filter((item) => (item.car_id || item.id) !== carId));
    } catch (err) {
      console.error('Error removing from cart:', err.response?.data || err.message);
    }
  };

  const clearCart = async () => {
    if (!user?.id) return;

    try {
      await axios.delete('http://localhost:3001/api/cart', {
        data: { user_id: user.id },
      });
      setCartItems([]);
    } catch (err) {
      console.error('Error clearing cart:', err.response?.data || err.message);
    }
  };

  const syncCartToBackend = async () => {
    if (!user?.id || cartItems.length === 0) return;

    try {
      await axios.post('http://localhost:3001/api/cart', {
        user_id: user.id,
        cart: cartItems.map((item) => ({ car_id: item.car_id || item.id })),
      });
    } catch (err) {
      console.error('Error syncing cart:', err.response?.data || err.message);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        setCartItems,
        addToCart,
        removeFromCart,
        clearCart,
        syncCartToBackend,
        user,
        setUser,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
