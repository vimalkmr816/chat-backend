import dotenv           from "dotenv";
import { createServer } from "http";
import mongoose         from "mongoose";
import app              from "./app";

dotenv.config ( {
	path : ".env"
} );

const port   = process.env.PORT;
const server = createServer ( app );
const db     = process.env.DB_URI.replace ( "<PASSWORD>", process.env.DB_PASS );

mongoose.connect ( db ).then ( () => {
	console.log ( "DB connection successfull" );
} ).catch ( err => {
	console.log ( err );
} );

server.listen ( port, () => {
	console.log ( `listening on ${ port }` );
} );

process.on ( "unhandledRejection", err => {
	console.log ( err );
	server.close ( () => {
		process.exit ( 1 );
	} );
} );

process.on ( "uncaughtException", err => {
	console.log ( err, "==================== uncaught exception" );
	process.exit ( 1 );
} );
