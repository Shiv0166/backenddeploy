const path = require("path");
const Order = require("../models/Order");
const User = require("../models/User");

function computeTotals(items) {
  const subtotal = items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0);
  const tax = Number((subtotal * 0.1).toFixed(2));
  const delivery = 5;
  const total = Number((subtotal + tax + delivery).toFixed(2));
  return { subtotal, tax, delivery, total };
}

async function getOrderForm(req, res) {
  res.sendFile(path.join(__dirname, "..", "index.html"));
}

async function createOrder(req, res, next) {
  try {
    const { name, food, quantity } = req.body;
    const fallbackItem = {
      itemId: 0,
      name: food || "Food Item",
      price: 0,
      quantity: Number(quantity) || 1,
      image: "",
      category: "General",
    };
    const items = Array.isArray(req.body.items) && req.body.items.length ? req.body.items : [fallbackItem];
    const { subtotal, tax, delivery, total } = computeTotals(items);
    const orderNumber = req.body.orderNumber || `FH${Date.now().toString().slice(-8)}`;
    const userEmail = (req.body.userEmail || req.body.email || "").toLowerCase().trim();
    const user = userEmail ? await User.findOne({ $or: [{ email: userEmail }, { username: userEmail }] }) : null;

    const order = await Order.create({
      orderNumber,
      userId: user?._id || null,
      userEmail: userEmail || "guest@foodhub.local",
      items: items.map((item) => ({
        itemId: Number(item.itemId ?? item.id ?? 0),
        name: item.name,
        price: Number(item.price || 0),
        quantity: Number(item.quantity || 1),
        image: item.image || "",
        category: item.category || "General",
      })),
      subtotal,
      tax,
      delivery,
      total,
      customerInfo: {
        fullName: req.body.fullName || name || "Guest User",
        email: req.body.email || userEmail || "guest@foodhub.local",
        phone: req.body.phone || "",
        address: req.body.address || "",
        notes: req.body.notes || "",
      },
      payment: {
        cardLast4: req.body.cardLast4 || "",
        expiry: req.body.expiry || "",
      },
    });

    if (Array.isArray(req.body.items)) {
      return res.status(201).json({ message: "Order saved", orderNumber: order.orderNumber, orderId: order._id });
    }
    return res.send("Order saved successfully!");
  } catch (error) {
    next(error);
  }
}

async function getOrders(req, res, next) {
  try {
    const orders = await Order.find({ limit: 100 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
}

async function streamOrders(req, res, next) {
  try {
    const orders = await Order.find({ limit: 100 });
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    if (!orders.length) {
      return res.end("No orders found");
    }
    const printable = orders
      .map((order) => `${order.customerInfo?.fullName || "Guest"} ordered ${order.items?.length || 0} item(s) [${order.orderNumber}]`)
      .join("\n");
    res.end(printable);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getOrderForm,
  createOrder,
  getOrders,
  streamOrders,
};
