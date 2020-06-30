const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
  sgMail.send({
    from: "121003145@sastra.ac.in",
    to: email,
    subject: "Thanks for joining in",
    text: `Welcome ${name} to the task manager app`,
  });
};
const cancellationEmail = (email, name) => {
  sgMail.send({
    from: "121003145@sastra.ac.in",
    to: email,
    subject: "Cancellation account",
    text: `Hi ${name} , send your feedback in order to make us better`,
  });
};
module.exports = {
  sendWelcomeEmail,
  cancellationEmail,
};
