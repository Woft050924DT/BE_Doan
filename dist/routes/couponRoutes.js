"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const couponController_1 = require("../controllers/couponController");
const router = (0, express_1.Router)();
router.post('/validate', auth_1.optionalAuthenticate, couponController_1.validateCoupon);
exports.default = router;
