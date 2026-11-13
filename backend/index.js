require('dotenv').config();           // must come first so process.env is filled
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./models/User');
const authRoutes = require('./routes/auth');
const authMiddleware = require('./middleware/authMiddleware');

const app = express();
const PORT = process.env.PORT || 3000;

// ---------- Middleware ----------
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://your-frontend-domain.vercel.app'
  ]
}));
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/items', authMiddleware);

// ---------- Schema & Model ----------
const itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'name is required'],
      trim: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

const Item = mongoose.model('Item', itemSchema);
// Mongoose turns 'Item' into a collection named 'items' (lowercase + plural)

// ---------- Helper ----------
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// ---------- Routes ----------

// READ: get all items
app.get('/api/items', async (req, res) => {
  try {
    const items = await Item.find({
  user: req.user.userId
});
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE: add a new item
app.post('/api/items', async (req, res) => {
  try {
    const newItem = await Item.create({
       name: req.body?.name,
       user: req.user.userId });
    res.status(201).json(newItem);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
});

// UPDATE: change an existing item
app.put('/api/items/:id', async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid item ID' });
    }

    const updatedItem = await Item.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user.userId
      },
      {
        name: req.body.name
      },
      { new: true, runValidators: true }
    );

    if (!updatedItem) {
      return res.status(404).json({
        message: 'Item not found'
      });
    }

    res.json(updatedItem);

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE: remove an item
app.delete('/api/items/:id', async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        message: 'Invalid item ID'
      });
    }

    const deletedItem = await Item.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!deletedItem) {
      return res.status(404).json({
        message: 'Item not found'
      });
    }

    res.json({
      message: 'Item deleted successfully',
      deletedItem
    });

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ---------- Connect to DB, THEN start server ----------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Backend running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });