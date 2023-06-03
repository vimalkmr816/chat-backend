import bodyParser                from "body-parser";
import cors                      from "cors";
import express, { type Express } from "express";
import mongosanitize             from "express-mongo-sanitize";
import { rateLimit }             from "express-rate-limit";
import helmet                    from "helmet";
import morgan                    from "morgan";
import routes                    from "./routes";

const app = express ();

// App.use(xss(html))

app.use ( express.json ( { limit : "10kb" } ) );
app.use ( bodyParser.json () );
app.use ( bodyParser.urlencoded ( { extended : true } ) );
app.use ( helmet () );

if ( process.env.NODE_ENV === "development" ) {
	app.use ( morgan ( "dev" ) );
}

const limiter = rateLimit ( {
	max      : 3000,
	windowMs : 60 * 60 * 1000,
	message  : "Too many requests, please try again after an hour"
} );

app.use ( "/tawk", limiter );

app.use ( express.urlencoded ( {
	extended : true
} ) );
app.use ( mongosanitize () );
app.use ( cors ( {
	origin      : "*",
	methods     : [ "GET", "POST", "PATCH", "DELETE", "PUT" ],
	credentials : true
} ) );

app.use ( routes );

export default app;
