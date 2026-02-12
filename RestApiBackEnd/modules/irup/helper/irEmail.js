const util = require("../../../helpers/util.js");

async function OtherSubjectCode(iRNo, description, subjectBriefDes) {
  if (iRNo) {
    const emailContent = {
      subject: "INCIDENT REPORT",
      header: `INCIDENT REPORT DETAILS <br />`,
      content: `Dear <b>ADMIN,</b><br>
                
                We are reaching out to request a review and reclassification of an incident report 
                currently tagged under the "Others" category in the IR system. 
                Below are the details of the incident:
                <br><br> 

                <b>Incident Report Details:</b><br> 
                <b>Incident Report Number:</b> ${iRNo}.<br>
                <b>Incident Responder (Department):</b> ${description}<br> 
                <b>Brief Description of the incident: </b> ${subjectBriefDes}<br>
                <br><br>

                Your prompt assistance in ensuring proper documentation and handling, 
                we kindly request your team’s assistance in reviewing the incident report 
                and determining the appropriate category.
                <br><br>

                Thank you for your prompt attention to this matter.
                `,
      email: "qualityassurance@uerm.edu.ph, john.brian.palacio@gmail.com",
      name: "Quality Assurance",
    };
    await util.sendEmail(emailContent);
  }
}

async function UniqueSubjectCode(
  iRNo,
  subjectName,
  subjectSpecificExam,
  subjectDate,
  subjectTime,
  subjectLoc,
  division,
  divisionEmail,
) {
  if (divisionEmail) {
    const formattedDate = new Date(subjectDate)
      .toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "2-digit",
      })
      .toUpperCase();

    const formattedTime = new Date(subjectTime)
      .toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
      .toUpperCase();

    const emailContent = {
      subject: "INCIDENT REPORT",
      header: `INCIDENT REPORT DETAILS <br />`,
      content: `Dear <b>ADMIN,</b><br><br>
                
                I would like to bring the Incident Report (IR) in the system to your attention.
                Please find the details of the incident below for your review and necessary action:
                <br><br> 

                <b>Incident Report Number:</b> ${iRNo}.<br>
                <b>Subject of the Incident:</b>  ${subjectName}${subjectSpecificExam ? ` - ${subjectSpecificExam}` : ""}<br> 
                <b>Date and Time:</b> ${formattedDate} & ${formattedTime}<br>
                <b>Location of the incident:</b> ${subjectLoc}
                <br><br>

                Kindly review the incident and address the concerns accordingly. Please use the button below to access the Primary Module:
                <a href="https://local.uerm.edu.ph/irms-app/#/Login" target="_blank" 
                  style="display: block; width: fit-content; margin: 20px auto; 
                          padding: 20px 30px; background-color: #007BFF; 
                          color: white; text-decoration: none; border-radius: 5px;">
                  VISIT QUALITY ASSURANCE MODULE
                </a>
                `,
      email: divisionEmail,
      name: "ADMIN",
    };
    await util.sendEmail(emailContent);
  }
}

async function AreaSubjectCode(
  iRNo,
  subjectName,
  subjectSpecificExam,
  subjectDate,
  subjectTime,
  subjectLoc,
  fullName,
  uERMEmail,
) {
  if (uERMEmail) {
    const formattedDate = new Date(subjectDate)
      .toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "2-digit",
      })
      .toUpperCase();

    const formattedTime = new Date(subjectTime)
      .toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
      .toUpperCase();

    const emailContent = {
      subject: "INCIDENT REPORT",
      header: `INCIDENT REPORT DETAILS <br />`,
      content: `Dear <b>${fullName},</b><br><br>
                
                I would like to bring the Incident Report (IR) in the system to your attention.
                Please find the details of the incident below for your review and necessary action:
                <br><br> 

                <b>Incident Report Number:</b> ${iRNo}.<br>
                <b>Subject of the Incident:</b>  ${subjectName}${subjectSpecificExam ? ` - ${subjectSpecificExam}` : ""}<br> 
                <b>Date and Time:</b> ${formattedDate} & ${formattedTime}<br>
                <b>Location of the incident:</b> ${subjectLoc}
                <br><br>

                Kindly review the incident and address the concerns accordingly. Please use the button below to access the Primary Module:
                <a href="https://local.uerm.edu.ph/irms-app/#/Login" target="_blank" 
                  style="display: block; width: fit-content; margin: 20px auto; 
                          padding: 20px 30px; background-color: #007BFF; 
                          color: white; text-decoration: none; border-radius: 5px;">
                  VISIT QUALITY ASSURANCE MODULE
                </a>
                `,
      email: uERMEmail,
      name: "ADMIN",
    };
    await util.sendEmail(emailContent);
  }
}

module.exports = {
  UniqueSubjectCode,
  OtherSubjectCode,
  AreaSubjectCode,
};
