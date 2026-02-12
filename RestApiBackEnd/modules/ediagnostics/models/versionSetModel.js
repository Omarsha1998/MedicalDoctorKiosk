/* eslint-disable no-console */
const util = require("../../../helpers/util");
const sqlHelper = require("../../../helpers/sql");

const selectVersionSets = async function (conditions, args, options, txn) {
  try {
    const versionSets = await sqlHelper.query(
      `SELECT
      ${util.empty(options.top) ? "" : `TOP(${options.top})`}
      id,
      testCode,
      version,
      type,
      description,
      effectiveFrom,
      effectiveTo,
      currentVersion,
      active,
      createdBy,
      updatedBy,
      dateTimeCreated,
      dateTimeUpdated,
      remarks
    from UERMResults..VersionSets
    WHERE 1=1 ${conditions}
    ${util.empty(options.order) ? "" : `order by ${options.order}`}
    `,
      args,
      txn,
    );

    return versionSets;
  } catch (error) {
    console.log(error);
    return error;
  }
};

module.exports = {
  selectVersionSets,
};
