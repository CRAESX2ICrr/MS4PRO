const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/gallery', express.static(path.join(__dirname, '..', 'public', 'gallery')));

// MySQL Connection Pool
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Create router for admin routes
const adminRouter = express.Router();
app.use('/api/admin', adminRouter);

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, path.join(__dirname, '..', 'public', 'gallery'));
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

/////////////////////////////////////////////////////
// GENERAL ROUTES

// GET all cars
app.get('/api/cars', async (req, res) => {
  try {
    const [cars] = await db.query('SELECT * FROM cars');
    res.json(cars);
  } catch (err) {
    console.error('Error fetching cars:', err);
    res.status(500).json({ error: 'Failed to fetch cars' });
  }
});

// GET all users (admin view)
app.get('/api/users', async (req, res) => {
  try {
    const [users] = await db.query('SELECT id, fname, lname, email, role FROM users');
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// REGISTER
app.post('/api/register', async (req, res) => {
  const { fname, lname, email, password } = req.body;
  
  if (!fname || !lname || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const [existing] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    await db.query(
      'INSERT INTO users (fname, lname, email, password, role) VALUES (?, ?, ?, ?, ?)',
      [fname, lname, email, password, 'user']
    );

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// LOGIN
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const [users] = await db.query('SELECT * FROM users WHERE email = ? AND password = ?', [
      email,
      password,
    ]);
    
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = users[0];
    res.json({ 
      user: {
        id: user.id,
        fname: user.fname,
        lname: user.lname,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// GET user bookings
app.get('/api/user/bookings', async (req, res) => {
  const { email } = req.query;
  
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const [bookings] = await db.query(
      `SELECT 
        b.id AS booking_id,
        b.pickup_date,
        b.return_date,
        b.status,
        b.total,
        c.name AS car_name,
        c.price_per_day,
        DATEDIFF(b.return_date, b.pickup_date) AS duration
      FROM bookings b
      JOIN cars c ON b.car_id = c.id
      WHERE b.user_email = ?
      ORDER BY b.pickup_date DESC`,
      [email]
    );

    res.json(bookings);
  } catch (err) {
    console.error('Error fetching bookings:', err);
    res.status(500).json({ message: 'Failed to fetch bookings' });
  }
});

// DELETE booking
app.delete('/api/user/bookings/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const [result] = await db.query('DELETE FROM bookings WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    res.json({ message: 'Booking cancelled successfully' });
  } catch (err) {
    console.error('Error cancelling booking:', err);
    res.status(500).json({ message: 'Failed to cancel booking' });
  }
});

// UPDATE user profile
app.put('/api/user/update', async (req, res) => {
  const { email, newFname, newLname, newEmail, newPassword } = req.body;
  
  if (!email) {
    return res.status(400).json({ message: 'Current email is required' });
  }

  try {
    let query = 'UPDATE users SET';
    const fields = [];
    const values = [];

    if (newFname) { fields.push('fname = ?'); values.push(newFname); }
    if (newLname) { fields.push('lname = ?'); values.push(newLname); }
    if (newEmail && newEmail !== email) { fields.push('email = ?'); values.push(newEmail); }
    if (newPassword) { fields.push('password = ?'); values.push(newPassword); }

    if (fields.length === 0) {
      return res.status(400).json({ message: 'No updates provided' });
    }

    query += ' ' + fields.join(', ') + ' WHERE email = ?';
    values.push(email);

    const [result] = await db.query(query, values);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

// DELETE user account
app.delete('/api/user/delete', async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    
    await conn.query('DELETE FROM bookings WHERE user_email = ?', [email]);
    const [result] = await conn.query('DELETE FROM users WHERE email = ?', [email]);
    
    if (result.affectedRows === 0) {
      await conn.rollback();
      return res.status(404).json({ message: 'User not found' });
    }
    
    await conn.commit();
    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    await conn.rollback();
    console.error('Error deleting account:', err);
    res.status(500).json({ message: 'Failed to delete account' });
  } finally {
    conn.release();
  }
});

// CART Routes
app.get('/api/cart', async (req, res) => {
  const { user_id } = req.query;
  
  if (!user_id) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    const [items] = await db.query(
      `SELECT ci.id, ci.car_id, c.name, c.brand, c.model_year, c.fuel_type, 
              c.transmission, c.price_per_day, c.image_url
       FROM cart_items ci
       JOIN cars c ON ci.car_id = c.id
       WHERE ci.user_id = ?`,
      [user_id]
    );

    res.json(items);
  } catch (err) {
    console.error('Error fetching cart:', err);
    res.status(500).json({ message: 'Failed to fetch cart items' });
  }
});

app.post('/api/cart', async (req, res) => {
  const { user_id, cart } = req.body;
  
  if (!user_id || !Array.isArray(cart)) {
    return res.status(400).json({ message: 'Invalid request data' });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    
    await conn.query('DELETE FROM cart_items WHERE user_id = ?', [user_id]);

    for (const item of cart) {
      await conn.query('INSERT INTO cart_items (user_id, car_id) VALUES (?, ?)', [
        user_id,
        item.car_id,
      ]);
    }
    
    await conn.commit();
    res.json({ message: 'Cart updated successfully' });
  } catch (err) {
    await conn.rollback();
    console.error('Error updating cart:', err);
    res.status(500).json({ message: 'Failed to update cart' });
  } finally {
    conn.release();
  }
});

app.delete('/api/cart/remove', async (req, res) => {
  const { user_id, car_id } = req.body;
  
  if (!user_id || !car_id) {
    return res.status(400).json({ message: 'User ID and Car ID are required' });
  }

  try {
    const [result] = await db.query(
      'DELETE FROM cart_items WHERE user_id = ? AND car_id = ?', 
      [user_id, car_id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Cart item not found' });
    }
    
    res.json({ message: 'Item removed from cart successfully' });
  } catch (err) {
    console.error('Error removing cart item:', err);
    res.status(500).json({ message: 'Failed to remove item from cart' });
  }
});

// CREATE BOOKING
app.post('/api/bookings', async (req, res) => {
  const { user_email, bookings } = req.body;
  
  if (!user_email || !Array.isArray(bookings)) {

    return res.status(400).json({ message: 'Invalid request data' });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    for (const booking of bookings) {
      const { car_id, pickup_date, return_date, price_per_day } = booking;
      
      if (!car_id || !pickup_date || !return_date || !price_per_day) {
        throw new Error('Missing required booking fields');
      }

      const duration = Math.ceil((new Date(return_date) - new Date(pickup_date)) / (1000 * 60 * 60 * 24));

      const total = duration * price_per_day;

      await conn.query(
        `INSERT INTO bookings 
        (user_email, car_id, pickup_date, return_date, status, total) 
        VALUES (?, ?, ?, ?, ?, ?)`,
        [user_email, car_id, pickup_date, return_date, 'pending', total]
      );
    }

    await conn.commit();
    res.status(201).json({ message: 'Bookings created successfully' });
  } catch (error) {
    await conn.rollback();
    console.error('Booking error:', error);
    res.status(500).json({ message: 'Failed to create bookings', error: error.message });
  } finally {
    conn.release();
  }
});

/////////////////////////////////////////////////////
// ADMIN ROUTES

// GET all cars (admin)
adminRouter.get('/cars', async (req, res) => {
  try {
    const [cars] = await db.query('SELECT * FROM cars');
    res.json(cars);
  } catch (err) {
    console.error('Admin car fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch cars' });
  }
});

// ADD new car (admin)
adminRouter.post('/cars', upload.single('image'), async (req, res) => {
  const {
    name,
    brand,
    model_year,
    transmission,
    fuel_type,
    price_per_day,
    available = 1,
  } = req.body;
  
  const image = req.file?.filename;

  // Validate required fields
  if (!name || !brand || !model_year || !transmission || !fuel_type || !price_per_day) {
    return res.status(400).json({ 
      error: 'Missing required fields',
      required: ['name', 'brand', 'model_year', 'transmission', 'fuel_type', 'price_per_day']
    });
  }

  if (!image) {
    return res.status(400).json({ error: 'Image file is required' });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO cars 
      (name, brand, model_year, transmission, fuel_type, price_per_day, image_url, available)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, brand, model_year, transmission, fuel_type, price_per_day, `/gallery/${image}`, available]
    );
    
    res.status(201).json({ 
      message: 'Car added successfully',
      carId: result.insertId
    });
  } catch (err) {
    console.error('Admin car add error:', err);
    res.status(500).json({ error: 'Failed to add car', details: err.message });
  }
});

// UPDATE car (admin)
adminRouter.put('/cars/:id', async (req, res) => {
  const { id } = req.params;
  const { name, price_per_day } = req.body;
  
  if (!name || !price_per_day) {
    return res.status(400).json({ message: 'Name and price are required' });
  }

  try {
    const [result] = await db.query(
      'UPDATE cars SET name = ?, price_per_day = ? WHERE id = ?',
      [name, price_per_day, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Car not found' });
    }
    
    res.json({ message: 'Car updated successfully' });
  } catch (err) {
    console.error('Admin car update error:', err);
    res.status(500).json({ error: 'Failed to update car' });
  }
});

// DELETE car (admin)
adminRouter.delete('/cars/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const [result] = await db.query('DELETE FROM cars WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Car not found' });
    }
    
    res.json({ message: 'Car deleted successfully' });
  } catch (err) {
    console.error('Admin car delete error:', err);
    res.status(500).json({ error: 'Failed to delete car' });
  }
});

// GET all users (admin)
adminRouter.get('/users', async (req, res) => {
  try {
    const [users] = await db.query('SELECT id, fname, lname, email, role FROM users');
    res.json(users);
  } catch (err) {
    console.error('Admin user fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// DELETE user (admin)
adminRouter.delete('/users/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const [result] = await db.query('DELETE FROM users WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Admin user delete error:', err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// GET all bookings (admin)
adminRouter.get('/bookings', async (req, res) => {
  try {
    const [bookings] = await db.query(`
      SELECT 
        b.id, 
        b.user_email, 
        b.pickup_date, 
        b.return_date, 
        b.status, 
        b.total,
        c.name AS car_name
      FROM bookings b
      JOIN cars c ON b.car_id = c.id
      ORDER BY b.pickup_date DESC
    `);
    
    res.json(bookings);
  } catch (err) {
    console.error('Admin booking fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// CONFIRM booking (admin)
adminRouter.put('/bookings/:id/confirm', async (req, res) => {
  const { id } = req.params;
  
  try {
    const [result] = await db.query(
      'UPDATE bookings SET status = ? WHERE id = ?',
      ['confirmed', id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    res.json({ message: 'Booking confirmed successfully' });
  } catch (err) {
    console.error('Admin booking confirm error:', err);
    res.status(500).json({ error: 'Failed to confirm booking' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: 'File upload error', details: err.message });
  } else if (err) {
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
  
  next();
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});