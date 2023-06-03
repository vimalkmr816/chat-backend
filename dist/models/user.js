"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = require("crypto");
const mongoose_1 = __importDefault(require("mongoose"));
const userSchema = new mongoose_1.default.Schema({
    firstName: {
        type: String,
        required: [true, "FirstName is required"]
    },
    lastName: {
        type: String,
        required: [true, "LastName is required"]
    },
    avatar: {
        type: String
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        validate: {
            validator: (email) => /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.exec(String(email).toLowerCase()),
            message: (props) => `Email ${props.value} is invalid`
        }
    },
    password: {
        type: String
    },
    passwordChangedAt: {
        type: Date
    },
    passwordResetToken: {
        type: String
    },
    passwordResetExpires: {
        type: Date
    },
    createdAt: {
        type: Date
    },
    updatedAt: {
        type: Date
    },
    verified: {
        type: Boolean,
        default: false
    },
    otp: {
        type: String
    },
    otpExpiryTime: {
        type: Date
    }
});
userSchema.pre("save", async function (next) {
    // Only run this function if password was actually modified
    if (!this.isModified("otp") || !this.otp)
        return next();
    // Hash the otp with cost of 12
    this.otp = await bcryptjs_1.default.hash(this.otp.toString(), 12);
    next();
});
userSchema.pre("save", async function (next) {
    // Only run this function if password was actually modified
    if (!this.isModified("password") || !this.password)
        return next();
    // Hash the password with cost of 12
    this.password = await bcryptjs_1.default.hash(this.password.toString(), 12);
    // ! Shift it to next hook // this.passwordChangedAt = Date.now() - 1000;
    next();
});
userSchema.methods.matchPassword = async (candidatePassword, userPassword) => {
    const isValid = await bcryptjs_1.default.compare(candidatePassword, userPassword);
    return isValid;
};
userSchema.methods.matchOTP = async (candidateOTP, userOTP) => {
    const isValid = await bcryptjs_1.default.compare(candidateOTP, userOTP);
    return isValid;
};
userSchema.methods.createResetPasswordToken = function () {
    const resetToken = (0, crypto_1.randomBytes)(32).toString("hex");
    this.passwordResetToken = (0, crypto_1.createHash)("sha256").update(resetToken).digest("hex");
    console.log("========  createHash ", (0, crypto_1.createHash)("sha256").update(resetToken).digest("hex"));
    // update user passwor and clear resetToken and resetTokenExpires000;
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    return resetToken;
};
userSchema.methods.changePasswordAfter = function (time) {
    return time < this.passwordChangeAt;
};
exports.default = mongoose_1.default.model("User", userSchema);
