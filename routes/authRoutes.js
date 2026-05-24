const express = require("express");
const passport = require("passport");
const { verifyJwt } = require("../middlewares/authMiddleware");
const { register, login, getProtectedProfile } = require("../controllers/authController");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

// JWT verification middleware protects this route.
router.get("/profile", verifyJwt, getProtectedProfile);

// Passport local strategy demonstration endpoint.
router.post("/passport-login", passport.authenticate("local"), (req, res) => {
  res.json({
    message: "Passport local login successful",
    user: { id: req.user.id, username: req.user.username },
  });
});

module.exports = router;
