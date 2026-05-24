const express = require("express");

const router = express.Router();

router.get("/ssr-demo", (req, res) => {
  res.render("dashboard", {
    pageTitle: "Server Side Rendering Demo",
    username: req.query.user || "Harshit",
    generatedAt: new Date().toLocaleString(),
    notifications: [
      "Order #1002 is ready",
      "New dessert added to menu",
      "Flash sale starts at 8 PM",
    ],
  });
});

router.get("/socket-demo", (req, res) => {
  res.render("socket-demo", {
    pageTitle: "Socket.IO Demo",
  });
});

module.exports = router;
