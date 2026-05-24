function notFoundHandler(req, res) {
  res.status(404).json({ message: "Route not found" });
}

function globalErrorHandler(err, req, res, next) {
  // Express identifies this as error middleware because of 4 args:
  // (err, req, res, next)
  console.error("[Error Middleware]", err.message);

  if (err.code === "23505") {
    return res.status(409).json({ message: "Duplicate record" });
  }

  res.status(err.statusCode || 500).json({
    message: err.message || "Internal server error",
  });
}

module.exports = {
  notFoundHandler,
  globalErrorHandler,
};
