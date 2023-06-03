import type { NextFunction, Request, Response } from "express";
import User                                     from "../models/user";
import { filterObj }                            from "../utils/filterObj";
import { CustomRequest }                        from "./auth";

export const updateMe = async ( req: Request, res: Response, next: NextFunction ) => {
	const { user }     = req.body;
	const filteredBody = filterObj ( req.body, "firstName", "lastName", "about", "avatar" );

	const updatedUser = await User.findByIdAndUpdate ( user._id, filteredBody, {
		new           : true,
		runValidators : true
	} );

	res.status ( 200 ).json ( {
		status  : "success",
		data    : updatedUser,
		message : "Profile updated successfully"
	} );
};