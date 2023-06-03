"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = require("http");
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = __importDefault(require("./app"));
dotenv_1.default.config({
    path: ".env"
});
const port = process.env.PORT;
const server = (0, http_1.createServer)(app_1.default);
const db = process.env.DB_URI.replace("<PASSWORD>", process.env.DB_PASS);
mongoose_1.default.connect(db).then(() => {
    console.log("DB connection successfull");
}).catch(err => {
    console.log(err);
});
server.listen(port, () => {
    console.log(`listening on ${port}`);
});
process.on("unhandledRejection", err => {
    console.log(err);
    server.close(() => {
        process.exit(1);
    });
});
process.on("uncaughtException", err => {
    console.log(err, "==================== uncaught exception");
    process.exit(1);
});
