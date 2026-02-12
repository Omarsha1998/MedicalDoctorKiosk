const util = require("../../../helpers/util.js");

/////////// ACTION ITEM  ////////////////

async function NotifyActionItemVL(
  iRNo,
  riskLabel,
  subjectName,
  subjectSpecificExam,
  pDName,
  pDEmail,
  qAName,
  qAEmail,
  formattedDate,
) {
  if (qAEmail) {
    const emailContent = {
      subject: "ACTION ITEM SUBMITTED",
      header: `ACTION ITEM SUBMITTED<br>`,
      content: `Dear <b>${qAName},</b><br><br>

                This is to inform you that an <b>Action Item</b> has been submitted regarding the incident that occurred on <b>${formattedDate}</b>.
                The report has been recorded under <b>Incident Report No. ${iRNo}</b>, involving <b>${subjectName}${subjectSpecificExam ? ` - ${subjectSpecificExam}` : ""}</b>, 
                and has been categorized as <b>${riskLabel}</b>.<br><br>

                The necessary actions have already been initiated, and we kindly request you 
                to review the details that have been provided for your confirmation and further guidance.
                <br><br>
                
                Please take a moment to check the report by clicking the button below:

                <a href="https://local.uerm.edu.ph/irms-app/#/Login" target="_blank" 
                  style="display: block; width: fit-content; margin: 20px auto; 
                          padding: 20px 30px; background-color: #007BFF; 
                          color: white; text-decoration: none; border-radius: 5px;">
                  VISIT QUALITY ASSURANCE MODULE
                </a>
              `,
      email: qAEmail,
      name: qAName,
    };
    await util.sendEmail(emailContent);
  }
}

async function sendReturnActionEmail(
  iRNo,
  riskLabel,
  subjectName,
  subjectSpecificExam,
  pDName,
  pDEmail,
  qAName,
  qAEmail,
  formattedDate,
) {
  if (qAEmail) {
    const emailContent = {
      subject: "DISAPPROVED RETURN ACTION",
      header: `DISAPPROVED RETURN ACTION ITEM<br>`,
      content: `Dear <b>${qAName},</b><br><br>

                In response to your recent feedback regarding <b>Incident Report No. ${iRNo}</b>, 
                I would like to inform you that the previously <b>declined action items</b>
                have been <b>reviewed, updated, and resubmitted</b> for your consideration.
                <br><br>

                The incident, which occurred on <b>${formattedDate}</b>, 
                involved <b>${subjectName}${subjectSpecificExam ? ` - ${subjectSpecificExam}` : ""}</b> 
                and has been categorized as <b>${riskLabel}</b>. 
                The necessary revisions were made based on your evaluation, 
                and the corrected items are now available for your review.
                <br><br>

                You may view the resubmitted details by clicking the button below:

                <a href="https://local.uerm.edu.ph/irms-app/#/Login" target="_blank" 
                  style="display: block; width: fit-content; margin: 20px auto; 
                  padding: 20px 30px; background-color: #007BFF; 
                  color: white; text-decoration: none; border-radius: 5px;">
                  VISIT QUALITY ASSURANCE MODULE
                </a>

              `,
      email: qAEmail,
      name: qAName,
    };
    await util.sendEmail(emailContent);
  }
}

/////////// RCA  ////////////////

async function NotifyRCAItem(
  iRNo,
  riskLabel,
  subjectName,
  subjectSpecificExam,
  pDName,
  pDEmail,
  qAName,
  qAEmail,
  formattedDate,
) {
  if (qAEmail) {
    const emailContent = {
      subject: "ROOT CAUSE ANALYSIS SUBMITTED",
      header: `ROOT CAUSE ANALYSIS SUBMITTED<br>`,
      content: `Dear <b>${qAName},</b><br><br>

            This is to inform you that a <b>Root Cause Analysis (RCA)</b> has been submitted regarding the incident that occurred on <b>${formattedDate}</b>.
            The analysis has been recorded under <b>Incident Report No. ${iRNo}</b>, involving <b>${subjectName}${subjectSpecificExam ? ` - ${subjectSpecificExam}` : ""}</b>, 
            and has been categorized as <b>${riskLabel}</b>.<br><br>

            The RCA provides detailed findings and contributing factors related to the incident. 
            We kindly request you to review the submitted analysis for validation, feedback, and further action if necessary.
            <br><br>
            
            Please take a moment to check the RCA details by clicking the button below:

            <a href="https://local.uerm.edu.ph/irms-app/#/Login" target="_blank" 
              style="display: block; width: fit-content; margin: 20px auto; 
                      padding: 20px 30px; background-color: #007BFF; 
                      color: white; text-decoration: none; border-radius: 5px;">
              VISIT QUALITY ASSURANCE MODULE
            </a>
          `,
      email: qAEmail,
      name: qAName,
    };
    await util.sendEmail(emailContent);
  }
}

async function sendReturnRCAEmail(
  iRNo,
  riskLabel,
  subjectName,
  subjectSpecificExam,
  pDName,
  pDEmail,
  qAName,
  qAEmail,
  formattedDate,
) {
  if (qAEmail) {
    const emailContent = {
      subject: "RESUBMISSION OF DISAPPROVED RCA",
      header: `RESUBMISSION OF DISAPPROVED ROOT CAUSE ANALYSIS<br>`,
      content: `Dear <b>${qAName},</b><br><br>

            In response to your recent feedback regarding <b>Incident Report No. ${iRNo}</b>, 
            I would like to inform you that the previously <b>disapproved Root Cause Analysis (RCA)</b>
            has been <b>reviewed, updated, and resubmitted</b> for your consideration.
            <br><br>

            The incident, which occurred on <b>${formattedDate}</b>, 
            involved <b>${subjectName}${subjectSpecificExam ? ` - ${subjectSpecificExam}` : ""}</b> 
            and has been categorized as <b>${riskLabel}</b>. 
            The necessary revisions were made based on your evaluation, 
            and the corrected RCA is now available for your review.
            <br><br>

            You may view the resubmitted RCA details by clicking the button below:

            <a href="https://local.uerm.edu.ph/irms-app/#/Login" target="_blank" 
              style="display: block; width: fit-content; margin: 20px auto; 
              padding: 20px 30px; background-color: #007BFF; 
              color: white; text-decoration: none; border-radius: 5px;">
              VISIT QUALITY ASSURANCE MODULE
            </a>
          `,
      email: qAEmail,
      name: qAName,
    };
    await util.sendEmail(emailContent);
  }
}

module.exports = {
  NotifyActionItemVL,
  sendReturnActionEmail,
  NotifyRCAItem,
  sendReturnRCAEmail,
};
