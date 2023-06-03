"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const express_mongo_sanitize_1 = __importDefault(require("express-mongo-sanitize"));
const express_rate_limit_1 = require("express-rate-limit");
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const routes_1 = __importDefault(require("./routes"));
const app = (0, express_1.default)();
// App.use(xss(html))
app.use(express_1.default.json({ limit: "10kb" }));
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use((0, helmet_1.default)());
if (process.env.NODE_ENV === "development") {
    app.use((0, morgan_1.default)("dev"));
}
const limiter = (0, express_rate_limit_1.rateLimit)({
    max: 3000,
    windowMs: 60 * 60 * 1000,
    message: "Too many requests, please try again after an hour"
});
app.use("/tawk", limiter);
app.use(express_1.default.urlencoded({
    extended: true
}));
app.use((0, express_mongo_sanitize_1.default)());
app.use((0, cors_1.default)({
    origin: "*",
    methods: ["GET", "POST", "PATCH", "DELETE", "PUT"],
    credentials: true
}));
app.use(routes_1.default);
exports.default = app;
