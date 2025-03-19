const { faker } = require("@faker-js/faker");

const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

const generateUniqueProductName = () => {
  const adjective = faker.commerce.productAdjective();
  const material = faker.commerce.productMaterial();
  const product = faker.commerce.product();
  const uuid = faker.string.alphanumeric(4).toUpperCase();
  return `${adjective} ${material} ${product}-${uuid}`;
};

module.exports = {
  getRandomElement,
  generateUniqueProductName
};