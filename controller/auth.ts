import { type NextFunction, type Request, type Response } from "express"
import jwt from "jsonwebtoken"
import User from "../models/user"

export const login = async (req: Request, res: Response, next: NextFunction)  => {
	const { email, password } = req.body
	if (!email || !password) {
		res.status(400).json({
			status: "error",
			message: "Both email and password are required"
		})
	}
	const userDoc = await User.findOne({ email }).select("+password")

	if (userDoc == null || !( await userDoc.matchPassword(password, userDoc?.password) )) {
		res.status(400).json({
			status: "error",
			message: "Email or password is incorrect"
		})
		const token = signToken(userDoc?._id)
		res.status(200).json({
			status: "success",
			message: "Logged in Successfully",
			token
		} )
	}
}

const signToken= (userId: string) => {
	if( process.env.JWT_SECRET )
		jwt.sign({ userId }, process.env.JWT_SECRET )
    
}

