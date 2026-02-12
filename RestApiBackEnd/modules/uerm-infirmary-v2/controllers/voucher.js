const db = require("../helpers/db.js");
const { campusesMap, affiliationsMap } = require("../constants.js");

const voucherModel = require("../models/voucher.js");

const get = async (req, res) => {
  let response = {
    studemps: [],
    vouchers: [],
    voucherDetails: [],
  };

  if (!req.query?.patientCode && !req.query?.patientName) {
    response = await voucherModel.selectLatestWithDetails();
  }

  if (req.query?.patientCode) {
    response = await voucherModel.selectByPatientCodeWithDetails(
      req.query.patientCode,
    );
  }

  if (req.query?.patientName) {
    response = await voucherModel.selectByPatientNameWithDetails(
      req.query.patientName,
    );
  }

  if (response?.error) {
    res.status(500).json(null);
    return;
  }

  res.json(response);
};

const post = async (req, res) => {
  if (
    !req.body ||
    !req.body.studemp ||
    !req.body.studemp.patientCode ||
    !req.body.studemp.campusCode ||
    !req.body.studemp.deptName ||
    !req.body.studemp.affiliationCode ||
    !req.body.items ||
    req.body.items.length === 0
  ) {
    res.status(400).json("Request body is malformed.");
    return;
  }

  const response = await db.transact(async (txn) => {
    return await voucherModel.insertOne(
      req.user.code,
      req.body.studemp.patientCode,

      campusesMap[req.body.studemp.campusCode]?.name || "",
      req.body.studemp.deptName,
      affiliationsMap[req.body.studemp.affiliationCode]?.name || "",
      req.body.studemp.isFaculty || false,

      req.body.reason,
      req.body.items,
      txn,
    );
  });

  if (response?.error) {
    res.status(500).json(null);
    return;
  }

  res.json(response);
};

const _delete = async (req, res) => {
  if (!req.params.id) {
    res.status(400).json("Request param `id` is required.");
    return;
  }

  const response = await db.transact(async (txn) => {
    const voucherIsAvailed = (
      await db.query(
        `
          SELECT
            id
          FROM
            UERMHIMS..AvailmentVoucher
          WHERE
            Id = ?
            AND AvailedDate IS NOT NULL;
        `,
        [req.params.id],
        txn,
      )
    )[0];

    if (voucherIsAvailed) {
      return {
        status: 400,
        body: "Cannot delete voucher that has already been availed.",
      };
    }

    await db.query(
      `
        UPDATE UERMHIMS..AvailmentVoucher SET
          Deleted = 1
        WHERE
          Id = ?;
      `,
      [req.params.id],
      txn,
    );

    return { status: 200, body: null };
  });

  if (response?.error) {
    res.status(500).json(null);
    return;
  }

  res.status(response.status).json(response.body);
};

module.exports = {
  get,
  post,
  _delete,
};
