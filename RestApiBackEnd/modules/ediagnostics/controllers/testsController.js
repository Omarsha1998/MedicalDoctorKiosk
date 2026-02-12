const util = require("../../../helpers/util");
const sqlHelper = require("../../../helpers/sql");

// MODELS //
const testModel = require("../models/testModel.js");
// MODELS //

const __handleTransactionResponse = (returnValue, res) => {
  if (returnValue.error) {
    console.log(returnValue.error);
    return res.status(500).json({ error: returnValue.error });
  }
  return res.json(returnValue);
};

const getTestsAndComponents = async function (req, res) {
  const { testCode, gender, birthdate, versionSetId, printVersionSetId } =
    req.query;
  if (util.empty(testCode))
    return res.status(400).json({ error: "Test code is required." });

  const returnValue = await sqlHelper.transact(async (txn) => {
    const ageDays = await util.getDaysFromBirthdate(birthdate);

    let conditions = `and a.code = ?`;
    let args = [ageDays, gender, testCode];
    if (!util.empty(versionSetId)) {
      conditions = `and a.code = ? and b.versionSetId = ?`;
      args = [ageDays, gender, testCode, versionSetId];
    }

    if (!util.empty(printVersionSetId)) {
      conditions = `and a.code = ? and b.versionSetId = ? and c.versionSetId = ?`;
      args = [ageDays, gender, testCode, versionSetId, printVersionSetId];
    }

    const tests = await testModel.selectTestComponents(
      `and (? BETWEEN d.AgeMinDays AND d.AgeMaxDays OR (d.AgeMinDays IS NULL AND d.AgeMaxDays IS NULL))
        AND (? = d.gender OR d.gender IS NULL)
      `,
      conditions,
      args,
      {
        order: "b.sequence",
        top: "",
      },
      txn,
    );

    return tests;
  });

  return __handleTransactionResponse(returnValue, res);
};

const getTestFlaggings = async function (req, res) {
  const { testCode, gender, birthdate } = req.query;
  if (util.empty(testCode))
    return res.status(400).json({ error: "Test code is required." });

  const returnValue = await sqlHelper.transact(async (txn) => {
    const ageDays = await util.getDaysFromBirthdate(birthdate);

    const testFlaggings = await testModel.selectTestComponentFlagging(
      ` and (? BETWEEN b.AgeMinDays AND b.AgeMaxDays OR (b.AgeMinDays IS NULL AND b.AgeMaxDays IS NULL))
        AND (? = b.gender OR b.gender IS NULL) and a.testCode = ?
      `,
      [ageDays, gender, testCode],
      {
        order: "",
        top: "",
      },
      txn,
    );

    return testFlaggings;
  });

  return __handleTransactionResponse(returnValue, res);
};

const getTestTemplates = async function (req, res) {
  const { testCode, versionSetId } = req.query;
  if (util.empty(testCode))
    return res.status(400).json({ error: "Test code is required." });

  const returnValue = await sqlHelper.transact(async (txn) => {
    let conditions = `and a.testCode = ? and a.active = ?`;
    let args = [testCode, 1];

    const versionSet = versionSetId === "null" ? null : versionSetId;

    if (!util.empty(versionSet)) {
      conditions = `and a.active = ? and a.testCode = ? and a.versionSetId = ?`;
      args = [1, testCode, versionSetId];
    }

    const testFlaggings = await testModel.selectTestTemplate(
      conditions,
      args,
      {
        order: "",
        top: "",
      },
      txn,
    );

    return testFlaggings;
  });

  return __handleTransactionResponse(returnValue, res);
};

module.exports = {
  getTestsAndComponents,
  getTestFlaggings,
  getTestTemplates,
};
