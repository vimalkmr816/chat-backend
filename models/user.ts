import bcrypt from "bcryptjs"
import mongoose, { Document, Schema } from "mongoose"
// Define interface for the document
export interface UserType extends Document {
  firstName: string
  lastName: string
  email: string
  avatar: string
  password: string
  passwordChangedAt: Date
  passwordResetToken: string
  passwordResetExpires: Date
  createdAt: Date
  updatedAt: Date
  matchPassword: (candidatePassword: string, userPassword: string) => Promise<boolean>
}

const userSchema: Schema<UserType> = new mongoose.Schema({
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
			validator: (email: string) => {
				return /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.exec(String(email).toLowerCase())
			},
			message: (props: { value: string }) => {
				return `Email ${props.value} is invalid`
			}
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
	}
})

userSchema.methods.matchPassword = async (
	candidatePassword: string,
	userPassword: string
) => { 
	const isValid =await bcrypt.compare(candidatePassword, userPassword)
	return isValid
}

export default mongoose.model<UserType>("User", userSchema)
