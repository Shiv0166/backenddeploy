function setDemoCookie(req, res) {
  // Cookie demo: value is stored in browser and returned on later requests.
  res.cookie("course", "node-express", { httpOnly: true, maxAge: 15 * 60 * 1000 });
  res.json({ message: "Cookie set (course=node-express)" });
}

function getDemoCookie(req, res) {
  res.json({ cookies: req.cookies });
}

function createSession(req, res) {
  req.session.user = {
    username: req.body.username || "guest-student",
    createdAt: new Date().toISOString(),
  };
  res.json({ message: "Session created", sessionUser: req.session.user });
}

function readSession(req, res) {
  res.json({
    hasSession: Boolean(req.session.user),
    sessionUser: req.session.user || null,
  });
}

function destroySession(req, res, next) {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.clearCookie("connect.sid");
    res.json({ message: "Session destroyed" });
  });
}

module.exports = {
  setDemoCookie,
  getDemoCookie,
  createSession,
  readSession,
  destroySession,
};
