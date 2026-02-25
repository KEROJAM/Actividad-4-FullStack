const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  quantity: {
    type: Number,
    default: 1,
    min: 1
  },
  unit: {
    type: String,
    default: 'unidad'
  },
  completed: {
    type: Boolean,
    default: false
  }
}, { _id: true });

const groceryListSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  name: {
    type: String,
    required: true,
    trim: true,
    default: 'Mi lista de compras'
  },
  items: [itemSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('GroceryList', groceryListSchema);
