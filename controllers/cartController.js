const Cart = require("../models/Cart");
const Order = require("../models/Order");
const User = require("../models/User");

function normalizeItems(items) {
  return (Array.isArray(items) ? items : []).map((item) => ({
    itemId: Number(item.itemId ?? item.id ?? 0),
    name: item.name,
    price: Number(item.price || 0),
    quantity: Math.max(Number(item.quantity || 1), 1),
    image: item.image || "",
    category: item.category || "General",
  }));
}

function computeTotals(items) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = Number((subtotal * 0.1).toFixed(2));
  const delivery = 5;
  const total = Number((subtotal + tax + delivery).toFixed(2));
  return { subtotal, tax, delivery, total };
}

async function upsertCart(req, res, next) {
  try {
    const userEmail = (req.body.userEmail || "").toLowerCase().trim();
    if (!userEmail) {
      return res.status(400).json({ message: "userEmail is required" });
    }

    const items = normalizeItems(req.body.items);
    const user = await User.findOne({ $or: [{ email: userEmail }, { username: userEmail }] });
    const cart = await Cart.findOneAndUpdate(
      { userEmail },
      { userId: user?._id || null, userEmail, items },
      { upsert: true, new: true, runValidators: true }
    );

    return res.json(cart);
  } catch (error) {
    next(error);
  }
}

async function getCart(req, res, next) {
  try {
    const userEmail = (req.query.userEmail || "").toLowerCase().trim();
    if (!userEmail) {
      return res.status(400).json({ message: "userEmail is required" });
    }

    const cart = await Cart.findOne({ userEmail });
    return res.json(cart || { userEmail, items: [] });
  } catch (error) {
    next(error);
  }
}

async function clearCart(req, res, next) {
  try {
    const userEmail = (req.query.userEmail || "").toLowerCase().trim();
    if (!userEmail) {
      return res.status(400).json({ message: "userEmail is required" });
    }
    await Cart.findOneAndUpdate({ userEmail }, { items: [] }, { upsert: true });
    return res.json({ message: "Cart cleared" });
  } catch (error) {
    next(error);
  }
}

async function checkout(req, res, next) {
  try {
    const { userEmail, customerInfo, items, payment, notes } = req.body;
    const email = (userEmail || customerInfo?.email || "").toLowerCase().trim();
    if (!email || !customerInfo?.fullName || !customerInfo?.phone || !customerInfo?.address) {
      return res.status(400).json({ message: "Missing required checkout fields" });
    }

    const normalizedItems = normalizeItems(items);
    if (!normalizedItems.length) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const { subtotal, tax, delivery, total } = computeTotals(normalizedItems);
    const cardNumber = String(payment?.cardNumber || "");
    const cardLast4 = cardNumber.slice(-4);
    const orderNumber = `FH${Date.now().toString().slice(-8)}`;
    const user = await User.findOne({ $or: [{ email }, { username: email }] });

    const order = await Order.create({
      orderNumber,
      userId: user?._id || null,
      userEmail: email,
      items: normalizedItems,
      subtotal,
      tax,
      delivery,
      total,
      customerInfo: {
        fullName: customerInfo.fullName,
        email: customerInfo.email || email,
        phone: customerInfo.phone,
        address: customerInfo.address,
        notes: notes || customerInfo.notes || "",
      },
      payment: {
        cardLast4,
        expiry: payment?.expiry || "",
      },
    });

    await Cart.findOneAndUpdate({ userEmail: email }, { items: [] }, { upsert: true });
    return res.status(201).json({
      message: "Order placed successfully",
      orderNumber: order.orderNumber,
      orderId: order._id,
      total: order.total,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  upsertCart,
  getCart,
  clearCart,
  checkout,
};
