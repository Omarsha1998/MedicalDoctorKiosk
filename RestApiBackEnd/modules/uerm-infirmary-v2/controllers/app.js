const db = require("../helpers/db.js");

const getCurrentDateTime = async (req, res) => {
  const r = await db.transact(async (txn) => {
    return await db.getDateTime(txn);
  });

  if (r?.error) {
    res.status(500).json(null);
    return;
  }

  res.json(r);
};

const getProceduresV1 = async (req, res) => {
  const sqlWhereStrArr = [];
  const sqlWhereArgs = [];

  for (const key of ["searchStr", "rvsCode"]) {
    if (req.query[key] == null || req.query[key] === "") {
      continue;
    }

    if (key === "searchStr") {
      sqlWhereStrArr.push("x.Description LIKE ?");
      sqlWhereArgs.push(`%${req.query[key]}%`);
      continue;
    }

    if (key === "rvsCode") {
      sqlWhereStrArr.push("x.[Code] = ?");
      sqlWhereArgs.push(req.query[key]);
      continue;
    }
  }

  const r = await db.query(
    `
      SELECT
        x.Code code,
        x.DESCRIPTION [name]
      FROM
        UERMMMC..PHIC_PACKAGE x
        INNER JOIN (
          SELECT MAX(Id) Id FROM UERMMMC..PHIC_PACKAGE GROUP BY [Code]
        ) y ON y.Id = x.Id
      WHERE
        x.CODE_RATE = 'PRO'
        ${sqlWhereStrArr.length > 0 ? `AND ${sqlWhereStrArr.join(" AND ")}` : ""};
    `,
    sqlWhereArgs,
  );

  if (r?.error) {
    res.status(500).json(null);
    return;
  }

  res.json(r);
};

const getProcedures = async (req, res) => {
  const sqlWhereStrArr = [];
  const sqlWhereArgs = [];

  for (const key of ["searchStr"]) {
    if (req.query[key] == null || req.query[key] === "") {
      continue;
    }

    if (key === "searchStr") {
      sqlWhereStrArr.push("c.Description LIKE ?");
      sqlWhereArgs.push(`%${req.query[key]}%`);
      continue;
    }
  }

  const r = await db.query(
    `
      SELECT
        c.id [code],
        c.Description [name],
        --t.Code revenueCenterCode,
        --t.Description revenueCenterName,
        s.Code deptCode,
        s.Description deptName
      FROM
        UERMMMC..Charges c
        INNER JOIN UERMMMC..ACC_TITLES t ON t.Code = c.REV_CODE
        INNER JOIN UERMMMC..Sections AS s ON s.Code = t.SECTION_CODE
      WHERE
        (t.IsDiagnosticCenter = 1 OR c.REV_CODE IN ('OR', 'DRC', 'OS'))
        ${sqlWhereStrArr.length > 0 ? `AND ${sqlWhereStrArr.join(" AND ")}` : ""};
    `,
    sqlWhereArgs,
  );

  if (r?.error) {
    res.status(500).json(null);
    return;
  }

  res.json(r);
};

const getDoctors = async (req, res) => {
  const sqlWhereStrArr = [];
  const sqlWhereArgs = [];

  for (const key of ["searchStr", "deptCode"]) {
    if (req.query[key] == null || req.query[key] === "") {
      continue;
    }

    if (key === "searchStr") {
      sqlWhereStrArr.push("CONCAT([LAST NAME], ', ', [FIRST NAME]) LIKE ?");
      sqlWhereArgs.push(`%${req.query[key]}%`);
      continue;
    }

    if (key === "deptCode") {
      sqlWhereStrArr.push("Department = ?");
      sqlWhereArgs.push(req.query[key]);
      continue;
    }
  }

  if (sqlWhereStrArr.length === 0) {
    res.status(400).json("URL query is malformed.");
    return;
  }

  const r = await db.query(
    `
      SELECT
        code,
        CONCAT(
          [LAST NAME],
          ', ',
          [FIRST NAME],
          CASE WHEN ISNULL([MIDDLE NAME], '') = '' THEN
            ''
          ELSE
            ' ' + SUBSTRING([MIDDLE NAME], 1, 1) + '.'
          END
        ) [name],
        [FIRST NAME] firstName,
        [MIDDLE NAME] middleName,
        [LAST NAME] lastName,
        [EXT NAME] suffixName,
        Department deptCode
      FROM
        UERMMMC..Doctors
      WHERE
        ISNULL(Deleted, 0) = 0
        ${sqlWhereStrArr.length > 0 ? `AND ${sqlWhereStrArr.join(" AND ")}` : ""};
    `,
    sqlWhereArgs,
  );

  if (r?.error) {
    res.status(500).json(null);
    return;
  }

  res.json(r);
};

const getClinicalDepartments = async (req, res) => {
  const r = await db.query(
    `
      SELECT
        code,
        [name]
      FROM
        UERMMMC..MedicalDepartments
      WHERE
        ISNULL(Active, 0) = 1;
    `,
  );

  if (r?.error) {
    res.status(500).json(null);
    return;
  }

  res.json(r);
};

module.exports = {
  getCurrentDateTime,
  getProcedures,
  getDoctors,
  getClinicalDepartments,
};
