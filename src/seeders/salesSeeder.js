const Order = require("../models/Order");
const { faker } = require("@faker-js/faker");

const regions = [
  {
    country: "United States",
    cities: ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix"],
  },
  {
    country: "Canada",
    cities: ["Toronto", "Vancouver", "Montreal", "Calgary", "Ottawa"],
  },
  {
    country: "United Kingdom",
    cities: ["London", "Manchester", "Birmingham", "Glasgow", "Liverpool"],
  },
  {
    country: "Australia",
    cities: ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide"],
  },
  {
    country: "Germany",
    cities: ["Berlin", "Munich", "Hamburg", "Frankfurt", "Cologne"],
  },
  {
    country: "France",
    cities: ["Paris", "Marseille", "Lyon", "Toulouse", "Nice"],
  },
  {
    country: "Japan",
    cities: ["Tokyo", "Osaka", "Nagoya", "Sapporo", "Fukuoka"],
  },
  {
    country: "Brazil",
    cities: [
      "São Paulo",
      "Rio de Janeiro",
      "Brasília",
      "Salvador",
      "Fortaleza",
    ],
  },
];

const seedSales = async () => {
  try {
    // Generate 1000 new orders with random regions
    const orders = Array(1000)
      .fill(null)
      .map(() => {
        const region = faker.helpers.arrayElement(regions);
        const city = faker.helpers.arrayElement(region.cities);

        return {
          userId: faker.database.mongodbObjectId(), // Random user ID
          orderItems: [
            {
              productId: faker.database.mongodbObjectId(), // Random product ID
              productName: faker.commerce.productName(),
              quantity: faker.number.int({ min: 1, max: 5 }),
              price: parseFloat(faker.commerce.price({ min: 10, max: 1000 })),
            },
          ],
          status: faker.helpers.arrayElement([
            "pending",
            "processing",
            "shipped",
            "delivered",
          ]),
          totalAmount: parseFloat(faker.commerce.price({ min: 50, max: 5000 })),
          paymentMethod: {
            type: faker.helpers.arrayElement([
              "credit_card",
              "debit_card",
              "paypal",
            ]),
            details: {
              last4: faker.finance.creditCardNumber("####"),
            },
          },
          shippingAddress: {
            country: region.country,
            city: city,
            state: faker.location.state(),
            postalCode: faker.location.zipCode(),
          },
          trackingNumber: faker.string.alphanumeric(12).toUpperCase(),
        };
      });

    await Order.insertMany(orders);
    console.log("Additional sales data seeded successfully!");
  } catch (error) {
    console.error("Error seeding additional sales data:", error);
    throw error;
  }
};

module.exports = seedSales;
