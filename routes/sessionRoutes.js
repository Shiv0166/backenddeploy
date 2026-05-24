const express = require("express");
const {
  setDemoCookie,
  getDemoCookie,
  createSession,
  readSession,
  destroySession,
} = require("../controllers/sessionController");

const router = express.Router();

router.get("/cookie/set", setDemoCookie);
router.get("/cookie/read", getDemoCookie);

router.post("/create", createSession);
router.get("/read", readSession);
router.delete("/destroy", destroySession);

module.exports = router;
