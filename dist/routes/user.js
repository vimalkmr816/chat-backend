"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../controller/auth");
const user_1 = require("../controller/user");
const router = express_1.default.Router();
router.post("/update-me", auth_1.protect, user_1.updateMe);
exports.default = router;
