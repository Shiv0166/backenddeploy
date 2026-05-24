const express = require("express");
const {
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const router = express.Router();

// Basic CRUD routes using a Mongoose model.
router.post("/products", createProduct); // Create
router.get("/products", getProducts); // Read
router.put("/products/:id", updateProduct); // Update
router.delete("/products/:id", deleteProduct); // Delete

module.exports = router;
