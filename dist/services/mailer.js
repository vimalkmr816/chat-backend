"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSGMail = void 0;
const mail_1 = __importDefault(require("@sendgrid/mail"));
mail_1.default.setApiKey(process.env.SG_KEY);
const sendSGMail = async (mailArgs) => {
    const { recipient, from, subject, content, text } = mailArgs;
    const msg = {
        to: recipient,
        from: from,
        subject,
        html: content,
        text
    };
    mail_1.default
        .send(msg)
        .then(() => {
        console.log("Email sent");
    })
        .catch(error => {
        throw error;
    });
};
exports.sendSGMail = sendSGMail;
/* export const sendEmail = async ( args: MailArgs ) => {
    if ( process.env.NODE_ENV === "development" )
        return new Promise.resolve ();
    else return sendSGMail ( args );
}; */ 
