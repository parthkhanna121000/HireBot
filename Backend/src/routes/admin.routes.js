const express = require("express");
const router = express.Router();
const { getAdminStats } = require("../controllers/admin.controller");
const { authUser, requireRole } = require("../middlewares/auth.middleware");
//      ↑ authUser        ↑ requireRole — both from auth.middleware, not role.middleware

router.get("/stats", authUser, requireRole("admin"), getAdminStats);

module.exports = router;
