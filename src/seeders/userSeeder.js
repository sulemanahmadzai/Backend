const { faker } = require("@faker-js/faker");
const User = require("../models/User");
const { getRandomElement } = require("../utils/randomGenerators");

const seedUsers = async () => {
  const users = await User.insertMany(Array(10).fill(null).map(() => ({
    name: faker.person.fullName(),
    email: faker.internet.email(),
    passwordHash: faker.internet.password(),
    role: getRandomElement(['customer', 'customer', 'customer', 'admin']),
    personalDetails: {
      phoneNumber: faker.phone.number(),
      country: faker.location.country(),
      city: faker.location.city(),
      state: faker.location.state(),
      postalCode: faker.location.zipCode()
    },
    paymentMethods: [{
      type: getRandomElement(['Credit Card', 'PayPal', 'Bank Transfer']),
      details: { cardNumber: faker.finance.creditCardNumber() }
    }]
  })));

  console.log("Users seeded successfully");
  return users;
};

module.exports = seedUsers;