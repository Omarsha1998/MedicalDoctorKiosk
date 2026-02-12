const db = require("../helpers/db.js");
const { generateAlphaNumericStr } = require("../../../helpers/util.js");

// const VOUCHER_LOCATIONS = {
//   PHARMACY: "1120",
//   CENTRAL_SUPPLIES_ROOM: "1070",
// };

const VOUCHER_TYPES = {
  PROCEDURE: "PRO",
  INVENTORY: "INV",
};

const availmentVoucherCols = [
  "id",
  "VoucherCode code",
  "PatientNo patientCode",
  "caseNo caseCode",
  "caseDept caseDeptCode",
  "Validity dateTimeValid",
  "AvailedDate dateTimeAvailed",
  "UserName createdByCode",
  "dateTimeCreated",
  "remarks",

  "studempCampusName",
  "studempDeptName",
  "studempAffiliationName",
  "studempIsFaculty",
];

const availmentVoucherColsJoined = availmentVoucherCols.join(",");

// const availmentVoucherDetailsCols = [
//   "id",
//   "availmentVoucherId",
//   "deptCode",
//   "[type] typeCode",
//   "ChargeId_ItemCode chargeId",
//   "Qty quantity",
//   "chargeSlipNo",
//   "TransDate dateTimeCreated",
// ];

const insertVoucher = async (
  userCode,
  patientCode,
  campusName,
  deptName,
  affiliationsName,
  isFaculty,
  remarks,
  txn,
) => {
  let rowCode = null;
  let voucherCodeExists = true;

  while (voucherCodeExists) {
    rowCode = `INF${generateAlphaNumericStr(8)}`;

    voucherCodeExists = (
      await db.query(
        "SELECT 1 FROM UERMHIMS..AvailmentVoucher WHERE VoucherCode = ?;",
        [rowCode],
        txn,
      )
    )[0];
  }

  await db.query(
    `
      INSERT INTO UERMHIMS..AvailmentVoucher (
        PatientNo,
        VoucherCode,
        UserName,
        Remarks,
        StudempCampusName,
        StudempDeptName,
        StudempAffiliationName,
        StudempIsFaculty,
        Validity,
        DateTimeCreated
      ) VALUES (
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        DATEADD(DAY, 3, GETDATE()),
        GETDATE()
      );
    `,
    [
      patientCode,
      rowCode,
      userCode,
      remarks || null,
      campusName,
      deptName,
      affiliationsName,
      isFaculty,
    ],
    txn,
  );

  return (
    await db.query(
      `
        SELECT TOP 1
          ${availmentVoucherColsJoined}
        FROM
          UERMHIMS..AvailmentVoucher
        WHERE
          VoucherCode = ?;
      `,
      [rowCode],
      txn,
    )
  )[0];
};

const insertVoucherDetail = async (
  voucherId,
  deptCode,
  itemTypeCode,
  itemCode,
  quantity,
  txn,
) => {
  if (!voucherId || !deptCode || !itemTypeCode || !itemCode || !txn) {
    throw new Error("Incomplete arguments.");
  }

  await db.query(
    `
      INSERT INTO UERMHIMS..AvailmentVoucherDetails (
        AvailmentVoucherId,
        DeptCode,
        ChargeId_ItemCode,
        [Type],
        Qty,
        TransDate
      ) VALUES (
        ?,
        ?,
        ?,
        ?,
        ?,
        GETDATE()
      );
    `,
    [voucherId, deptCode, itemCode, itemTypeCode, quantity || 1],
    txn,
  );
};

const insertOne = async (
  userCode,
  patientCode,
  campusName,
  deptName,
  affiliationsName,
  isFaculty,
  remarks,
  items,
  txn,
) => {
  if (!txn) {
    throw new Error("`txn` is required.");
  }

  // console.log("Inserting new voucher...");
  const insertedVoucher = await insertVoucher(
    userCode,
    patientCode,
    campusName,
    deptName,
    affiliationsName,
    isFaculty,
    remarks,
    txn,
  );

  for (const i of items) {
    if (i.type !== VOUCHER_TYPES.PROCEDURE) {
      continue;
    }

    const diagDeptCode = (
      await db.query(
        `
          SELECT
            s.Code deptCode
          FROM
            UERMMMC..Charges c
            INNER JOIN UERMMMC..ACC_TITLES t ON t.Code = c.REV_CODE
            INNER JOIN UERMMMC..Sections AS s ON s.Code = t.SECTION_CODE
          WHERE
            c.Id = ?;
        `,
        [i.code],
        txn,
      )
    )[0]?.deptCode;

    if (diagDeptCode) {
      // console.log("Inserting voucher detail...");
      await insertVoucherDetail(
        insertedVoucher.id,
        diagDeptCode,
        VOUCHER_TYPES.PROCEDURE,
        i.code,
        1,
        txn,
      );
    }
  }
};

// const selectOne = async (voucherCode, txn) => {
//   return (
//     await db.query(
//       `
//         SELECT TOP 1
//           ${availmentVoucherColsJoined}
//         FROM
//           UERMHIMS..AvailmentVoucher
//         WHERE
//           VoucherCode = ?
//           AND ISNULL(v.Deleted, 0) = 0;
//       `,
//       [voucherCode],
//       txn,
//     )
//   )[0];
// };

const selectMany = async (patientCode, txn) => {
  return await db.query(
    `
      SELECT ${patientCode ? "" : "TOP 10"}
        p.PatientNo patientCode,
        p.FirstName patientFirstName,
        p.MiddleName patientMiddleName,
        p.LastName patientLastName,
        p.Suffix patientSuffixName,
        p.Sex patientGender,
        p.DBirth patientBirthDate,

        v.id,
        v.VoucherCode code,
        v.Validity dateTimeValid,
        v.AvailedDate dateTimeAvailed,
        v.availedCaseNo,
        v.UserName createdByCode,
        v.dateTimeCreated,
        v.UpdatedBy updatedByCode,
        v.dateTimeUpdated,
        v.remarks,

        CASE WHEN ISNULL(p.SN, '') = '' THEN
          p.EmpNo
        ELSE
          p.SN
        END studempCode,
        v.studempCampusName,
        v.studempDeptName,
        v.studempAffiliationName,
        v.studempIsFaculty
      FROM
        UERMHIMS..AvailmentVoucher v
        INNER JOIN UERMMMC..PatientInfo p ON p.PatientNo = v.PatientNo
      WHERE
        ISNULL(v.Deleted, 0) = 0
      ${patientCode ? "AND v.PatientNo = ?" : "ORDER BY v.Id DESC"};
    `,
    patientCode ? [patientCode] : [],
    txn,
  );
};

// const selectManyWithDetails = async (patientCode) => {
//   return await db.transact(async (txn) => {
//     // console.log("Selecting voucher...");
//     const vouchers = await selectMany(patientCode, txn);

//     // console.log("Selecting voucher details...");
//     const voucherDetails = await db.query(
//       `
//         SELECT
//           d.id,
//           d.availmentVoucherId,
//           d.DeptCode deptCode,
//           s.description deptName,
//           d.[Type] itemTypeCode,
//           d.ChargeId_ItemCode itemCode,
//           CASE WHEN c.Description IS NOT NULL THEN
//             c.Description
//           ELSE
//             CONCAT(m.BrandName, ' ', m.GenName, ' ', m.MG, ' ', m.DosageForm)
//           END itemName,
//           d.Qty quantity,
//           d.chargeSlipNo chargeSlipCode,
//           d.TransDate dateTimeCreated
//         FROM
//           UERMHIMS..AvailmentVoucherDetails d
//           INNER JOIN UERMHIMS..AvailmentVoucherDetails v ON v.Id = d.AvailmentVoucherId
//           LEFT JOIN UERMMMC..Sections s ON s.Code = d.DeptCode
//           LEFT JOIN UERMMMC..Charges c ON
//             d.[Type] = 'PRO'
//             AND CAST(c.Id AS VARCHAR) = d.ChargeId_ItemCode
//         WHERE
//           v.PatientNo = ?;
//       `,
//       [patientCode],
//       txn,
//     );

//     return [vouchers, voucherDetails];
//   });
// };

const selectByPatientCodeWithDetails = async (patientCode) => {
  return await db.transact(async (txn) => {
    const vouchers = await selectMany(patientCode, txn);

    const voucherDetails = await db.query(
      `
        SELECT
          vd.id,
          vd.AvailmentVoucherId voucherId,
          s.Code deptCode,
          s.Description deptName,
          vd.[Type] itemTypeCode,
          vd.ChargeId_ItemCode itemCode,
          CASE WHEN c.Description IS NOT NULL THEN
            c.Description
          ELSE
            CONCAT(m.BrandName, ' ', m.GenName, ' ', m.MG, ' ', m.DosageForm)
          END itemName,
          vd.Qty quantity,
          vd.chargeSlipNo chargeSlipCode
        FROM
          UERMHIMS..AvailmentVoucherDetails vd
          INNER JOIN UERMHIMS..AvailmentVoucher v ON v.Id = vd.AvailmentVoucherId
          LEFT JOIN UERMMMC..Sections s ON s.Code = vd.DeptCode
          LEFT JOIN UERMMMC..Charges c ON
            vd.[Type] = 'PRO'
            AND CAST(c.Id AS VARCHAR) = vd.ChargeId_ItemCode
          LEFT JOIN UERMMMC..PHAR_ITEMS m ON
            vd.[Type] = 'INV'
            AND m.ItemCode = vd.ChargeId_ItemCode
        WHERE
          ISNULL(v.Deleted, 0) = 0
          AND v.PatientNo = ?;
      `,
      [patientCode],
      txn,
    );

    return {
      vouchers,
      voucherDetails,
    };
  });
};

const selectByPatientNameWithDetails = async (patientName) => {
  return await db.transact(async (txn) => {
    const vouchers = await db.query(
      `
        SELECT
          p.PatientNo patientCode,
          p.FirstName patientFirstName,
          p.MiddleName patientMiddleName,
          p.LastName patientLastName,
          p.Suffix patientSuffixName,
          p.Sex patientGender,
          p.DBirth patientBirthDate,

          v.id,
          v.VoucherCode code,
          v.Validity dateTimeValid,
          v.AvailedDate dateTimeAvailed,
          v.UserName createdByCode,
          v.dateTimeCreated,
          v.remarks,

          CASE WHEN ISNULL(p.SN, '') = '' THEN
            p.EmpNo
          ELSE
            p.SN
          END studempCode,
          v.studempCampusName,
          v.studempDeptName,
          v.studempAffiliationName,
          v.studempIsFaculty
        FROM
          UERMHIMS..AvailmentVoucher v
          INNER JOIN UERMMMC..PatientInfo p ON p.PatientNo = v.PatientNo
        WHERE
          ISNULL(v.Deleted, 0) = 0
          AND (
            CONCAT(p.LastName, ', ', p.FirstName) LIKE ?
            OR CONCAT(p.FirstName, ' ', p.LastName) LIKE ?
          );
      `,
      [`%${patientName}%`, `%${patientName}%`],
      txn,
    );

    const voucherDetails = [];

    for (const v of vouchers) {
      voucherDetails.push(
        ...(await db.query(
          `
            SELECT
              vd.id,
              vd.AvailmentVoucherId voucherId,
              s.Code deptCode,
              s.Description deptName,
              vd.[Type] itemTypeCode,
              vd.ChargeId_ItemCode itemCode,
              CASE WHEN c.Description IS NOT NULL THEN
                c.Description
              ELSE
                CONCAT(m.BrandName, ' ', m.GenName, ' ', m.MG, ' ', m.DosageForm)
              END itemName,
              vd.Qty quantity,
              vd.chargeSlipNo chargeSlipCode
            FROM
              UERMHIMS..AvailmentVoucherDetails vd
              LEFT JOIN UERMMMC..Sections s ON s.Code = vd.DeptCode
              LEFT JOIN UERMMMC..Charges c ON
                vd.[Type] = 'PRO'
                AND CAST(c.Id AS VARCHAR) = vd.ChargeId_ItemCode
              LEFT JOIN UERMMMC..PHAR_ITEMS m ON
                vd.[Type] = 'INV'
                AND m.ItemCode = vd.ChargeId_ItemCode
            WHERE
              vd.AvailmentVoucherId = ?;
          `,
          [v.id],
          txn,
        )),
      );
    }

    return {
      vouchers,
      voucherDetails,
    };
  });
};

const selectLatestWithDetails = async () => {
  return await db.transact(async (txn) => {
    const vouchers = await db.query(
      `
        SELECT TOP 10
          p.PatientNo patientCode,
          p.FirstName patientFirstName,
          p.MiddleName patientMiddleName,
          p.LastName patientLastName,
          p.Suffix patientSuffixName,
          p.Sex patientGender,
          p.DBirth patientBirthDate,

          v.id,
          v.VoucherCode code,
          v.Validity dateTimeValid,
          v.AvailedDate dateTimeAvailed,
          v.UserName createdByCode,
          v.dateTimeCreated,
          v.remarks,

          CASE WHEN ISNULL(p.SN, '') = '' THEN
            p.EmpNo
          ELSE
            p.SN
          END studempCode,
          v.studempCampusName,
          v.studempDeptName,
          v.studempAffiliationName,
          v.studempIsFaculty
        FROM
          UERMHIMS..AvailmentVoucher v
          INNER JOIN UERMMMC..PatientInfo p ON p.PatientNo = v.PatientNo
        WHERE
          ISNULL(v.Deleted, 0) = 0
        ORDER BY
          Id DESC;
      `,
      [],
      txn,
    );

    const voucherDetails = [];

    for (const v of vouchers) {
      voucherDetails.push(
        ...(await db.query(
          `
            SELECT
              vd.id,
              vd.AvailmentVoucherId voucherId,
              s.Code deptCode,
              s.Description deptName,
              vd.[Type] itemTypeCode,
              vd.ChargeId_ItemCode itemCode,
              CASE WHEN c.Description IS NOT NULL THEN
                c.Description
              ELSE
                CONCAT(m.BrandName, ' ', m.GenName, ' ', m.MG, ' ', m.DosageForm)
              END itemName,
              vd.Qty quantity,
              vd.chargeSlipNo chargeSlipCode
            FROM
              UERMHIMS..AvailmentVoucherDetails vd
              LEFT JOIN UERMMMC..Sections s ON s.Code = vd.DeptCode
              LEFT JOIN UERMMMC..Charges c ON
                vd.[Type] = 'PRO'
                AND CAST(c.Id AS VARCHAR) = vd.ChargeId_ItemCode
              LEFT JOIN UERMMMC..PHAR_ITEMS m ON
                vd.[Type] = 'INV'
                AND m.ItemCode = vd.ChargeId_ItemCode
            WHERE
              vd.AvailmentVoucherId = ?;
          `,
          [v.id],
          txn,
        )),
      );
    }

    return {
      vouchers,
      voucherDetails,
    };
  });
};

module.exports = {
  insertOne,
  // selectOne,
  selectMany,
  // selectManyWithDetails,
  selectByPatientCodeWithDetails,
  selectByPatientNameWithDetails,
  selectLatestWithDetails,
};
