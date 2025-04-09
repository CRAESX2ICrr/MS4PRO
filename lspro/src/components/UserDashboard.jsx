'use client';
import React, { useEffect, useState } from 'react';

export default function UserDashboard({ user, onLogout }) {
  const [bookings, setBookings] = useState([]);
  const [modalField, setModalField] = useState('');
  const [modalValue, setModalValue] = useState('');
  const [modalFname, setModalFname] = useState('');
  const [modalLname, setModalLname] = useState('');

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/user/bookings?email=${user.email}`);
        const data = await res.json();
        setBookings(data);
      } catch (err) {
        console.error('Error fetching bookings:', err);
      }
    };

    if (user?.email) {
      fetchBookings();
    }
  }, [user]);

  const handleDeleteBooking = async (id) => {
    try {
      await fetch(`http://localhost:3001/api/user/bookings/${id}`, {
        method: 'DELETE',
      });
      setBookings(bookings.filter((b) => b.booking_id !== id));
    } catch (err) {
      console.error('Error deleting booking:', err);
    }
  };

  const openModal = (field) => {
    setModalField(field);
    if (field === 'name') {
      setModalFname(user.fname);
      setModalLname(user.lname);
    } else {
      setModalValue('');
    }
  };

  const closeModal = () => {
    setModalField('');
    setModalValue('');
    setModalFname('');
    setModalLname('');
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();

    const updateFields = {
      email: user.email,
      newEmail: modalField === 'email' ? modalValue : user.email,
      newFname: modalField === 'name' ? modalFname : user.fname,
      newLname: modalField === 'name' ? modalLname : user.lname,
      newPassword: modalField === 'password' ? modalValue : '',
    };

    try {
      const res = await fetch('http://localhost:3001/api/user/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateFields),
      });

      if (res.ok) {
        alert('Profile updated!');
        localStorage.removeItem('user');
        window.location.href = '/';
      } else {
        alert('Failed to update profile');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirm('Are you sure you want to delete your account?')) {
      try {
        const res = await fetch('http://localhost:3001/api/user/delete', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email }),
        });

        if (res.ok) {
          alert('Account deleted');
          localStorage.removeItem('user');
          window.location.href = '/';
        } else {
          alert('Failed to delete account');
        }
      } catch (err) {
        console.error('Error deleting account:', err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto bg-neutral-900 p-10 rounded-2xl shadow-lg">
        <h1 className="text-4xl font-bold text-yellow-400 mb-6">
          Welcome, {user.fname} {user.lname}
        </h1>

        {/* User Info */}
        <div className="space-y-2 mb-10">
          <div className="flex items-center justify-between">
            <div>
              <p><strong>First Name:</strong> {user.fname}</p>
              <p><strong>Last Name:</strong> {user.lname}</p>
            </div>
            <button onClick={() => openModal('name')} className="text-sm text-blue-400 hover:underline">
              Change
            </button>
          </div>
          <div className="flex items-center justify-between">
            <p><strong>Email:</strong> {user.email}</p>
            <button onClick={() => openModal('email')} className="text-sm text-blue-400 hover:underline">
              Change
            </button>
          </div>
          <div className="flex items-center justify-between">
            <p><strong>Password:</strong> ********</p>
            <button onClick={() => openModal('password')} className="text-sm text-blue-400 hover:underline">
              Change
            </button>
          </div>
        </div>

        {/* Bookings Section */}
        <h2 className="text-2xl font-semibold mb-4">My Bookings</h2>
        {bookings.length === 0 ? (
          <p className="text-gray-400">No bookings found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bookings.map((booking) => {
              const days =
                (new Date(booking.return_date) - new Date(booking.pickup_date)) / (1000 * 60 * 60 * 24);

              return (
                <div key={booking.booking_id} className="bg-neutral-800 rounded-xl p-4 border border-neutral-700">
                  <p><strong>Car:</strong> {booking.car_name}</p>
                  <p><strong>Pickup:</strong> {new Date(booking.pickup_date).toLocaleDateString()}</p>
                    <p><strong>Return:</strong> {new Date(booking.return_date).toLocaleDateString()}</p>

                  <p><strong>Total:</strong> ₹{days * booking.price_per_day}</p>
                  <p><strong>Status:</strong> {booking.status}</p>
                  <button
                    onClick={() => handleDeleteBooking(booking.booking_id)}
                    className="mt-3 px-4 py-1 bg-red-500 rounded hover:bg-red-600 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Account Actions */}
        <div className="mt-10 text-center">
          <button
            onClick={handleDeleteAccount}
            className="bg-red-600 text-white px-6 py-2 rounded-full hover:bg-red-700 transition"
          >
            Delete My Account
          </button>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={onLogout}
            className="bg-red-500 text-white px-6 py-2 rounded-full hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Modal */}
      {modalField && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-neutral-800 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 capitalize text-yellow-400">
              Update {modalField}
            </h2>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              {modalField === 'name' ? (
                <>
                  <input
                    type="text"
                    value={modalFname}
                    onChange={(e) => setModalFname(e.target.value)}
                    placeholder="Enter new first name"
                    className="w-full px-4 py-2 rounded bg-neutral-700 text-white border border-neutral-600"
                    required
                  />
                  <input
                    type="text"
                    value={modalLname}
                    onChange={(e) => setModalLname(e.target.value)}
                    placeholder="Enter new last name"
                    className="w-full px-4 py-2 rounded bg-neutral-700 text-white border border-neutral-600"
                    required
                  />
                </>
              ) : (
                <input
                  type={modalField === 'password' ? 'password' : 'text'}
                  value={modalValue}
                  onChange={(e) => setModalValue(e.target.value)}
                  placeholder={`Enter new ${modalField}`}
                  className="w-full px-4 py-2 rounded bg-neutral-700 text-white border border-neutral-600"
                  required
                />
              )}
              <div className="flex justify-end gap-4">
                <button type="button" onClick={closeModal} className="bg-gray-600 px-4 py-2 rounded hover:bg-gray-500">
                  Cancel
                </button>
                <button type="submit" className="bg-yellow-400 text-black px-4 py-2 rounded font-bold hover:bg-yellow-500">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
