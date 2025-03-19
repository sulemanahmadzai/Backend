const { faker } = require("@faker-js/faker");
const Supplier = require("../models/Supplier");

const seedSuppliers = async () => {
  const suppliers = await Supplier.insertMany(Array(5).fill(null).map(() => ({
    name: faker.company.name(),
    contactInfo: {
      email: faker.internet.email(),
      phone: faker.phone.number(),
      address: faker.location.streetAddress()
    }
  })));

  console.log("Suppliers seeded successfully");
  return suppliers;
};

module.exports = seedSuppliers;