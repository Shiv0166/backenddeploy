const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { mapUserPublic } = require("../lib/mappers");

function parseUserId(id) {
  const userId = Number(id);
  if (!Number.isInteger(userId) || userId < 1) return null;
  return userId;
}

async function createUser(req, res, next) {
  try {
    const { name, email, username, password } = req.body;
    const normalizedUsername = (username || email || "").trim();
    const normalizedEmail = email ? email.toLowerCase().trim() : null;

    if (!normalizedUsername || !password) {
      return res.status(400).json({ message: "username and password are required" });
    }

    const existing = await User.findByEmailOrUsername(normalizedEmail || normalizedUsername);
    if (existing) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: (name || "").trim(),
      email: normalizedEmail,
      username: normalizedUsername,
      password: hashedPassword,
    });

    return res.status(201).json(mapUserPublic(user));
  } catch (error) {
    return next(error);
  }
}

async function getUsers(req, res, next) {
  try {
    const users = await User.find();
    return res.json(users.map(mapUserPublic));
  } catch (error) {
    return next(error);
  }
}

async function getUserById(req, res, next) {
  try {
    const userId = parseUserId(req.params.id);
    if (!userId) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(mapUserPublic(user));
  } catch (error) {
    return next(error);
  }
}

async function updateUser(req, res, next) {
  try {
    const userId = parseUserId(req.params.id);
    if (!userId) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const existing = await User.findById(userId);
    if (!existing) {
      return res.status(404).json({ message: "User not found" });
    }

    const updates = {};
    if (req.body.name !== undefined) updates.name = String(req.body.name).trim();
    if (req.body.email !== undefined) {
      updates.email = req.body.email ? req.body.email.toLowerCase().trim() : null;
    }
    if (req.body.username !== undefined) updates.username = String(req.body.username).trim();
    if (req.body.password) {
      updates.password = await bcrypt.hash(req.body.password, 10);
    }

    const updated = await User.findByIdAndUpdate(userId, updates);
    return res.json(mapUserPublic(updated));
  } catch (error) {
    return next(error);
  }
}

async function deleteUser(req, res, next) {
  try {
    const userId = parseUserId(req.params.id);
    if (!userId) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const deleted = await User.findByIdAndDelete(userId);
    if (!deleted) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ message: "User deleted", id: deleted.id });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
};
