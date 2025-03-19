const { faker } = require("@faker-js/faker");
const Notification = require("../models/Notification");
const { getRandomElement } = require("../utils/randomGenerators");

const seedNotifications = async (users) => {
  await Notification.insertMany(
    Array(50)
      .fill(null)
      .map(() => ({
        userId: getRandomElement(users)._id,
        message: faker.lorem.sentence(),
        type: getRandomElement([
          "discount",
          "stock_availability",
          "order_status",
          "general",
        ]),
        isRead: faker.datatype.boolean(),
      }))
  );

  console.log("Notifications seeded successfully");
};

module.exports = seedNotifications;
