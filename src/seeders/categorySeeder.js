const Category = require("../models/Category");

const seedCategories = async () => {
  const categories = await Category.insertMany([
    { name: "Electronics", description: "Latest gadgets and devices" },
    { name: "Fashion", description: "Trendy clothing and accessories" },
    { name: "Home & Garden", description: "Home improvement and decor" },
    { name: "Books", description: "Books across all genres" },
    { name: "Sports", description: "Sports equipment and gear" },
    { name: "Beauty", description: "Cosmetics and personal care" },
    { name: "Toys", description: "Kids toys and games" },
    { name: "Automotive", description: "Car parts and accessories" },
    { name: "Food & Beverages", description: "Groceries and drinks" },
    { name: "Health", description: "Health and wellness products" }
  ]);
  
  console.log("Categories seeded successfully");
  return categories;
};

module.exports = seedCategories;