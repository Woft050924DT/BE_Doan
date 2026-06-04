"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const mediaController_1 = require("../controllers/mediaController");
const router = (0, express_1.Router)();
router.get('/files', auth_1.authenticate, auth_1.requireAdmin, mediaController_1.getMediaFiles);
exports.default = router;
