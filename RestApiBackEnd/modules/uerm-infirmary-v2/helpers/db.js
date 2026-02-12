const mssql = require("mssql");
const db = require("../../../helpers/sql.js");

const defaultConnName = "linkedToUE";
const errorResult = { error: true };

const query = async (command, args, conn) => {
  if (!command) {
    throw new Error("`command` is required.");
  }

  if (!conn) {
    conn = db.getConn(defaultConnName);
  }

  if (
    !(conn instanceof mssql.ConnectionPool) &&
    !(conn instanceof mssql.Transaction)
  ) {
    throw new Error(
      "`conn` argument must be a ConnectionPool or a Transaction.",
    );
  }

  // console.log("query helper, commands: ", command);
  // console.log("query helper, args: ", args);

  try {
    const result =
      args && args.length > 0
        ? await conn.request().query(command.split("?"), ...args)
        : await conn.request().query(command);

    if (result.recordsets) {
      return result.recordsets.length === 1
        ? result.recordsets[0]
        : result.recordsets;
    }

    return null;
  } catch (error) {
    // console.log(error);
    // Let `transact` handle the error if this is ran inside `transact`
    if (conn instanceof mssql.Transaction) {
      throw error;
    }

    return errorResult;
  }
};

const transact = async (commands, conn) => {
  if (!conn) {
    conn = db.getConn(defaultConnName);
  }

  const txn = new mssql.Transaction(conn);

  try {
    // IMPORTANT: begin transaction here as rolling back a transaction that
    // has not been started throws an error
    // console.log("Starting transaction...");
    await txn.begin();

    try {
      // IMPORTANT: Throw an error inside the `commands` arg to force a "rollback"
      const ret = await commands(txn);
      // console.log("Committing transaction...");
      await txn.commit();

      return ret;
    } catch (error) {
      // console.log(error);
      // console.log("Error occured in a transaction. Rolling back...");
      await txn.rollback();
      // console.log("Rolled back.");
      return errorResult;
    }
  } catch (error) {
    // console.log(error);
    return errorResult;
  }
};

const getDateTime = async (txn) => {
  return (await query(`SELECT GETDATE() AS now;`, [], txn))[0].now;
};

module.exports = {
  query,
  transact,
  getDateTime,
};
