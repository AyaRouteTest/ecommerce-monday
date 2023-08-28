import nodemailer from "nodemailer";
export const sendEmail = async ({ to, subject, html, attachments = [] }) => {
  // sender
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAILPASS,
    },
  });

  //receiver
  let emailInfo;
  if (html) {
    emailInfo = await transporter.sendMail({
      from: `"Route Academy" <${process.env.EMAIL}>`,
      to,
      subject,
      html,
    });
  } else {
    emailInfo = await transporter.sendMail({
      from: `"Route Academy" <${process.env.EMAIL}>`,
      to,
      subject,
      attachments,
    });
  }

  console.log("emailInfo: ", emailInfo);
  return emailInfo.accepted.length < 1 ? false : true;
};
