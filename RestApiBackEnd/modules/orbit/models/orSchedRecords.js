const util = require("../../../helpers/util");
const sqlHelper = require("../../../helpers/sql");

const selectTATDatas = async function (conditions, args, options, txn) {
  return await sqlHelper.query(
    `SELECT
      ${util.empty(options.top) ? "" : `TOP(${options.top})`}
     os.caseNo,
     tr.orSchedCode,
    os.patientNo,
    os.patientLastName,
    os.initialDate,
    os.initialTime,
    os.initialProcedure,
	os.dateTimeCreated,
    MAX(CASE WHEN tr.initialSchedStatus = 'Time Called' THEN tr.remarks END) AS pxCalled,
    MAX(CASE WHEN tr.initialSchedStatus = 'Fetched Patient' THEN tr.remarks END) AS fetchedPx,
    MAX(CASE WHEN tr.initialSchedStatus = 'Patient Arrived in OR' THEN tr.remarks END) AS pxArrivedOr,
    MAX(CASE WHEN tr.initialSchedStatus = 'Arrival of Surgical Team' THEN tr.remarks END) AS arrSurTeam,
    MAX(CASE WHEN tr.initialSchedStatus = 'Induction' THEN tr.remarks END) AS induction,
    MAX(CASE WHEN tr.initialSchedStatus = 'Start of Operation' THEN tr.remarks END) AS startOpe,
    MAX(CASE WHEN tr.initialSchedStatus = 'End of Operation' THEN tr.remarks END) AS endOpe,
    MAX(CASE WHEN tr.initialSchedStatus = 'Transfer to Pacu' THEN tr.remarks END) AS transPacu,
    MAX(CASE WHEN tr.initialSchedStatus = 'Terminal End' THEN tr.remarks END) AS terminal_end,
    MAX(CASE WHEN tr.initialSchedStatus = 'Time Discharge' THEN tr.remarks END) AS timeDis

FROM [UERMMMC].[dbo].[OrbitScheduling] os
LEFT JOIN [UERMMMC].[dbo].[OrbitTAT] tr
    ON tr.orSchedCode = os.code
   AND tr.fieldName = 'initialSchedStatus'
    WHERE 1=1 ${conditions}
    GROUP BY
    os.caseNo,
       tr.orSchedCode,
    os.patientNo,
    os.patientLastName,
    os.initialDate,
    os.initialTime,
	os.dateTimeCreated,
    os.initialProcedure
    ${util.empty(options.order) ? "" : `ORDER BY ${options.order}`}
    `,
    args,
    txn,
  );
};

const selectOrSchedLogs = async function (conditions, args, options, txn) {
  return await sqlHelper.query(
    `SELECT
      ${util.empty(options.top) ? "" : `TOP(${options.top})`}
[id]
      ,[code]
      ,[caseNo]
      ,[orSchedCode]
      ,[fieldName]
      ,[prevousColValue]
      ,[newColValue]
      ,[groupCode]
      ,[active]
      ,[dateTimeCreated]
      ,[createdBy]
       ,[remarks]
  FROM [UERMMMC].[dbo].[OrbitSchedLogs]
    WHERE 1=1 ${conditions}
    ${util.empty(options.order) ? "" : `ORDER BY ${options.order}`}
    `,
    args,
    txn,
  );
};
const selectOrbitTAT = async function (conditions, args, options, txn) {
  return await sqlHelper.query(
    `SELECT
      ${util.empty(options.top) ? "" : `TOP(${options.top})`}
[id]
      ,[code]
      ,[caseNo]
      ,[orSchedCode]
      ,[fieldName]
      ,[prevousColValue]
      ,[initialSchedStatus]
      ,[groupCode]
      ,[active]
      ,[dateTimeCreated]
      ,[createdBy]
       ,[remarks]
  FROM [UERMMMC].[dbo].[OrbitTAT]
    WHERE 1=1 ${conditions}
    ${util.empty(options.order) ? "" : `ORDER BY ${options.order}`}
    `,
    args,
    txn,
  );
};

const selectAdmittedPx = async function (conditions, args, options, txn) {
  return await sqlHelper.query(
    `SELECT
      ${util.empty(options.top) ? "" : `TOP(${options.top})`}
	cases.CASENO,
	cases.PATIENTNO,
	cases.DATEAD,
	cases.DATEDIS,
	cases.DISCHARGE,
	cases.ADMITTED_BY,
	cases.patienttype,
	cases.patient_category,
	cases.last_room,
  cases.ForORScheduled,
	px_info.LASTNAME,
	px_info.FIRSTNAME,
	px_info.MIDDLENAME,
	px_info.DBIRTH,
	px_info.SEX,
	px_info.AGE,
	px_info.PATIENTNO as pxNo,
	px_info.ADDRESS
FROM [UERMMMC].[dbo].[CASES] cases
JOIN [UERMMMC].[dbo].[PATIENTINFO] px_info ON cases.PATIENTNO = px_info.PATIENTNO
    WHERE 1=1 ${conditions}
    ${util.empty(options.order) ? "" : `ORDER BY ${options.order}`}
    `,
    args,
    txn,
  );
};

const selectInitialSchedule = async function (conditions, args, options, txn) {
  return await sqlHelper.query(
    `SELECT
      ${util.empty(options.top) ? "" : `TOP(${options.top})`}
        [id],
        [code],
        [caseNo],
       [patientNo],
        [initialSchedStatus],
        [remarks],
        [dateTimeCreated],
        [dateTimeUpdated],
        [updatedBy],
        [createdBy],
        [active],
        [initialDate],
        [initialTime],
        [isAdmitted],
        [patientFirstName],
        [patientLastName],
        [patientMiddleName]
             ,[initialProcedure]
              ,[isEmergencyCase]
                   ,[isLocked]
                     ,[lockedBy]
      ,[ORType]
           ,[slotStatus]
                 ,[room]
                     ,[progressLevel]
                      ,[isFinalized]
                      ,[isCancel]
                 
    FROM [UERMMMC].[dbo].[OrbitScheduling]
    WHERE 1=1 ${conditions}
    ${
      util.empty(options.order)
        ? ""
        : `ORDER BY 
        CASE 
      WHEN [isEmergencyCase] = 1 AND [initialSchedStatus] <> 'OR' THEN 0 
      ELSE 1 
    END,
            ${options.order},
            CASE 
              WHEN initialTime IS NULL 
                OR initialTime = '' 
     
              THEN 1 ELSE 0 
            END ASC,
            TRY_CONVERT(TIME, initialTime) ASC,
            CASE 
              WHEN initialTime IS NULL 
                OR initialTime = '' 
     
              THEN dateTimeCreated
            END DESC`
    }`,
    args,
    txn,
  );
};

const simpleFetchOrSched = async function (conditions, args, options, txn) {
  return await sqlHelper.query(
    `SELECT
      ${util.empty(options.top) ? "" : `TOP(${options.top})`}
        [id],
        [code],
        [caseNo],
            [patientNo],
        [initialSchedStatus],
        [remarks],
        [dateTimeCreated],
        [dateTimeUpdated],
        [updatedBy],
        [createdBy],
        [active],
        [initialDate],
        [initialTime],
        [isAdmitted],
        [patientFirstName],
        [patientLastName],
        [patientMiddleName]
             ,[initialProcedure]
              ,[isEmergencyCase]
                   ,[isLocked]
                       ,[lockedBy]
      ,[ORType]
           ,[slotStatus]
                ,[room]
                     ,[progressLevel]
                      ,[isFinalized]
                      ,[isCancel]
    FROM [UERMMMC].[dbo].[OrbitScheduling]
    WHERE 1=1 ${conditions}
    ${util.empty(options.order) ? "" : `ORDER BY ${options.order}`}`,
    args,
    txn,
  );
};

const insertInitialSchedule = async function (payload, txn) {
  return await sqlHelper.insert(
    "[UERMMMC].[dbo].[OrbitScheduling]",
    payload,
    txn,
  );
};

const insertSchedLogs = async function (payload, txn) {
  try {
    return await sqlHelper.insert(
      "[UERMMMC].[dbo].[OrbitSchedLogs]",
      payload,
      txn,
    );
  } catch (error) {
    return error;
  }
};
const insertTATLogs = async function (payload, txn) {
  try {
    return await sqlHelper.insert("[UERMMMC].[dbo].[OrbitTAT]", payload, txn);
  } catch (error) {
    return error;
  }
};
const updateTATLog = async function (payload, condition, txn) {
  try {
    return await sqlHelper.updateMany(
      "[UERMMMC].[dbo].[OrbitTAT]",
      payload,
      condition,
      txn,
    );
  } catch (error) {
    return error;
  }
};
const updateInitialSchedule = async function (payload, condition, txn) {
  try {
    return await sqlHelper.updateMany(
      "[UERMMMC].[dbo].[OrbitScheduling]",
      payload,
      condition,
      txn,
    );
  } catch (error) {
    return error;
  }
};

module.exports = {
  selectAdmittedPx,
  selectTATDatas,
  selectOrSchedLogs,
  selectOrbitTAT,
  insertInitialSchedule,
  insertSchedLogs,
  insertTATLogs,
  selectInitialSchedule,
  simpleFetchOrSched,
  updateInitialSchedule,
  updateTATLog,
};
