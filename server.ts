import dotenv from "dotenv"
import { createServer } from "http"
import mongoose from "mongoose"

dotenv.config({
	path: "./.env"
})

process.on("uncaughtException", err => {
	console.log(err)
	process.exit(1)
})
const server = createServer()
const db = process.env.DB_URI?.replace("<PASSWORD>", process.env.DB_PASS ?? "")

if (db !== undefined) {
	mongoose.connect(db).then(con => {
		console.log("DB connection successfull")
	}).catch(err => {
		console.log(err)
	})
}

const port = process.env.PORT ?? 8000

server.listen(port, () => {
	console.log(`⚡listening ============== ${port}`)
})

process.on("unhandledRejection", err => {
	console.log(err)
	server.close(() => {
		process.exit(1)
	})
})
