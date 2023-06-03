import express from "express";
import {
	forgotPassword,
	login,
	register,
	resetPassword,
	sendOTP,
	verifyOTP
} from "../controller/auth";

const router = express.Router ();

router.post ( "/login", login );
router.post ( "/register", register, sendOTP );
router.post ( "/send-otp", sendOTP );
router.post ( "/verify-otp", verifyOTP );
router.post ( "/forgot-password", forgotPassword );
router.post ( "/reset-password", resetPassword );

export default router;