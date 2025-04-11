'use client';

import React, { useEffect, useState, useContext } from 'react';
import CreateAccount from '@/components/CreateAccount';
import UserDashboard from '@/components/UserDashboard';
import AdminDashboard from '@/components/AdminDashboard';
import { CartContext } from '@/components/context/CartContext';

export default function AccountPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loginRole, setLoginRole] = useState('user'); // for login toggle

  const { syncCartToBackend, setUser: setCartUser } = useContext(CartContext);

  // ✅ Load from localStorage if available
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setCartUser(parsedUser);
    }
    setLoading(false);
  }, [setCartUser]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const contentType = res.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        const text = await res.text();
        console.error('❌ Not JSON:', text);
        setError('Unexpected server response');
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Login failed');
      } else {
        setUser(data.user);
        setCartUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        await syncCartToBackend();
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Network error. See console.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setCartUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <p>Loading...</p>
      </div>
    );
  }

  // ✅ Render based on actual user role
  if (user) {
    return user.role === 'admin' ? (
      <AdminDashboard user={user} onLogout={handleLogout} />
    ) : (
      <UserDashboard user={user} onLogout={handleLogout} />
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-start justify-center pt-20 px-4">
      <div className="bg-neutral-900 p-10 rounded-2xl shadow-lg w-full max-w-2xl">
        <h1 className="text-4xl font-extrabold text-center mb-8 text-yellow-400">
          Login
        </h1>
  
        {/* Login form */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-md bg-neutral-800 border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              required
            />
          </div>
  
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-md bg-neutral-800 border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              required
            />
          </div>
  
          <button
            type="submit"
            className="w-full bg-yellow-400 text-black py-2 rounded-md font-bold hover:bg-yellow-500 transition"
          >
            Login
          </button>
  
          {error && (
            <p className="text-red-400 text-sm mt-2 text-center">{error}</p>
          )}
        </form>
  
        {/* Sign up */}
        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">Don't have an account?</p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-2 text-yellow-400 font-semibold hover:underline transition"
          >
            Create a New Account
          </button>
        </div>
      </div>
  
      {/* Create Account Modal */}
      <CreateAccount show={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
  
}
