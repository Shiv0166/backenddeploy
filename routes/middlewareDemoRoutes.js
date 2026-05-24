const express = require("express");

const router = express.Router();

router.get("/middleware-demo/non-blocking", (req, res) => {
  // Non-blocking example: setTimeout schedules work and immediately frees event loop.
  setTimeout(() => {
    console.log("Non-blocking timer finished");
  }, 1000);
  res.json({ message: "Non-blocking middleware example executed" });
});

router.get("/middleware-demo/blocking", (req, res) => {
  // Blocking example: busy loop holds event loop and delays all other requests.
  const start = Date.now();
  while (Date.now() - start < 1500) {
    // Intentional blocking work for demonstration only.
  }
  res.json({ message: "Blocking middleware example executed after busy loop" });
});

module.exports = router;
