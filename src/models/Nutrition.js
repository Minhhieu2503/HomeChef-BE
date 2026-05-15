const mongoose = require('mongoose');

const nutritionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  calories: {
    type: Number,
    required: true
  },
  protein: {
    type: Number,
    default: 0
  },
  fat: {
    type: Number,
    default: 0
  },
  carbs: {
    type: Number,
    default: 0
  },
  unit: {
    type: String,
    enum: ['g', 'ml', 'unit', 'spoon'],
    default: 'g'
  },
  category: {
    type: String,
    enum: ['meat', 'carb', 'vegetable', 'fruit', 'spice', 'dairy', 'other'],
    default: 'other'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Nutrition', nutritionSchema);
