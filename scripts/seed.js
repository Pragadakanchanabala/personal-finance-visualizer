// scripts/seed.js
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import mongoose from 'mongoose';
import dbConnect from '../lib/dbConnect.js'; // Adjust path if necessary
import Category from '../models/Category.js'; // Adjust path if necessary

const categoriesToSeed = [
  { name: "Groceries", color: "#FFC107" },
  { name: "Utilities", color: "#2196F3" },
  { name: "Rent", color: "#9C27B0" },
  { name: "Entertainment", color: "#FF5722" },
  { name: "Transport", color: "#4CAF50" },
  { name: "Dining Out", color: "#00BCD4" },
  { name: "Healthcare", color: "#E91E63" },
  { name: "Salary", color: "#8BC34A" }, // Income category
  { name: "Miscellaneous", color: "#607D8B" },
];

async function seedCategories() {
  try {
    console.log('Connecting to database...');
    // This will now use process.env.MONGODB_URI, which is loaded by Node.js when npm run seed is called.
    await dbConnect();
    console.log('Database connected.');

    console.log('Deleting existing categories...');
    await Category.deleteMany({}); // Clears existing categories
    console.log('Existing categories deleted.');

    console.log('Inserting new categories...');
    await Category.insertMany(categoriesToSeed);
    console.log('Categories seeded successfully!');

  } catch (error) {
    console.error('Error seeding categories:', error);
    if (error.name === 'MongooseServerSelectionError') {
      console.error('MongoDB Connection Error: Please check your network, MongoDB Atlas IP whitelist, and URI credentials.');
    }
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('Database disconnected.');
    }
  }
}

seedCategories();