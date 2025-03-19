const { faker } = require("@faker-js/faker");
const Product = require("../models/Product");
const { getRandomElement, generateUniqueProductName } = require("../utils/randomGenerators");

const seedProducts = async (categories, suppliers) => {
  const products = await Product.insertMany(Array(100).fill(null).map(() => {
    const category = getRandomElement(categories);
    const supplier = getRandomElement(suppliers);
    return {
      name: generateUniqueProductName(),
      description: faker.commerce.productDescription(),
      price: parseFloat(faker.commerce.price()),
      categories: [category._id],
      supplier: supplier._id,
      tags: [faker.commerce.productAdjective(), faker.commerce.productMaterial()],
      attributes: {
        color: faker.color.human(),
        brand: faker.company.name()
      },
      status: getRandomElement(['available', 'out_of_stock', 'discontinued'])
    };
  }));

  console.log("Products seeded successfully");
  return products;
};

module.exports = seedProducts;