"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../controller/auth");
const router = express_1.default.Router();
router.post("/login", auth_1.login);
router.post("/register", auth_1.register, auth_1.sendOTP);
router.post("/send-otp", auth_1.sendOTP);
router.post("/verify-otp", auth_1.verifyOTP);
router.post("/forgot-password", auth_1.forgotPassword);
router.post("/reset-password", auth_1.resetPassword);
exports.default = router;
