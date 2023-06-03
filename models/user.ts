import bcrypt                              from "bcryptjs";
import { createHash, randomBytes }         from "crypto";
import mongoose, { Schema, type Document } from "mongoose";

export interface UserType extends Document {
	firstName: string
	lastName: string
	email: string
	avatar: string
	password: string
	passwordChangedAt: Date
	passwordResetToken?: string
	passwordResetExpires?: Date
	createdAt: Date
	updatedAt: Date
	verified: boolean
	otp?: string
	passwordConfirm: string
	otpExpiryTime: Date
	matchPassword: ( candidatePassword: string, userPassword: string ) => Promise<boolean>
	matchOTP: ( candidateOTP: string, userOTP: string ) => Promise<boolean>
	createResetPasswordToken (): string
	changedPasswordAfter ( time?: number ): boolean
}

const userSchema: Schema<UserType> = new mongoose.Schema ( {
	firstName : {
		type     : String,
		required : [ true, "FirstName is required" ]
	},
	lastName : {
		type     : String,
		required : [ true, "LastName is required" ]
	},
	avatar : {
		type : String
	},
	email : {
		type     : String,
		required : [ true, "Email is required" ],
		validate : {
			validator : ( email: string ) => /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.exec ( String ( email ).toLowerCase () ),
			message   : ( props: { value: string } ) => `Email ${ props.value } is invalid`
		}
	},
	password : {
		type : String
	},
	passwordChangedAt : {
		type : Date
	},
	passwordResetToken : {
		type : String
	},
	passwordResetExpires : {
		type : Date
	},
	createdAt : {
		type : Date
	},
	updatedAt : {
		type : Date
	},
	verified : {
		type    : Boolean,
		default : false
	},
	otp : {
		type : String
	},
	otpExpiryTime : {
		type : Date
	}
} );

userSchema.pre ( "save", async function ( next ) {
	// Only run this function if password was actually modified
	if ( !this.isModified ( "otp" ) || !this.otp )
	 return next ();

	// Hash the otp with cost of 12
	this.otp = await bcrypt.hash ( this.otp.toString (), 12 );

	next ();
} );
userSchema.pre ( "save", async function ( next ) {
	// Only run this function if password was actually modified
	if ( !this.isModified ( "password" ) || !this.password )
	 return next ();

	// Hash the password with cost of 12
	this.password = await bcrypt.hash ( this.password.toString (), 12 );

	// ! Shift it to next hook // this.passwordChangedAt = Date.now() - 1000;
	next ();
} );

userSchema.methods.matchPassword = async (
	candidatePassword: string,
	userPassword: string
) => {
	const isValid = await bcrypt.compare ( candidatePassword, userPassword );

	return isValid;
};

userSchema.methods.matchOTP = async (
	candidateOTP: string,
	userOTP: string
) => {
	const isValid = await bcrypt.compare ( candidateOTP, userOTP );

	return isValid;
};

userSchema.methods.createResetPasswordToken = function () {
	const resetToken = randomBytes ( 32 ).toString ( "hex" );

	this.passwordResetToken = createHash ( "sha256" ).update ( resetToken ).digest ( "hex" );
	console.log ( "========  createHash ", createHash ( "sha256" ).update ( resetToken ).digest ( "hex" ) );
	// update user passwor and clear resetToken and resetTokenExpires000;
	this.passwordResetExpires = Date.now () + 10 * 60 * 1000;

	return resetToken;
};

userSchema.methods.changePasswordAfter = function ( time: number ) {
	return time < this.passwordChangeAt;
};

export default mongoose.model<UserType> ( "User", userSchema );
