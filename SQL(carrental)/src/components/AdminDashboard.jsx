'use client';
import React, { useEffect, useState } from 'react';

export default function AdminDashboard({ admin, onLogout }) {
  const [cars, setCars] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [newCar, setNewCar] = useState({ 
    name: '', 
    brand: '',
    model_year: '',
    transmission: '',
    fuel_type: '',
    price_per_day: '', 
    image: null 
  });
  const [showAddCarModal, setShowAddCarModal] = useState(false);

  const fetchCars = async () => {
    const res = await fetch('http://localhost:3001/api/admin/cars');
    const data = await res.json();
    setCars(data);
  };

  const fetchBookings = async () => {
    const res = await fetch('http://localhost:3001/api/admin/bookings');
    const data = await res.json();
    setBookings(data);
  };

  const fetchUsers = async () => {
    const res = await fetch('http://localhost:3001/api/admin/users');
    const data = await res.json();
    setUsers(data);
  };

  useEffect(() => {
    fetchCars();
    fetchBookings();
    fetchUsers();
  }, []);

  const handleAddCar = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    
    // Append all car data fields
    formData.append('name', newCar.name);
    formData.append('brand', newCar.brand);
    formData.append('model_year', newCar.model_year);
    formData.append('transmission', newCar.transmission);
    formData.append('fuel_type', newCar.fuel_type);
    formData.append('price_per_day', newCar.price_per_day);
    
    // Append the image file
    if (newCar.image) {
      formData.append('image', newCar.image);
    }

    try {
      const res = await fetch('http://localhost:3001/api/admin/cars', {
        method: 'POST',
        body: formData, // Don't set Content-Type header for FormData
      });

      if (res.ok) {
        setShowAddCarModal(false);
        setNewCar({
          name: '',
          brand: '',
          model_year: '',
          transmission: '',
          fuel_type: '',
          price_per_day: '',
          image: null,
        });
        fetchCars();
      } else {
        const errorData = await res.json();
        alert(`Failed to add car: ${errorData.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Error adding car:', err);
      alert('Error adding car. Check console for details.');
    }
  };

  const handleDeleteCar = async (id) => {
    if (confirm('Delete this car?')) {
      await fetch(`http://localhost:3001/api/admin/cars/${id}`, { method: 'DELETE' });
      fetchCars();
    }
  };

  const handleDeleteBooking = async (id) => {
    if (confirm('Delete this booking?')) {
      await fetch(`http://localhost:3001/api/admin/bookings/${id}`, { method: 'DELETE' });
      fetchBookings();
    }
  };

  const handleConfirmBooking = async (id) => {
    try {
      const res = await fetch(`http://localhost:3001/api/admin/bookings/${id}/confirm`, {
        method: 'PUT',
      });
      if (res.ok) {
        fetchBookings();
      } else {
        alert('Failed to confirm booking');
      }
    } catch (err) {
      console.error(err);
      alert('Error confirming booking');
    }
  };

  const handleDeleteUser = async (id) => {
    if (confirm('Delete this user?')) {
      await fetch(`http://localhost:3001/api/admin/users/${id}`, {
        method: 'DELETE',
      });
      fetchUsers();
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8 space-y-16">
      <div className="max-w-7xl mx-auto bg-neutral-900 p-10 rounded-2xl shadow-lg space-y-16">

        {/* 🛻 Car Management */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Cars</h2>
            <button
              onClick={() => setShowAddCarModal(true)}
              className="bg-green-600 px-4 py-2 rounded hover:bg-green-700 text-sm"
            >
              + Add Car
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cars.map((car) => (
              <div key={car.id} className="bg-neutral-800 p-4 rounded-lg border border-neutral-700">
                <img
                  src={car.image_url}
                  alt={car.name}
                  className="w-full h-40 object-cover rounded mb-2"
                />
                <p><strong>Name:</strong> {car.name}</p>
                <p><strong>Brand:</strong> {car.brand}</p>
                <p><strong>Price/Day:</strong> ₹{car.price_per_day}</p>
                <button
                  onClick={() => handleDeleteCar(car.id)}
                  className="mt-2 bg-red-500 px-3 py-1 rounded hover:bg-red-600 text-sm"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* 📘 Bookings */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Bookings</h2>
          <div className="space-y-4">
            {bookings.length === 0 ? (
              <p className="text-neutral-400">No bookings found.</p>
            ) : (
              bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-neutral-800 p-4 rounded border border-neutral-700 flex justify-between items-center"
                >
                  <div>
                    <p><strong>User:</strong> {booking.user_email}</p>
                    <p><strong>Car:</strong> {booking.car_name}</p>
                    <p><strong>Pickup:</strong> {new Date(booking.pickup_date).toLocaleDateString()}</p>
                    <p><strong>Return:</strong> {new Date(booking.return_date).toLocaleDateString()}</p>
                    <p><strong>Total:</strong> ₹{booking.total}</p>
                    <p><strong>Status:</strong> <span className={booking.status === 'confirmed' ? 'text-green-400' : 'text-yellow-400'}>{booking.status}</span></p>
                  </div>
                  <div className="flex gap-2">
                    {booking.status === 'pending' && (
                      <button
                        onClick={() => handleConfirmBooking(booking.id)}
                        className="bg-blue-500 px-3 py-1 rounded hover:bg-blue-600 text-sm"
                      >
                        Confirm
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* 👥 Users */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">All Users</h2>
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="bg-neutral-800 p-4 rounded border border-neutral-700 flex justify-between items-center">
                <div>
                  <p><strong>Name:</strong> {user.fname} {user.lname}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Role:</strong> <span className={user.role === 'admin' ? 'text-purple-400' : ''}>{user.role}</span></p>
                </div>
                {user.role !== 'admin' && (
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="bg-red-500 px-3 py-1 rounded hover:bg-red-600 text-sm"
                  >
                    Delete User
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* 🔚 Logout */}
        <div className="text-center pt-6">
          <button
            onClick={onLogout}
            className="bg-red-500 text-white px-6 py-2 rounded-full hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Add Car Modal */}
      {showAddCarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-neutral-800 p-6 rounded-xl w-full max-w-md">
            <h2 className="text-yellow-400 text-xl font-bold mb-4">Add New Car</h2>
            <form onSubmit={handleAddCar} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={newCar.name}
                  onChange={(e) => setNewCar({...newCar, name: e.target.value})}
                  className="w-full bg-neutral-700 rounded p-2"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Brand</label>
                <input
                  type="text"
                  value={newCar.brand}
                  onChange={(e) => setNewCar({...newCar, brand: e.target.value})}
                  className="w-full bg-neutral-700 rounded p-2"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Model Year</label>
                <input
                  type="number"
                  value={newCar.model_year}
                  onChange={(e) => setNewCar({...newCar, model_year: e.target.value})}
                  className="w-full bg-neutral-700 rounded p-2"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Transmission</label>
                <select
                  value={newCar.transmission}
                  onChange={(e) => setNewCar({...newCar, transmission: e.target.value})}
                  className="w-full bg-neutral-700 rounded p-2"
                  required
                >
                  <option value="">Select</option>
                  <option value="Automatic">Automatic</option>
                  <option value="Manual">Manual</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Fuel Type</label>
                <select
                  value={newCar.fuel_type}
                  onChange={(e) => setNewCar({...newCar, fuel_type: e.target.value})}
                  className="w-full bg-neutral-700 rounded p-2"
                  required
                >
                  <option value="">Select</option>
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Electric">Electric</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Price Per Day (₹)</label>
                <input
                  type="number"
                  value={newCar.price_per_day}
                  onChange={(e) => setNewCar({...newCar, price_per_day: e.target.value})}
                  className="w-full bg-neutral-700 rounded p-2"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Car Image</label>
                <input
                  type="file"
                  onChange={(e) => setNewCar({...newCar, image: e.target.files[0]})}
                  className="w-full bg-neutral-700 rounded p-2"
                  accept="image/*"
                  required
                />
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddCarModal(false)}
                  className="bg-gray-600 px-4 py-2 rounded hover:bg-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-yellow-400 px-4 py-2 rounded font-bold text-black hover:bg-yellow-500"
                >
                  Add Car
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}