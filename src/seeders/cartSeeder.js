const { faker } = require("@faker-js/faker");
const Cart = require("../models/Cart");
const { getRandomElement } = require("../utils/randomGenerators");

const seedCarts = async (users, products) => {
  await Cart.insertMany(users.map(user => ({
    userId: user._id,
    items: Array(faker.number.int({ min: 1, max: 3 }))
      .fill(null)
      .map(() => ({
        productId: getRandomElement(products)._id,
        quantity: faker.number.int({ min: 1, max: 5 })
      }))
  })));

  console.log("Carts seeded successfully");
};

module.exports = seedCarts;