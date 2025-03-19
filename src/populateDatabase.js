const { faker } = require("@faker-js/faker");
const mongoose = require("mongoose");
const seedCategories = require("./seeders/categorySeeder");
const seedUsers = require("./seeders/userSeeder");
const seedSuppliers = require("./seeders/supplierSeeder");
const seedProducts = require("./seeders/productSeeder");
const seedInventory = require("./seeders/inventorySeeder");
const seedOrders = require("./seeders/orderSeeder");
const seedCarts = require("./seeders/cartSeeder");
const seedWishlists = require("./seeders/wishlistSeeder");
const seedReviews = require("./seeders/reviewSeeder");
const seedNotifications = require("./seeders/notificationSeeder");

require("dotenv").config();
const MONGODB_URI = process.env.DB_CONNECTION_STRING;

const clearCollections = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany();
  }
  console.log("All collections cleared");
};

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    await clearCollections();

    const categories = await seedCategories();
    const users = await seedUsers();
    const suppliers = await seedSuppliers();
    const products = await seedProducts(categories, suppliers);

    await Promise.all([
      seedInventory(products),
      seedOrders(users, products),
      seedCarts(users, products),
      seedWishlists(users, products),
      seedReviews(users, products),
      seedNotifications(users),
    ]);

    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error during database seeding:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
};

seedDatabase();
