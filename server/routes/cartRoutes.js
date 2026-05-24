const express = require("express");
const { upsertCart, getCart, clearCart, checkout } = require("../controllers/cartController");

const router = express.Router();

router.put("/cart", upsertCart);
router.get("/cart", getCart);
router.delete("/cart", clearCart);
router.post("/checkout", checkout);

module.exports = router;
