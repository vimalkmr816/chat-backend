import sgMail from "@sendgrid/mail";
sgMail.setApiKey ( process.env.SG_KEY );

type MailArgs = { recipient: string, from: string, subject: string, content: string, text: string }
export const sendSGMail = async ( mailArgs: MailArgs ) => {
	const {
		recipient,
		from,
		subject,
		content,
		text
	} = mailArgs;

	const msg = {
		to   : recipient,
		from : from,
		subject,
		html : content,
		text
	};

	sgMail
		.send ( msg )
		.then ( () => {
			console.log ( "Email sent" );
		} )
		.catch ( error => {
			throw error;
		} );
};

/* export const sendEmail = async ( args: MailArgs ) => {
	if ( process.env.NODE_ENV === "development" )
		return new Promise.resolve ();
	else return sendSGMail ( args );
}; */