const jwt = require("jsonwebtoken");

function verifyJwt(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!token) {
    return res.status(401).json({ message: "Missing Bearer token" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "dev_jwt_secret");
    req.user = payload;
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

module.exports = { verifyJwt };
