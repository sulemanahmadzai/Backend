const { faker } = require("@faker-js/faker");
const Review = require("../models/Review");
const { getRandomElement } = require("../utils/randomGenerators");

const seedReviews = async (users, products) => {
  await Review.insertMany(Array(200).fill(null).map(() => ({
    productId: getRandomElement(products)._id,
    userId: getRandomElement(users)._id,
    rating: faker.number.int({ min: 1, max: 5 }),
    comment: faker.lorem.paragraph()
  })));

  console.log("Reviews seeded successfully");
};

module.exports = seedReviews;