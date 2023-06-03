import type { NextFunction, Request, Response } from "express";
import { UserType }                             from "./../models/user";

import { createHash }      from "crypto";
import jwt, { JwtPayload } from "jsonwebtoken";
import otpGenerator        from "otp-generator";
import User                from "../models/user";
import { sendSGMail }      from "../services/mailer";
import { filterObj }       from "../utils/filterObj";
export interface CustomRequest extends Request {
  userId: string
  user: UserType
}

const signToken = ( userId: string ) => {

	return jwt.sign ( { userId }, process.env.JWT_SECRET );
};

export const register = async ( req: Request, res: Response, next: NextFunction ) => {

	const filteredBody = filterObj ( req.body, "firstName", "lastName", "password", "email" );

	const existingUser = await User.findOne ( { email : filteredBody.email } );

	if ( existingUser && existingUser.verified ) {
		res.status ( 400 ).json ( {
			status  : "error",
			message : "Email is already in use, please login"
		} );
	} else if ( existingUser && !existingUser.verified ) {
		const updatedUser = await User.findOneAndUpdate ( { ...filteredBody }, {
			new           : true,
			runValidators : true
		} );

		req.body.userId = existingUser._id;
		req.body.email  = filteredBody.email;
		next ();
	} else {
		const newUser = await User.create ( filteredBody );

		req.body.userId =  newUser._id;

		next ();
	}
};

export const sendOTP = async ( req: Request, res: Response, next: NextFunction ) => {
	const { userId, email } = req.body;

	const newOtp        = otpGenerator.generate ( 6, {
		lowerCaseAlphabets : false,
		upperCaseAlphabets : false,
		specialChars       : false
	} );
	const otpExpiryTime = Date.now () + 10 * 60 * 1000;

	const user = await User.findByIdAndUpdate ( userId, {
		otpExpiryTime
	} );

	if ( user ) {
		user.otp = newOtp;
		await user.save ( { validateModifiedOnly : true } );
	}
	// TODO : Send Mail
	try {
		sendSGMail ( {
			from      : "vimalkmr478@gmail.com",
			recipient : email,
			subject   : "OTP",
			text      : `Your OTP is ${ newOtp }, its valid for only 60seconds`,
			content   : "some content"
		} );
	} catch ( error ) {
		console.log ( error.response.body, "=============" );
	}
	res.status ( 200 ).json ( {
		status  : "success",
		message : "otp sent sucessfully"
	} );
};

export const verifyOTP = async ( req: Request, res: Response, next: NextFunction ) => {
	const { email, otp } = req.body;
	const user           = await User.findOne ( {
		email,
		otpExpiryTime : { $gt : Date.now () }
	} );

	if ( !user ) {
		res.status ( 400 ).json ( {
			status  : "error",
			message : "Email is invalid or OTP expired"
		} );

		return;
	}
	if ( user?.otp && !await user?.matchOTP ( otp, user.otp.toString () ) ) {
		res.status ( 400 ).json ( {
			status  : "error",
			message : "OTP is incorrect"
		} );

		return;
	}

	if ( user ) {
		user.verified = true;
		user.otp      = undefined;
		await user.save ();
		const token = signToken ( user._id );

		res.status ( 200 ).json ( {
			status  : "success",
			message : "OTP verified successfully",
			token   : token
		} );
	}

};

export const forgotPassword = async ( req: Request, res: Response, next: NextFunction ) => {
	const { email } = req.body;
	const user      = await User.findOne ( { email } );

	if ( !user ) {
		res.status ( 400 ).json ( {
			status  : "error",
			message : "There is no user with give email address"
		} );

		return;
	} else {
		const resetToken = user.createResetPasswordToken ();

		console.log ( "========  resetToken outside:", resetToken );

		await user.save ( { validateBeforeSave : false } );
		try {
			const resetURL = `https://tawk.com/auth/reset-password/?code=${ resetToken }`;

			res.status ( 200 ).json ( {
				status  : "success",
				message : "Reset Password link sent to email"
			} );
		} catch ( error ) {
			user.passwordResetToken   = undefined;
			user.passwordResetExpires = undefined;
			await user.save ( { validateBeforeSave : false } );
			res.status ( 500 ).json ( {
				status  : "error",
				message : "There was an error sending the email, please try again later."
			} );
		}

	}

};

export const resetPassword = async ( req: Request, res: Response, next: NextFunction ) => {

	const { password, passwordConfirm, token } = req.body;

	const hashedToken = createHash ( "sha256" ).update ( token ).digest ( "hex" );

	console.log ( "========  token:", token );
	console.log ( "========  hashedToken:", hashedToken );

	const user = await User.findOne ( {
		passwordResetToken   : hashedToken,
		passwordResetExpires : { $gt : Date.now () }
	} );

	if ( !user ) {
		res.status ( 401 ).json ( {
			status  : "error",
			message : "token is invalid or expired"
		} );

		return;
	}
	user.password        = password;
	user.passwordConfirm = passwordConfirm;

	user.passwordResetToken   = undefined;
	user.passwordResetExpires = undefined;
	await user.save ();

	const newToken = signToken ( user._id );

	res.status ( 200 ).json ( {
		status  : "success",
		message : "password reset successfully",
		newToken
	} );

};

export const protect = async ( req: Request, res: Response, next: NextFunction ) => {

	// getting token from the user and checking tht token
	let token;

	if ( req.headers.authorization && req.headers.authorization.startsWith ( "Bearer" ) ) {
		token = req.headers.authorization.split ( " " )[1];
	} else if ( req.cookies.jwt ) {
		token = req.cookies.jwt;
	} else {
		res.status ( 401 ).json ( {
			status  : "error",
			message : "you are not logged in"
		} );

		return;
	}

	let decodedToken: string | JwtPayload;

	try {
		decodedToken = jwt.verify ( token, process.env.JWT_SECRET );
	} catch ( error ) {
		return res.status ( 401 ).json ( { error : "Invalid token" } );
	}
	if ( typeof decodedToken === "string" ) {
		return res.status ( 401 ).json ( { error : "Invalid token" } );
	}

	const user = await User.findById ( decodedToken.userId );

	if ( !user ) {
		res.status ( 400 ).json ( {
			status  : "error",
			message : "the user doesnt exist"
		} );
	}

	if ( user && user.changedPasswordAfter ( decodedToken.iat ) ) {
		res.status ( 400 ).json ( {
			status  : "error",
			message : "the user recently updated their passoword, please login again"
		} );

		req.body.user = user;
	}
	next ();

};

export const login = async ( req: Request, res: Response, next: NextFunction ) => {
	const { email, password } = req.body;

	if ( !email || !password ) {
		res.status ( 400 ).json ( {
			status  : "error",
			message : "Both email and password are required"
		} );

		return;
	}
	const userDoc = await User.findOne ( { email } ).select ( "+password" );

	if ( userDoc == null || !( await userDoc.matchPassword ( password, userDoc?.password ) ) ) {
		res.status ( 400 ).json ( {
			status  : "error",
			message : "Email or password is incorrect"
		} );
	}
	const token = signToken ( userDoc?._id );

	res.status ( 200 ).json ( {
		status  : "success",
		message : "Logged in Successfully",
		token
	} );
};
