"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const statsController_1 = require("../controllers/statsController");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get('/dashboard', statsController_1.getAdminDashboard);
exports.default = router;
