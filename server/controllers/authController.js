const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const LoginActivity = require("../models/LoginActivity");

async function register(req, res, next) {
  try {
    const { name, email, username, password } = req.body;
    const normalizedEmail = (email || username || "").toLowerCase().trim();
    if (!normalizedEmail || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }

    const existing = await User.findOne({
      $or: [{ email: normalizedEmail }, { username: normalizedEmail }],
    });
    if (existing) {
      return res.status(409).json({ message: "User already exists" });
    }

    // Hashing password before DB storage protects raw credentials.
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: (name || "").trim(),
      email: normalizedEmail,
      username: normalizedEmail,
      password: hashedPassword,
    });

    return res.status(201).json({
      message: "User registered",
      userId: user._id,
      user: {
        id: user._id,
        name: user.name || "",
        email: user.email,
      },
    });
  } catch (error) {
    return next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, username, password } = req.body;
    const normalizedEmail = (email || username || "").toLowerCase().trim();
    const user = await User.findOne({
      $or: [{ email: normalizedEmail }, { username: normalizedEmail }],
    });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Compare plain password with bcrypt hash from DB.
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { sub: user._id, username: user.username, email: user.email },
      process.env.JWT_SECRET || "dev_jwt_secret",
      { expiresIn: "1h" }
    );

    await LoginActivity.create({
      userId: user.id,
      userEmail: user.email || user.username,
      ip: req.ip || "",
      userAgent: req.headers["user-agent"] || "",
    });

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name || "",
        email: user.email || user.username,
      },
    });
  } catch (error) {
    return next(error);
  }
}

function getProtectedProfile(req, res) {
  return res.json({
    message: "Protected profile data",
    authUser: req.user,
  });
}

module.exports = {
  register,
  login,
  getProtectedProfile,
};
