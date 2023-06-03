"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.protect = exports.resetPassword = exports.forgotPassword = exports.verifyOTP = exports.sendOTP = exports.register = void 0;
const crypto_1 = require("crypto");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const otp_generator_1 = __importDefault(require("otp-generator"));
const user_1 = __importDefault(require("../models/user"));
const mailer_1 = require("../services/mailer");
const filterObj_1 = require("../utils/filterObj");
const signToken = (userId) => {
    return jsonwebtoken_1.default.sign({ userId }, process.env.JWT_SECRET);
};
const register = async (req, res, next) => {
    const filteredBody = (0, filterObj_1.filterObj)(req.body, "firstName", "lastName", "password", "email");
    const existingUser = await user_1.default.findOne({ email: filteredBody.email });
    if (existingUser && existingUser.verified) {
        res.status(400).json({
            status: "error",
            message: "Email is already in use, please login"
        });
    }
    else if (existingUser && !existingUser.verified) {
        const updatedUser = await user_1.default.findOneAndUpdate(Object.assign({}, filteredBody), {
            new: true,
            runValidators: true
        });
        req.body.userId = existingUser._id;
        req.body.email = filteredBody.email;
        next();
    }
    else {
        const newUser = await user_1.default.create(filteredBody);
        req.body.userId = newUser._id;
        next();
    }
};
exports.register = register;
const sendOTP = async (req, res, next) => {
    const { userId, email } = req.body;
    const newOtp = otp_generator_1.default.generate(6, {
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false
    });
    const otpExpiryTime = Date.now() + 10 * 60 * 1000;
    const user = await user_1.default.findByIdAndUpdate(userId, {
        otpExpiryTime
    });
    if (user) {
        user.otp = newOtp;
        await user.save({ validateModifiedOnly: true });
    }
    // TODO : Send Mail
    try {
        (0, mailer_1.sendSGMail)({
            from: "vimalkmr478@gmail.com",
            recipient: email,
            subject: "OTP",
            text: `Your OTP is ${newOtp}, its valid for only 60seconds`,
            content: "some content"
        });
    }
    catch (error) {
        console.log(error.response.body, "=============");
    }
    res.status(200).json({
        status: "success",
        message: "otp sent sucessfully"
    });
};
exports.sendOTP = sendOTP;
const verifyOTP = async (req, res, next) => {
    const { email, otp } = req.body;
    const user = await user_1.default.findOne({
        email,
        otpExpiryTime: { $gt: Date.now() }
    });
    if (!user) {
        res.status(400).json({
            status: "error",
            message: "Email is invalid or OTP expired"
        });
        return;
    }
    if ((user === null || user === void 0 ? void 0 : user.otp) && !await (user === null || user === void 0 ? void 0 : user.matchOTP(otp, user.otp.toString()))) {
        res.status(400).json({
            status: "error",
            message: "OTP is incorrect"
        });
        return;
    }
    if (user) {
        user.verified = true;
        user.otp = undefined;
        await user.save();
        const token = signToken(user._id);
        res.status(200).json({
            status: "success",
            message: "OTP verified successfully",
            token: token
        });
    }
};
exports.verifyOTP = verifyOTP;
const forgotPassword = async (req, res, next) => {
    const { email } = req.body;
    const user = await user_1.default.findOne({ email });
    if (!user) {
        res.status(400).json({
            status: "error",
            message: "There is no user with give email address"
        });
        return;
    }
    else {
        const resetToken = user.createResetPasswordToken();
        console.log("========  resetToken outside:", resetToken);
        await user.save({ validateBeforeSave: false });
        try {
            const resetURL = `https://tawk.com/auth/reset-password/?code=${resetToken}`;
            res.status(200).json({
                status: "success",
                message: "Reset Password link sent to email"
            });
        }
        catch (error) {
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            await user.save({ validateBeforeSave: false });
            res.status(500).json({
                status: "error",
                message: "There was an error sending the email, please try again later."
            });
        }
    }
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (req, res, next) => {
    const { password, passwordConfirm, token } = req.body;
    const hashedToken = (0, crypto_1.createHash)("sha256").update(token).digest("hex");
    console.log("========  token:", token);
    console.log("========  hashedToken:", hashedToken);
    const user = await user_1.default.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
    });
    if (!user) {
        res.status(401).json({
            status: "error",
            message: "token is invalid or expired"
        });
        return;
    }
    user.password = password;
    user.passwordConfirm = passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    const newToken = signToken(user._id);
    res.status(200).json({
        status: "success",
        message: "password reset successfully",
        newToken
    });
};
exports.resetPassword = resetPassword;
const protect = async (req, res, next) => {
    // getting token from the user and checking tht token
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }
    else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }
    else {
        res.status(401).json({
            status: "error",
            message: "you are not logged in"
        });
        return;
    }
    let decodedToken;
    try {
        decodedToken = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
    }
    catch (error) {
        return res.status(401).json({ error: "Invalid token" });
    }
    if (typeof decodedToken === "string") {
        return res.status(401).json({ error: "Invalid token" });
    }
    const user = await user_1.default.findById(decodedToken.userId);
    if (!user) {
        res.status(400).json({
            status: "error",
            message: "the user doesnt exist"
        });
    }
    if (user && user.changedPasswordAfter(decodedToken.iat)) {
        res.status(400).json({
            status: "error",
            message: "the user recently updated their passoword, please login again"
        });
        req.body.user = user;
    }
    next();
};
exports.protect = protect;
const login = async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({
            status: "error",
            message: "Both email and password are required"
        });
        return;
    }
    const userDoc = await user_1.default.findOne({ email }).select("+password");
    if (userDoc == null || !(await userDoc.matchPassword(password, userDoc === null || userDoc === void 0 ? void 0 : userDoc.password))) {
        res.status(400).json({
            status: "error",
            message: "Email or password is incorrect"
        });
    }
    const token = signToken(userDoc === null || userDoc === void 0 ? void 0 : userDoc._id);
    res.status(200).json({
        status: "success",
        message: "Logged in Successfully",
        token
    });
};
exports.login = login;
