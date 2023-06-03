"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMe = void 0;
const user_1 = __importDefault(require("../models/user"));
const filterObj_1 = require("../utils/filterObj");
const updateMe = async (req, res, next) => {
    const { user } = req.body;
    const filteredBody = (0, filterObj_1.filterObj)(req.body, "firstName", "lastName", "about", "avatar");
    const updatedUser = await user_1.default.findByIdAndUpdate(user._id, filteredBody, {
        new: true,
        runValidators: true
    });
    res.status(200).json({
        status: "success",
        data: updatedUser,
        message: "Profile updated successfully"
    });
};
exports.updateMe = updateMe;
