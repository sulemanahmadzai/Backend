const { faker } = require("@faker-js/faker");
const Wishlist = require("../models/Wishlist");
const { getRandomElement } = require("../utils/randomGenerators");

const seedWishlists = async (users, products) => {
  await Wishlist.insertMany(users.map(user => ({
    userId: user._id,
    items: Array(faker.number.int({ min: 1, max: 5 }))
      .fill(null)
      .map(() => getRandomElement(products)._id)
  })));

  console.log("Wishlists seeded successfully");
};

module.exports = seedWishlists;