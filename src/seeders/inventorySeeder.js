const { faker } = require("@faker-js/faker");
const Inventory = require("../models/Inventory");
const { getRandomElement } = require("../utils/randomGenerators");

const seedInventory = async (products) => {
  await Inventory.insertMany(products.map(product => ({
    productId: product._id,
    quantity: faker.number.int({ min: 0, max: 1000 }),
    threshold: 10,
    location: getRandomElement(['Warehouse A', 'Warehouse B', 'Warehouse C'])
  })));

  console.log("Inventory seeded successfully");
};

module.exports = seedInventory;