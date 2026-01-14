const util = require("../../../helpers/util.js");

/////////// ACTION ITEM  ////////////////

async function ActionPrimaryEmail(
  PrimaryEmail,
  PrimaryName,
  iRNo,
  subjectName,
  subjectSpecificExam,
  formattedDate,
  displayEmail,
  riskLabel,
) {
  if (PrimaryEmail) {
    const emailContent = {
      subject: "INCIDENT REPORT",
      header: `INCIDENT REPORT DETAILS <br>`,
      content: `
        Dear <b>${PrimaryName},</b><br><br>

        This is to inform you of an incident that occurred on <b>${formattedDate}</b>.
        It has been categorized as <b>${riskLabel}</b>, based on the assessed level of risk.
        The incident has been escalated for your review and further action.<br><br>

        <b>Incident Report Details:</b><br>
        <ul style="margin-left:20px; padding-left:20px;">
          <li><b>Incident Report Number:</b> ${iRNo}</li>
          <li><b>Subject of the Incident:</b> ${subjectName}${subjectSpecificExam ? ` - ${subjectSpecificExam}` : ""}</li>
        </ul>

        You are required to submit an <b>Action Item Report</b> to the <b>Quality Assurance In-Charge (QAIC).</b>
        Please use the button below to access the Primary Module: <br><br>

        <a href="http://10.107.0.30:9000/irms-app/#/Login" target="_blank" 
          style="display: block; width: fit-content; margin: 20px auto; 
                  padding: 20px 30px; background-color: #007BFF; 
                  color: white; text-decoration: none; border-radius: 5px;">
          VISIT PRIMARY MODULE
        </a>
        <br><br>

        Kindly ensure that all required actions are completely and accurately filled out. 
        For further assistance, please coordinate with the QAIC via email at <b>${displayEmail}</b><br>
      `,
      email: PrimaryEmail,
      name: PrimaryName,
    };
    await util.sendEmail(emailContent);
  }
}

async function ActionDirector(
  DirectorEmail,
  DirectorName,
  iRNo,
  subjectName,
  subjectSpecificExam,
  riskLabel,
) {
  if (DirectorEmail) {
    const emailContent = {
      subject: "INCIDENT REPORT",
      header: "INCIDENT REPORT UPDATE <br>",
      content: `
        Dear <b>${DirectorName},</b><br><br>

        As part of our ongoing commitment to maintaining the highest standards of quality and safety in our operations, 
        we would like to provide you with a comprehensive update regarding 
        <b>Incident Report No. ${iRNo}.</b> The incident has been categorized as <b>${riskLabel}</b>, 
        based on the assessed level of risk.<br><br>

        <b>Incident Report Details:</b><br>

        <ul style="margin-left:20px; padding-left:20px;">
          <li><b>Subject of the Incident:</b> ${subjectName}${subjectSpecificExam ? ` - ${subjectSpecificExam}` : ""}</li>
        </ul>

        For more information, please access the Director Module using the link below: <br><br>

        <a href="http://10.107.0.30:9000/irms-app/#/Login" target="_blank" 
          style="display: block; width: fit-content; margin: 20px auto; 
                  padding: 20px 30px; background-color: #007BFF; 
                  color: white; text-decoration: none; border-radius: 5px;">
          VISIT DIRECTOR MODULE
        </a>
        <br>
      `,
      email: DirectorEmail,
      name: DirectorName,
    };
    await util.sendEmail(emailContent);
  }
}

async function ActionSecondryEmail(
  secondaryDepartmentEmail,
  secondaryDepartmentName,
  iRNo,
  subjectName,
  subjectSpecificExam,
  subjectNote,
  subjectCause,
  subjectResponse,
  primaryDepartmentName,
  primaryDepartmentEmail,
  formattedDate,
  riskLabel,
) {
  if (secondaryDepartmentEmail) {
    const emailContent = {
      subject: "INCIDENT REPORT",
      header: "INCIDENT REPORT DETAILS <br>",
      content: `
        Dear <b>${secondaryDepartmentName},</b><br><br>

        This email is to inform you of an incident that occurred on <b>${formattedDate}</b>, which has been escalated for review and further action. 
        The incident has been categorized as <b>${riskLabel}</b>, based on the assessed level of risk.<br><br>

        <b>Incident Report Details:</b><br>

        <ul style="margin-left:20px; padding-left:20px;">
          <li><b>Incident Report Number:</b> ${iRNo}</li>
          <li><b>Subject of the Incident:</b> ${subjectName}${subjectSpecificExam ? ` - ${subjectSpecificExam}` : ""}</li>
          <li><b>Narrative Description of the Incident:</b><br>${subjectNote}</li>
          <li><b>Possible Causes of the Incident:</b><br>${subjectCause}</li>
          <li><b>Immediate Response:</b><br>${subjectResponse}</li>
        </ul>

        You are required to <b>collaborate with the Primary Department involved</b> to deliberate on the incident.<br><br>

        <b>Primary Department Details:</b><br>
        <ul style="margin-left:20px; padding-left:20px;">
          <li><b>Name of Department Involved:</b> ${primaryDepartmentName}</li>
          <li><b>Email of Department Involved:</b> ${primaryDepartmentEmail}</li>
        </ul>
      `,
      email: secondaryDepartmentEmail,
      name: secondaryDepartmentName,
    };
    await util.sendEmail(emailContent);
  }
}

////////////////////////////////////////////

async function sendDisapprovalActionEmail(
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
  if (pDEmail) {
    const emailContent = {
      subject: "DISAPPROVED ITEMS",
      header: `DISAPPROVED ACTION ITEM <br>`,
      content: `Dear <b>${pDName},</b><br><br>

      This is to inform you that after reviewing the submission related to <b>Incident Report No.${iRNo}</b>, 
      which occurred on <b>${formattedDate}</b>, certain items submitted have been <b>declined</b>.
      <br><br>

      The decision was made after careful evaluation of the details provided, 
      including the involvement of <b>${subjectName}${subjectSpecificExam ? ` - ${subjectSpecificExam}` : ""}</b> 
      and the assessed <b>Risk Level: ${riskLabel}</b>.These items require further clarification, correction, or revision before they can be accepted.
      <br><br>

      We kindly request the Primary Department to review the declined items and resubmit the necessary updates for consideration.<br><br>

      To view the declined details, please click the button below:

      <a href="http://10.107.0.30:9000/irms-app/#/Login" target="_blank" 
        style="display: block; width: fit-content; margin: 20px auto; 
        padding: 20px 30px; background-color: #007BFF; 
        color: white; text-decoration: none; border-radius: 5px;">
      VISIT PRIMARY MODULE
      </a>
      `,
      email: pDEmail,
      name: pDName,
    };
    await util.sendEmail(emailContent);
  }
}

async function sendApprovedActionEmail(
  iRNo,
  riskLabel,
  subjectName,
  subjectSpecificExam,
  newConclusion,
  pDName,
  pDEmail,
  qAName,
  qAEmail,
  formattedDate,
) {
  if (pDEmail) {
    const emailContent = {
      subject: "APPROVED ITEMS",
      header: `APPROVED ACTION ITEM <br>`,
      content: `Dear <b>${pDName},</b><br><br>

      This is to inform you that the <b>Action Item</b> related to <b>Incident Report No.${iRNo}</b> has been <b>approved</b>.
      <br><br>

      The incident, which occurred on <b>${formattedDate}</b>, involved <b>${subjectName}${subjectSpecificExam ? ` - ${subjectSpecificExam}` : ""}</b>
      and was categorized as <b>Risk Level: ${riskLabel}</b>. After careful review and evaluation, 
      the submitted action item has met the necessary requirements and is now considered <b>approved</b> for implementation.
      <br><br>

      <b>QA Remarks:</b>
      ${newConclusion}
      <br><br>

      You may view the approved details by clicking the button below:
      <a href="http://10.107.0.30:9000/irms-app/#/Login" target="_blank" 
        style="display: block; width: fit-content; margin: 20px auto; 
        padding: 20px 30px; background-color: #007BFF; 
        color: white; text-decoration: none; border-radius: 5px;">
      VISIT PRIMARY MODULE
      </a>
      `,
      email: pDEmail,
      name: pDName,
    };
    await util.sendEmail(emailContent);
  }
}

/////////// RCA  ////////////////

async function RCAPrimaryEmail(
  PrimaryEmail,
  PrimaryName,
  iRNo,
  subjectName,
  subjectSpecificExam,
  formattedDate,
  displayEmail,
  riskLabel,
) {
  if (PrimaryEmail) {
    const emailContent = {
      subject: "INCIDENT REPORT",
      header: "INCIDENT REPORT DETAILS <br>",
      content: `Dear <b>${PrimaryName},</b><br><br>

                This is to inform you of an incident that occurred on <b>${formattedDate}</b>.
                It has been categorized as <b>${riskLabel}</b>, based on the assessed level of risk.
                The incident has been escalated for your review and further action.<br><br>

                <b>Incident Report Details:</b><br>
                <ul style="margin-left:20px; padding-left:20px;">
                  <li><b>Incident Report Number:</b> ${iRNo}</li>
                  <li><b>Subject of the Incident:</b> ${subjectName}${subjectSpecificExam ? ` - ${subjectSpecificExam}` : ""}</li>
                </ul>

                You are required to submit an <b>Root Cause Analysis (RCA) Report</b> to the <b>Quality Assurance In-Charge (QAIC).</b>
                Please use the button below to access the Primary Module: <br><br>

                <a href="http://10.107.0.30:9000/irms-app/#/Login" target="_blank" 
                  style="display: block; width: fit-content; margin: 20px auto; 
                  padding: 20px 30px; background-color: #007BFF; 
                  color: white; text-decoration: none; border-radius: 5px;">
                  VISIT PRIMARY MODULE
                </a>
                <br><br>
                
                Kindly ensure all sections are thoroughly filled out, as this will greatly aid in identifying corrective actions and preventive measures moving forward.
                For further assistance, please coordinate with the QAIC via email at <b>${displayEmail}</b><br><br>
                `,
      email: PrimaryEmail,
      name: PrimaryName,
    };
    await util.sendEmail(emailContent);
  }
}

async function RCADirector(
  DirectorEmail,
  DirectorName,
  iRNo,
  subjectName,
  subjectSpecificExam,
  riskLabel,
) {
  if (DirectorEmail) {
    const emailContent = {
      subject: "INCIDENT REPORT",
      header: "INCIDENT REPORT UPDATE <br>",
      content: `
        Dear <b>${DirectorName},</b><br><br>

        As part of our ongoing commitment to maintaining the highest standards of quality and safety in our operations, 
        we would like to provide you with a comprehensive update regarding 
        <b>Incident Report No. ${iRNo}.</b> The incident has been categorized as <b>${riskLabel}</b>, 
        based on the assessed level of risk.<br><br>

        <b>Incident Report Details:</b><br>

        <ul style="margin-left:20px; padding-left:20px;">
          <li><b>Subject of the Incident:</b> ${subjectName}${subjectSpecificExam ? ` - ${subjectSpecificExam}` : ""}</li>
        </ul>

        For more information, please access the Director Module using the link below: <br><br>

        <a href="http://10.107.0.30:9000/irms-app/#/Login" target="_blank" 
          style="display: block; width: fit-content; margin: 20px auto; 
                  padding: 20px 30px; background-color: #007BFF; 
                  color: white; text-decoration: none; border-radius: 5px;">
          VISIT DIRECTOR MODULE
        </a>
        <br>
      `,
      email: DirectorEmail,
      name: DirectorName,
    };
    await util.sendEmail(emailContent);
  }
}

async function RCASecondryEmail(
  secondaryDepartmentEmail,
  secondaryDepartmentName,
  iRNo,
  subjectName,
  subjectSpecificExam,
  subjectNote,
  subjectCause,
  subjectResponse,
  primaryDepartmentName,
  primaryDepartmentEmail,
  formattedDate,
  riskLabel,
) {
  if (secondaryDepartmentEmail) {
    const emailContent = {
      subject: "INCIDENT REPORT",
      header: "INCIDENT REPORT DETAILS <br>",
      content: `
        Dear <b>${secondaryDepartmentName},</b><br><br>

        This email is to inform you of an incident that occurred on <b>${formattedDate}</b>, which has been escalated for review and further action. 
        The incident has been categorized as <b>${riskLabel}</b>, based on the assessed level of risk.<br><br>

        <b>Incident Report Details:</b><br>

        <ul style="margin-left:20px; padding-left:20px;">
          <li><b>Incident Report Number:</b> ${iRNo}</li>
          <li><b>Subject of the Incident:</b> ${subjectName}${subjectSpecificExam ? ` - ${subjectSpecificExam}` : ""}</li>
          <li><b>Narrative Description of the Incident:</b><br>${subjectNote}</li>
          <li><b>Possible Causes of the Incident:</b><br>${subjectCause}</li>
          <li><b>Immediate Response:</b><br>${subjectResponse}</li>
        </ul>

        You are required to <b>collaborate with the Primary Department involved</b> to deliberate on the incident.<br><br>

        <b>Primary Department Details:</b><br>
        <ul style="margin-left:20px; padding-left:20px;">
          <li><b>Name of Department Involved:</b> ${primaryDepartmentName}</li>
          <li><b>Email of Department Involved:</b> ${primaryDepartmentEmail}</li>
        </ul>
        <br>
      `,
      email: secondaryDepartmentEmail,
      name: secondaryDepartmentName,
    };
    await util.sendEmail(emailContent);
  }
}

////////////////////////////////////////////

async function sendDisapprovalRCAEmail(
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
  if (pDEmail) {
    const emailContent = {
      subject: "DISAPPROVED RCA",
      header: `DISAPPROVED ROOT CAUSE ANALYSIS <br>`,
      content: `Dear <b>${pDName},</b><br><br>

      This is to inform you that after reviewing the submitted <b>Root Cause Analysis (RCA)</b> related to 
      <b>Incident Report No. ${iRNo}</b>, which occurred on <b>${formattedDate}</b>, 
      the RCA has been <b>disapproved</b>.
      <br><br>

      The decision was made after careful evaluation of the details provided, 
      including the involvement of <b>${subjectName}${subjectSpecificExam ? ` - ${subjectSpecificExam}` : ""}</b> 
      and the assessed <b>Risk Level: ${riskLabel}</b>. The RCA requires further clarification, correction, or revision before it can be accepted.
      <br><br>

      We kindly request the Primary Department to review the disapproved RCA and resubmit the necessary updates for reconsideration.
      <br><br>

      To view the disapproved details, please click the button below:

      <a href="http://10.107.0.30:9000/irms-app/#/Login" target="_blank" 
        style="display: block; width: fit-content; margin: 20px auto; 
        padding: 20px 30px; background-color: #007BFF; 
        color: white; text-decoration: none; border-radius: 5px;">
        VISIT PRIMARY MODULE
      </a>

      `,
      email: pDEmail,
      name: pDName,
    };
    await util.sendEmail(emailContent);
  }
}

async function sendApprovedRCAEmail(
  iRNo,
  riskLabel,
  subjectName,
  subjectSpecificExam,
  newConclusion,
  pDName,
  pDEmail,
  qAName,
  qAEmail,
  formattedDate,
) {
  if (pDEmail) {
    const emailContent = {
      subject: "APPROVED RCA",
      header: `APPROVED ROOT CAUSE ANALYSIS ITEMS <br>`,
      content: `Dear <b>${pDName},</b><br><br>

        This is to inform you that the <b>Root Cause Analysis (RCA)</b> related to 
        <b>Incident Report No. ${iRNo}</b> has been <b>approved</b>.
        <br><br>

        The incident, which occurred on <b>${formattedDate}</b>, involved 
        <b>${subjectName}${subjectSpecificExam ? ` - ${subjectSpecificExam}` : ""}</b> 
        and was categorized as <b>Risk Level: ${riskLabel}</b>. After thorough review and evaluation, 
        the submitted RCA has met the necessary requirements and is now considered <b>approved</b>.
        <br><br>

        <b>QA Remarks:</b><br>
        ${newConclusion}
        <br><br>

        You may view the approved RCA details by clicking the button below:
        <a href="http://10.107.0.30:9000/irms-app/#/Login" target="_blank" 
          style="display: block; width: fit-content; margin: 20px auto; 
          padding: 20px 30px; background-color: #007BFF; 
          color: white; text-decoration: none; border-radius: 5px;">
          VISIT PRIMARY MODULE
        </a>
      `,
      email: pDEmail,
      name: pDName,
    };
    await util.sendEmail(emailContent);
  }
}

// async function sendingPendingEmail(
//   iRNo,
//   subjectName,
//   subjectSpecificExam,
//   primaryName,
//   primaryEmail,
// ) {
//   if (primaryEmail) {
//     const emailContent = {
//       subject: "⚠️ Pending Incident Report Notification",
//       header: `PENDING ROOT CAUSE ANALYSIS (RCA) DETAILS <br>`,
//       content: `Dear <b>${primaryName},</b><br><br>

//       This is to remind you that an <b>Incident Report</b> (IR No. ${iRNo}), involving
//       <b>${subjectName}${subjectSpecificExam ? ` - ${subjectSpecificExam}` : ""}</b>,
//       assigned to your department, is still awaiting the submission of its
//       <b>Root Cause Analysis (RCA)</b>.

// <div style="
//   background-color:#fdecea;
//   color:#d93025;
//   border:1px solid #f5c6cb;
//   padding:12px 16px;
//   border-radius:4px;
//   font-family:Arial, sans-serif;
//   display:flex;
//   align-items:center;
//   gap:8px;">
//   <span style="font-weight:bold; font-size:18px;">⚠️</span>
//   <span>We've detected a pending Incident Report that requires your immediate attention.</span>
// </div>
//       <br><br>

//       Kindly review and submit the required details at the earliest possible time
//       to avoid further delays in the resolution process.<br><br>

//       You may clicking the button below:<br><br>
//       <a href="http://10.107.0.30:9000/#/Login" target="_blank"
//         style="display: block; width: fit-content; margin: 20px auto;
//         padding: 14px 24px; background-color: #d93025;
//         color: white; font-weight:bold; text-decoration: none; border-radius: 6px;">
//         UPDATE RCA NOW
//       </a>
//     `,
//       email: "john.brian.palacio@gmail.com",
//       name: "JOHN BRIAN",
//     };
//     await util.sendEmail(emailContent);
//   }
// }

module.exports = {
  ActionPrimaryEmail,
  ActionDirector,
  ActionSecondryEmail,
  RCAPrimaryEmail,
  RCADirector,
  RCASecondryEmail,
  sendDisapprovalActionEmail,
  sendApprovedActionEmail,
  sendDisapprovalRCAEmail,
  sendApprovedRCAEmail,
  // sendingPendingEmail,
};
