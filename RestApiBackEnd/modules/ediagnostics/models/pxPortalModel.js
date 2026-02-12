/* eslint-disable no-console */
const util = require("../../../helpers/util");
const sqlHelper = require("../../../helpers/sql");

const selectPatientResultValueFiles = async function (
  conditions,
  args,
  options,
  txn,
) {
  try {
    const results = await sqlHelper.query(
      `select 
        ${util.empty(options.top) ? "" : `TOP(${options.top})`}
        patientResultValueId,
        patientResultId,
        fileName,
        fileType,
        fileSize,
        fileValue,
        active,
        createdBy,
        updatedBy,
        dateTimeCreated,
        dateTimeUpdated,
        remarks
      from
        UERMResults..PatientResultValueFiles
      where 1=1 ${conditions}
      ${util.empty(options.order) ? "" : `order by ${options.order}`}`,
      args,
      txn,
    );

    return results;
  } catch (error) {
    console.log(error);
    return error;
  }
};

const selectUERMEmployee = async function (conditions, args, options, txn) {
  try {
    const employees = await sqlHelper.query(
      `SELECT
      ${util.empty(options.top) ? "" : `TOP(${options.top})`}
      code,
      name,
      pos_desc posDesc,
	    dept_desc deptDesc
    from [UE Database]..vw_Employees
    WHERE 1=1 ${conditions}
    ${util.empty(options.order) ? "" : `order by ${options.order}`}
    `,
      args,
      txn,
    );

    if (employees.length > 0) {
      return employees[0];
    }

    return employees;
  } catch (error) {
    console.log(error);
    return error;
  }
};

const selectDoctors = async function (conditions, args, options, txn) {
  try {
    const doctors = await sqlHelper.query(
      `SELECT
      ${util.empty(options.top) ? "" : `TOP(${options.top})`}
      code id,
      ehr_code code,
      name,
      concat([LAST NAME], ', ', [FIRST NAME], ' ', [MIDDLE NAME], CASE
        WHEN [EXT NAME] IS NOT NULL AND [EXT NAME] <> '' THEN ', ' + [EXT NAME]
        ELSE ''
      END, CASE
        WHEN suffix IS NOT NULL AND suffix <> '' THEN ', ' + suffix
        ELSE ''
      END) fullName,
      CONCAT(
          [FIRST NAME],
          CASE
            WHEN [MIDDLE NAME] IS NOT NULL AND [MIDDLE NAME] <> '' THEN ' ' + LEFT([MIDDLE NAME], 1) + '.'
            ELSE ''
          END,
          ' ', [LAST NAME],
          CASE
            WHEN [EXT NAME] IS NOT NULL AND [EXT NAME] <> '' THEN ', ' + [EXT NAME]
            ELSE ''
          END, CASE
        WHEN suffix IS NOT NULL AND suffix <> '' THEN ', ' + suffix
        ELSE ''
      END
        ) AS alternativeFullName,
      [FIRST NAME] firstName,
      [MIDDLE NAME] middleName,
      [LAST NAME] lastName,
      [EXT NAME] extensionName,
      suffix,
      [AREA OF SPECIALTY] specialization,
      department,
      phic,
      tin,
      lic,
      contactnos,
      clinicalDepartment,
      [PHIC EXP DATE] phicExpirationDate,
      [LIC EXP DATE] licenseExpirationDate,
      ancillaryDepartment,
      ancillaryDesignation,
      ancillaryEmail,
      ancillaryContactNumber,
      ancillaryTests
    from UERMMMC..Doctors
    WHERE 1=1 ${conditions}
    ${util.empty(options.order) ? "" : `order by ${options.order}`}
    `,
      args,
      txn,
    );

    return doctors;
  } catch (error) {
    console.log(error);
    return error;
  }
};

const selectTestComponents = async function (
  joinCondition,
  conditions,
  args,
  options,
  txn,
) {
  try {
    const testComponents = await sqlHelper.query(
      `select
        ${util.empty(options.top) ? "" : `TOP(${options.top})`}
        a.code testCode,
        a.name,
        a.departmentCode,
        a.component,
        a.alternativeTestName,
        a.resultComponent,
        b.code testComponentCode,
        b.name testComponentName,
        b.sequence,
        b.groupTitle,
        b.inputType,
        e.value,
        b.versionSetId,
        b.options,
        b.required,
        b.allowPrintout,
        b.onlineResults,
        b.showName,
        c.headerHtml,
        c.contentHtml,
        c.footerHtml,
        d.id referenceRangeId,
        d.ageMinDays,
        d.ageMaxDays,
        d.normalMin,
        d.normalMax,
        d.unit,
        b.active,
        b.dateTimeCreated,
        b.dateTimeUpdated
      from
        UERMResults..Tests a
        join UERMResults..TestComponents b on b.TestCode = a.Code
        left join UERMResults..TestTemplates c on c.TestCode = a.code and c.active = 1
        left join UERMResults..TestComponentReferenceRanges d on d.TestComponentId = b.id
        left join UERMResults..PatientResultValues e on e.TestComponentCode = b.code
        left join UERMResults..PatientResults f on f.id = e.patientResultId
        ${joinCondition}
      where 1=1 ${conditions}
      ${util.empty(options.order) ? "" : `order by ${options.order}`}`,
      args,
      txn,
    );

    return testComponents;
  } catch (error) {
    console.log(error);
    return error;
  }
};

const selectPatients = async function (conditions, args, options, txn) {
  try {
    const testComponents = await sqlHelper.query(
      `select
        ${util.empty(options.top) ? "" : `TOP(${options.top})`}
        patientNo code,
        lastName,
        firstName,
        middleName,
        suffix,
        address,
        dbirth birthDate,
        sex
      FROM UERMMMC..PatientInfo
      where 1=1 ${conditions}
      ${util.empty(options.order) ? "" : `order by ${options.order}`}`,
      args,
      txn,
    );

    return testComponents;
  } catch (error) {
    console.log(error);
    return error;
  }
};

// const selectPatientResults = async function (conditions, args, options, txn) {
//   try {
//     const results = await sqlHelper.query(
//       `select
//         ${util.empty(options.top) ? "" : `TOP(${options.top})`}
//         a.id,
//         b.id patientResultValueId,
//         a.verifierId,
//         a.validatorId,
//         a.consultantId,
//         a.completionRemarks,
//         b.patientResultId,
//         b.testComponentCode,
//         b.value,
//         b.flag,
//         b.normalMin,
//         b.normalMax,
//         c.id fileId,
//         c.fileName,
//         c.fileType,
//         c.fileSize,
//         b.createdBy,
//         b.updatedBy,
//         b.dateTimeCreated,
//         b.dateTimeUpdated,
//         b.remarks
//       from
//         UERMResults..PatientResults a
//         left join UERMResults..PatientResultValues b on b.patientResultId = a.Id
//         left join UERMResults..PatientResultValueFiles c on c.patientResultValueId = b.id
//       where 1=1 ${conditions}
//       ${util.empty(options.order) ? "" : `order by ${options.order}`}`,
//       args,
//       txn,
//     );

//     // console.log(results);

//     if (results.length > 0) {
//       for (const list of results) {
//         if (!util.empty(list.fileValue)) {
//           list.fileValue = Buffer.from(list.fileValue).toString("base64");
//         }
//       }
//     }

//     return results;
//   } catch (error) {
//     console.log(error);
//     return error;
//   }
// };

// const selectTestOrders = async function (conditions, args, options, txn) {
//   try {
//     const charges = await sqlHelper.query(
//       `select
//       ${util.empty(options.top) ? "" : `TOP(${options.top})`}
// 	    c.caseNo,
//       c.patientNo,
//       c.fullName,
//       c.firstName,
//       c.lastName,
//       c.middleName,
//       c.gender,
//       c.birthdate,
//       cm.chargeslipNo,
//       cd.charge_id chargeId,
//       tm.testCode,
//       t.name testName,
//       t.alternativeTestName,
//       t.departmentCode deptCode,
//       (select name from UERMResults..Departments where code = t.departmentCode and active = 1) departmentName,
//       t.component,
//       c.chiefComplaint,
//       c.patientType,
//       c.dateTimeAdmitted,
//       -- cm.dr_code requestingPhysicianId,
// 	    (select ehr_code from UERMMMC..Doctors where code = cm.dr_code) requestingPhysicianId,
//       ward = CASE WHEN c.caseDepartment = 'ER' THEN CASE WHEN c.hostname LIKE '%COVID%' THEN 'ER' ELSE 'ER' END WHEN c.patientType = 'OPD' THEN CASE WHEN c.caseDepartment = 'OPDCHA' THEN 'OPD-CHARITY' ELSE 'OPD' END ELSE (
//         SELECT
//           ISNULL(B.[DESCRIPTION], 'N/A')
//         FROM
//           UERMMMC..SECTIONS B WITH(NOLOCK)
//         WHERE
//           B.CODE = r.UNIT
//       ) END,
//       wardCode = CASE WHEN c.patientType = 'OPD' THEN 'OPD' WHEN c.caseDepartment = 'ER' THEN CASE WHEN c.hostname LIKE '%COVID%' THEN 'ER' ELSE 'ER' END ELSE r.unit END,
//       room = CASE WHEN c.caseDepartment = 'ER' THEN CASE WHEN c.hostname LIKE '%COVID%' THEN 'ER' ELSE 'ER' END WHEN c.patientType = 'OPD' THEN CASE WHEN c.caseDepartment = 'OPDCHA' THEN 'OPD-CHARITY' ELSE 'OPD' END ELSE c.lastRoom END,
//       cm.chargeDateTime dateTimeCharged,
//       cd.description chargedProcedure,
//       t0.code testOrderCode,
//       t0.createdBy transferredBy,
//       t0.scheduledBy,
//       t0.releasedby,
//       t0.resultComponent,
//       t.resultComponent resultComponentTemplate,
//       t0w.status testOrderWorkFlowStatus,
//       t0w.isProxy,
//       t0w.consultantId,
//       t0w.residents,
//       t0w.dateTimeCreated testOrderWorkFlowDateTimeCreated,
//       t0w.dateTimeUpdated testOrderWorkFlowDateTimeUpdated,
//       t0w.updatedBy testOrderWorkFlowProcessedBy,
//       twfs.stepNumber,
//       twfs.accessRoleModule,
//       twfs.isFinalStep,
//       twfs.withVerifier,
//       twfs.withValidator,
//       twfs.withConsultant,
//       twfs.withResidents,
//       twfs.allowEdit,
//       twfs.patientAssignment,
//       twfs.sendSMSConsultant,
//       twfs.sendEmailConsultant,
//       twfs.sendSMSResidents,
//       twfs.sendEmailResidents,
//       v.id versionSetId,
//       case when t0.status is null then 'PENDING' else t0.status end status,
//       t0.dateTimeCreated dateTimeTransferred,
//       t0.dateTimeScheduled,
//       t0.dateTimeReleased,
//       t0.transferRemarks,
//       case when (select count(tw.id) counter from UERMResults..TestOrderWorkFlows tw
//         join UERMResults..TestWorkFlowSteps twf1 on twf1.id = tw.stepId
//         where testOrderCode = t0.code
//         and twf1.accessRoleModule = 'Module - Residents' and tw.status = 'completed') > 0
//         then cast (1 as bit)
//         else cast(0 as bit)
//       end initiallyRead
//     from
//       UERMMMC..vw_EncounterCases c
//       join UERMMMC..Charges_Main cm on c.caseNo = cm.caseNo
//       and CANCELED = 'N'
//       join UERMMMC..Charges_Details cd on cm.chargeslipNo = cd.chargeslipNo
//       join UERMResults..TestMappings tm on cd.charge_id = tm.ChargeId and tm.active = 1
//       join UERMResults..Tests t on tm.TestCode = t.Code
//       left join UERMResults..VersionSets v on v.TestCode = t.Code
//       and v.active = 1
//       left join UERMMMC..rooms r on r.ROOMNO = c.lastRoom
//       left join UERMResults..TestOrders t0 on cm.chargeSlipNo = t0.chargeSlipNo
//       and t0.chargeId = cd.CHARGE_ID
//       left join UERMResults..TestOrderWorkFlows t0w on t0w.TestOrderCode = t0.code and t0w.active = 1
//       left join UERMResults..TestWorkFlowSteps twfs on twfs.Id = t0w.StepId and twfs.active = 1
//     where
//       1 = 1 ${conditions}
//     ${util.empty(options.order) ? "" : `order by ${options.order}`}`,
//       args,
//       txn,
//     );
//     if (charges.length > 0) {
//       for (const list of charges) {
//         list.birthdate = util.formatDate2({
//           date: list.birthdate,
//           dateOnly: true,
//         });

//         list.dateTimeCharged = util.formatDate2({ date: list.dateTimeCharged });
//         list.dateTimeAdmitted = util.formatDate2({
//           date: list.dateTimeAdmitted,
//         });

//         if (!util.empty(list.dateTimeTransferred)) {
//           list.dateTimeTransferred = util.formatDate2({
//             date: list.dateTimeTransferred,
//           });
//         }

//         if (!util.empty(list.dateTimeScheduled)) {
//           list.dateTimeScheduled = util.formatDate2({
//             date: list.dateTimeScheduled,
//           });
//         }

//         if (!util.empty(list.testOrderWorkFlowDateTimeUpdated)) {
//           list.testOrderWorkFlowDateTimeUpdated = util.formatDate2({
//             date: list.testOrderWorkFlowDateTimeUpdated,
//           });
//         }

//         if (!util.empty(list.testOrderWorkFlowDateTimeCreated)) {
//           list.testOrderWorkFlowDateTimeCreated = util.formatDate2({
//             date: list.testOrderWorkFlowDateTimeCreated,
//           });
//         }

//         if (!util.empty(list.dateTimeReleased)) {
//           list.rawDateTimeReleased = list.dateTimeReleased;
//           list.dateTimeReleased = util.formatDate2({
//             date: list.dateTimeReleased,
//           });
//         }

//         if (
//           list.ward === "OPD" ||
//           list.ward === "ER" ||
//           list.ward === "OPD-CHARITY"
//         ) {
//           list.wardRoom = list.ward;
//         } else {
//           list.wardRoom = `${list.ward} - ${list.room}`;
//         }
//       }
//     }
//     return charges;
//   } catch (error) {
//     console.log(error);
//     return error;
//   }
// };
// const selectDepartments = async function (conditions, args, options, txn) {
//   try {
//     const departments = await sqlHelper.query(
//       `SELECT
//       ${util.empty(options.top) ? "" : `TOP(${options.top})`}
//       code,
//       name,
//       description,
//       accessRightName,
//       email,
//       revCode,
//       readersEmailFormat,
//       externalDeptCode,
//       patientPortal,
//       icon,
//       active,
//       createdBy,
//       updatedBy,
//       dateTimeCreated,
//       dateTimeUpdated
//     from UERMResults..Departments
//     WHERE 1=1 ${conditions}
//     ${util.empty(options.order) ? "" : `order by ${options.order}`}
//     `,
//       args,
//       txn,
//     );

//     return departments;
//   } catch (error) {
//     console.log(error);
//     return error;
//   }
// };

// const selectTestComponentFlagging = async function (
//   conditions,
//   args,
//   options,
//   txn,
// ) {
//   try {
//     const testComponentFlagging = await sqlHelper.query(
//       `select
//         ${util.empty(options.top) ? "" : `TOP(${options.top})`}
//         a.id,
//         a.code,
//         a.name,
//         a.testCode,
//         a.sequence,
//         b.gender,
//         b.normalMin,
//         b.normalMax,
//         c.minValue,
//         c.maxValue,
//         comparisonOperator,
//         c.flagType,
//         c.label,
//         c.createdBy,
//         c.updatedBy,
//         c.dateTimeCreated,
//         c.dateTimeUpdated
//       from
//       UERMResults..TestComponents a
//       join UERMResults..TestComponentReferenceRanges b on b.TestComponentId = a.Id and b.active = 1
//       join UERMResults..TestComponentFlagging c on c.ComponentReferenceRangeId = b.id and c.active = 1
//       where 1=1 ${conditions}
//       ${util.empty(options.order) ? "" : `order by ${options.order}`}`,
//       args,
//       txn,
//     );

//     return testComponentFlagging;
//   } catch (error) {
//     console.log(error);
//     return error;
//   }
// };

module.exports = {
  selectPatientResultValueFiles,
  selectTestComponents,
  selectUERMEmployee,
  selectDoctors,
  selectPatients,
  // selectPatientResults,
  // selectTestOrders,
  // selectTestComponentFlagging,
  // selectDepartments,
};
