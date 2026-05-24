const express = require("express");
const { routerLifecycleNote } = require("../middlewares/requestLifecycle");
const {
  getOrderForm,
  createOrder,
  getOrders,
  streamOrders,
} = require("../controllers/orderController");

const router = express.Router();

// Router-level middleware: applies only to routes registered in this router.
router.use(routerLifecycleNote);

router.get("/order", getOrderForm);
router.post("/order", createOrder);
router.get("/orders", getOrders);
router.get("/orders-stream", streamOrders);

module.exports = router;
