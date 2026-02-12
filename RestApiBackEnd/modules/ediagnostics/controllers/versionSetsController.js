const util = require("../../../helpers/util.js");
const sqlHelper = require("../../../helpers/sql.js");

// MODELS //
const versionSetModel = require("../models/versionSetModel.js");
// MODELS //

const __handleTransactionResponse = (returnValue, res) => {
  if (returnValue.error) {
    return res.status(500).json({ error: returnValue.error });
  }
  return res.json(returnValue);
};

const getVersionSets = async function (req, res) {
  const { testCode } = req.query;

  const returnValue = await sqlHelper.transact(async (txn) => {
    let conditions = `and active = ?`;
    let args = [1];
    if (!util.empty(testCode)) {
      conditions = `and active = ? and testCode = ?`;
      args = [1, testCode];
    }

    const response = await versionSetModel.selectVersionSets(
      conditions,
      args,
      {},
      txn,
    );

    return response;
  });

  return __handleTransactionResponse(returnValue, res);
};

module.exports = {
  getVersionSets,
};
