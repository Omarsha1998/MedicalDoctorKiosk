const sql = require("../../../helpers/sql.js");
const util = require("../../../helpers/util.js");
const model = require("../models/assitantQAModel.js");

const FormAssistantQASub = async (req, res) => {
  try {
    const result = await model.getAllAssistantQA();
    return res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ msg: `Error: ${error.message}` });
  }
};

const FormDisAQA = async (req, res) => {
  try {
    const IRNo = req.query.iRNo;
    const result = await model.getIREPORT(IRNo);
    if (result.length > 0) {
      result.forEach((list) => {
        if (list.subjectFile !== null) {
          list.subjectFile = Buffer.from(list.subjectFile).toString("base64");
        }
      });
    }
    return res.status(200).json(result[0]);
  } catch (error) {
    res.status(500).json({ message: "ERROR" });
  }
};

const FormDisSubject = async (req, res) => {
  try {
    const result = await model.getSubjectName();
    return res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ msg: `Error` });
  }
};

const FormDisDivision = async (req, res) => {
  try {
    const result = await model.getDivisionName();
    return res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ msg: `Error` });
  }
};

const FormUpdateDivCode = async (req, res) => {
  try {
    const iRNo = req.body.IRNo;
    const divisionSubCode = req.body.DivisionSubCode;

    const updateDivisionSub = await sql.transact(async (txn) => {
      return await model.UpdateDivisionCode(
        {
          IRNo: iRNo,
          TransferDivisionCode: divisionSubCode,
        },
        { IRNo: iRNo },
        txn,
      );
    });

    if (!updateDivisionSub) {
      return res
        .status(500)
        .json({ message: "Incident report updating division failed" });
    }

    const displayUpdatedDivision = await model.getTransferDivisionQA(iRNo);
    const recordsUpdatedDivision = displayUpdatedDivision;
    if (recordsUpdatedDivision && recordsUpdatedDivision.length > 0) {
      const {
        iRNo,
        subjectBriefDes,
        qANameOwner,
        qAEmailOwner,
        qAANameOwner,
        qAAEmailOwner,
        transferQAName,
        transferQAEmail,
        transferQAAName,
        transferQAAEmail,
      } = recordsUpdatedDivision[0];

      if (transferQAName) {
        const emailContent = {
          subject: "INCIDENT REPORT",
          header: `INCIDENT REPORT DETAILS<br />`,
          content: `Good Day!<br>
                            Dear <b>${transferQAName},</b><br><br>
                            I am writing to formally transfer the incident report that requires your attention.
                            After conducting a preliminary review, it has been determined that your expertise 
                            and oversight are required to further investigate and address this matter.
                            <br><br>
                            
                            <b>Incident Report Details:</b><br>
                            <b>Incident Report Number:</b> ${iRNo}.
                            <br>
                            <b>Brief Description of the incident:</b> ${subjectBriefDes}
                            <br><br>

                            Thank you for your prompt attention to this matter.<br><br>
                            <b>${transferQAEmail}</b><br><br>

                            <b>Transferred by:</b><br>
                            <b>QAIC NAME:</b>${qANameOwner}<br>
                            <b>QAIC EMAIL:</b>${qAEmailOwner}
                            `,
          email: "jppalacio@uerm.edu.ph",
          name: "JOHN BRIAN",
        };
        await util.sendEmail(emailContent);
      }

      if (transferQAAName) {
        const emailContent = {
          subject: "INCIDENT REPORT",
          header: `INCIDENT REPORT DETAILS<br />`,
          content: `Good Day!<br>
                            Dear <b>${transferQAAName},</b><br><br>
                            I am writing to formally transfer the incident report that requires your attention.
                            After conducting a preliminary review, it has been determined that your expertise 
                            and oversight are required to further investigate and address this matter.
                            <br><br>
                            
                            <b>Incident Report Details:</b><br>
                            <b>Incident Report Number:</b> ${iRNo}.
                            <br>
                            <b>Brief Description of the incident:</b> ${subjectBriefDes}
                            <br><br>

                            Thank you for your prompt attention to this matter.<br>
                            <b>${transferQAAEmail}</b><br><br>

                            <b>Transferred by:</b><br>
                            <b>QAA NAME:</b>${qAANameOwner}<br>
                            <b>QAA EMAIL:</b>${qAAEmailOwner}<br>
                            `,
          email: "jppalacio@uerm.edu.ph",
          name: "JOHN BRIAN",
        };
        await util.sendEmail(emailContent);
      }
    } else {
      res
        .status(404)
        .json({ message: "No records found to update or send email." });
      return;
    }
    return res.status(200).json(displayUpdatedDivision);
  } catch (error) {
    res.status(500).json({ msg: `Error: ${error.message}` });
  }
};

const FormUpdateSubCode = async (req, res) => {
  try {
    const emUpdSubCode = req.user.EmployeeCode;
    const iRNo = req.body.IRNo;
    const subjectCode = req.body.SubjectCode;

    const updateSubjectCode = await sql.transact(async (txn) => {
      const result = await model.UpdateSubjectCode(
        {
          IRNo: iRNo,
          SubjectCode: subjectCode,
          EmUpdSubCode: emUpdSubCode,
          DateTimeCreated: new Date(),
        },
        { IRNo: iRNo },
        txn,
      );
      return result;
    });

    if (!updateSubjectCode) {
      return res
        .status(500)
        .json({ message: "Incident report updating subject code failed" });
    }

    const displayUpdateSubjectCode = await model.getTransferSubjectCode(iRNo);
    const recordsUpdateSubjectCode = displayUpdateSubjectCode;
    if (recordsUpdateSubjectCode && recordsUpdateSubjectCode.length > 0) {
      const {
        iRNo,
        subjectName,
        qANAME,
        transferName,
        qAEMAIL,
        transferEmail,
      } = recordsUpdateSubjectCode[0];
      const emailContent = {
        subject: "INCIDENT REPORT",
        header: `INCIDENT REPORT DETAILS<br />`,
        content: `Good day!<br>
                  Mr./Ms. <b>${qANAME}</b>,<br>
                  <b>${qAEMAIL}</b><br>
                  I hope everything is going smoothly for you. I wanted to bring to your attention the following incident report for your review.<br><br>
                  
                  <b>Incident Report Details:</b><br>
                  Incident Report Number: <b>${iRNo}</b><br>
                  We have received an incident report regarding: <b>${subjectName}</b><br><br>
                  
                  Please review the incident details and address the concerns accordingly. If you have any further questions, don't hesitate to notify me:<br>
                  Name: <b>${transferName}</b><br/>
                  Email: <b>${transferEmail}</b><br/><br/>
                  Thank you for your prompt attention to this matter.<br>
                  `,
        email: "jppalacio@uerm.edu.ph",
        name: "JOHN BRIAN",
      };
      await util.sendEmail(emailContent);
    } else {
      res
        .status(404)
        .json({ message: "No records found to update or send email." });
      return;
    }
    res.status(200).json(updateSubjectCode);
  } catch (error) {
    res.status(500).json({ msg: `Error: ${error.message}` });
  }
};

module.exports = {
  FormAssistantQASub,
  FormDisAQA,
  FormDisSubject,
  FormDisDivision,
  FormUpdateDivCode,
  FormUpdateSubCode,
};
