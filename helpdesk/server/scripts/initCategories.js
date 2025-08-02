require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('../models/Category');

const defaultCategories = [
  { name: 'Technical' },
  { name: 'Billing' },
  { name: 'General' },
  { name: 'Feature Request' },
  { name: 'Bug Report' }
];

async function initCategories() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Create categories
    for (const category of defaultCategories) {
      await Category.findOneAndUpdate(
        { name: category.name },
        category,
        { upsert: true, new: true }
      );
      console.log(`Category "${category.name}" created/updated`);
    }

    console.log('Categories initialized successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing categories:', error);
    process.exit(1);
  }
}

initCategories();