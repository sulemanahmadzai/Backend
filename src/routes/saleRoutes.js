const express = require("express");
const { getRegionSales } = require("../controllers/saleController");
const router = express.Router();

router.get("/region-sales", getRegionSales);

module.exports = router;
