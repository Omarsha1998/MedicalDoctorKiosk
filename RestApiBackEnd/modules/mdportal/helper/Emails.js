const util = require("../../../helpers/util.js");

async function sendForgotEmail(email, TemporaryPassword) {
  if (email) {
    const emailContent = {
      subject: "Reset your password",
      header: `
        <div style="background-color: #e8f2fe;
        font-family: Arial, sans-serif; 
        border:1px solid #0f4d91;
        font-size: 20px;
        padding:12px 16px; 
        color: #01386e;
        border-radius:4px; 
        text-align: center;">FORGOT YOUR PASSWORD?</div>
      `,
      content: `
        <div style="font-family: Arial, sans-serif; font-size: 15px; color: #333; text-align: center;">

          <p style="line-height: 1.6;">
            We have received a request to reset your account password.<br>
            If you did not initiate this request, please disregard this email.
          </p>


          <hr style="border: none; border-top: 1px solid rgba(0, 0, 0, 0.2); border-radius: 2px; width: 80%; margin: 25px auto;">

          <p style="line-height: 1.6;">If you did make this request, please use the temporary 
          <br>password provided below to regain secure access to your account:</p>

          <div style="
            display: inline-block;
            padding: 15px 25px;
            background-color: #01386e;
            color: #fff;
            border-radius: 10px;
            font-weight: bold;
            margin-top: 15px;
            text-align: center;
          ">
            ${TemporaryPassword}
          </div>
        </div>
      `,
      email: "john.brian.palacio@gmail.com",
      name: "JOHN BRIAN",
    };

    await util.sendEmail(emailContent);
  }
}

module.exports = {
  sendForgotEmail,
};
