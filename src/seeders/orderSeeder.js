const { faker } = require("@faker-js/faker");
const Order = require("../models/Order");
const { getRandomElement } = require("../utils/randomGenerators");

const seedOrders = async (users, products) => {
  await Order.insertMany(Array(1000).fill(null).map(() => {
    const user = getRandomElement(users);
    const orderItems = Array(faker.number.int({ min: 1, max: 5 }))
      .fill(null)
      .map(() => {
        const product = getRandomElement(products);
        return {
          productId: product._id,
          productName: product.name,
          quantity: faker.number.int({ min: 1, max: 5 }),
          price: product.price
        };
      });

    return {
      userId: user._id,
      orderItems,
      totalAmount: orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      paymentMethod: user.paymentMethods[0],
      shippingAddress: user.personalDetails,
      status: getRandomElement(['pending', 'processing', 'shipped', 'delivered'])
    };
  }));

  console.log("Orders seeded successfully");
};

module.exports = seedOrders;