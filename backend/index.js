require('dotenv').config();           // must come first so process.env is filled
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

// ---------- Middleware ----------
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// ---------- Schema & Model ----------
const itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'name is required'],
      trim: true,
    },
  },
  { timestamps: true } // adds createdAt and updatedAt automatically
);

const Item = mongoose.model('Item', itemSchema);
// Mongoose turns 'Item' into a collection named 'items' (lowercase + plural)

// ---------- Helper ----------
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// ---------- Routes ----------

// READ: get all items
app.get('/api/items', async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE: add a new item
app.post('/api/items', async (req, res) => {
  try {
    const newItem = await Item.create({ name: req.body?.name });
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
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ error: `'${id}' is not a valid id` });
    }

    const updated = await Item.findByIdAndUpdate(
      id,
      { name: req.body?.name },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ error: `No item with id ${id}` });
    }
    res.json(updated);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
});

// DELETE: remove an item
app.delete('/api/items/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ error: `'${id}' is not a valid id` });
    }

    const deleted = await Item.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ error: `No item with id ${id}` });
    }
    res.json({ message: `Item ${id} deleted`, deleted });
  } catch (err) {
    res.status(500).json({ error: err.message });
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