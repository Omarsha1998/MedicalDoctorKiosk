/* eslint-disable no-console */
const util = require("../../../helpers/util");
const sqlHelper = require("../../../helpers/sql");

const selectPatientResults = async function (conditions, args, options, txn) {
  try {
    // console.log(`select
    //     ${util.empty(options.top) ? "" : `TOP(${options.top})`}
    //     a.id,
    //     b.id patientResultValueId,
    //     a.verifierId,
    //     a.validatorId,
    //     a.consultantId,
    //     a.completionRemarks,
    //     b.patientResultId,
    //     b.testComponentCode,
    //     b.value,
    //     b.flag,
    //     b.normalMin,
    //     b.normalMax,
    //     b.criticalMin,
    //     b.criticalMax,
    //     b.delimiter,
    //     c.id fileId,
    //     c.fileName,
    //     c.fileType,
    //     c.fileSize,
    //     b.createdBy,
    //     b.updatedBy,
    //     b.dateTimeCreated,
    //     b.dateTimeUpdated,
    //     b.remarks
    //   from
    //     UERMResults..PatientResults a
    //     left join UERMResults..PatientResultValues b on b.patientResultId = a.Id
    //     left join UERMResults..PatientResultValueFiles c on c.patientResultValueId = b.id
    //     left join UERMResults..TestComponents d on d.code = b.testComponentCode
    //   where 1=1 ${conditions}
    //   ${util.empty(options.order) ? "" : `order by ${options.order}`}`);

    const results = await sqlHelper.query(
      `select
        ${util.empty(options.top) ? "" : `TOP(${options.top})`}
        b.id,
        c.id patientResultValueId,
        b.verifierId,
        b.validatorId,
        b.consultantId,
        b.completionRemarks,
        c.patientResultId,
        a.code testComponentCode,
        c.value,
        c.flag,
        c.normalMin,
        c.normalMax,
        c.criticalMin,
        c.criticalMax,
        c.delimiter,
        a.versionSetId,
        d.id fileId,
        d.fileName,
        d.fileType,
        d.fileSize,
        c.createdBy,
        c.updatedBy,
        c.dateTimeCreated,
        c.dateTimeUpdated,
        c.remarks
      from
        UERMResults..TestComponents a
        left join UERMREsults..PatientResults b on b.TestCode = a.TestCode
        left join UERMResults..PatientResultValues c on c.patientResultId = b.id and c.TestComponentCode = a.Code
        left join UERMResults..PatientResultValueFiles d on d.patientResultValueId = b.id
      where 1=1 ${conditions}
      ${util.empty(options.order) ? "" : `order by ${options.order}`}`,
      args,
      txn,
    );

    // const results = await sqlHelper.query(
    //   `select
    //     ${util.empty(options.top) ? "" : `TOP(${options.top})`}
    //     a.id,
    //     b.id patientResultValueId,
    //     a.verifierId,
    //     a.validatorId,
    //     a.consultantId,
    //     a.completionRemarks,
    //     b.patientResultId,
    //     b.testComponentCode,
    //     b.value,
    //     b.flag,
    //     b.normalMin,
    //     b.normalMax,
    //     b.criticalMin,
    //     b.criticalMax,
    //     b.delimiter,
    //     c.id fileId,
    //     c.fileName,
    //     c.fileType,
    //     c.fileSize,
    //     b.createdBy,
    //     b.updatedBy,
    //     b.dateTimeCreated,
    //     b.dateTimeUpdated,
    //     b.remarks
    //   from
    //     UERMResults..PatientResults a
    //     left join UERMResults..PatientResultValues b on b.patientResultId = a.Id
    //     left join UERMResults..PatientResultValueFiles c on c.patientResultValueId = b.id
    //     left join UERMResults..TestComponents d on d.code = b.testComponentCode
    //   where 1=1 ${conditions}
    //   ${util.empty(options.order) ? "" : `order by ${options.order}`}`,
    //   args,
    //   txn,
    // );

    if (results.length > 0) {
      for (const list of results) {
        list.flag = list.flag === null ? "" : list.flag;
      }
    }

    return results;
  } catch (error) {
    console.log(error);
    return error;
  }
};

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

const insertPatientResult = async function (payload, table, txn) {
  if (!util.isObj(payload)) {
    return { error: true, message: "Invalid payload" };
  }
  try {
    return await sqlHelper.insert(`${table}`, payload, txn);
  } catch (error) {
    console.log(error);
    return { error: true, message: error };
  }
};

const insertPatientResultWithColumns = async function (
  payload,
  table,
  txn,
  columnsToSelect,
) {
  if (!util.isObj(payload)) {
    return { error: true, message: "Invalid payload" };
  }
  try {
    return await sqlHelper.insert(
      `${table}`,
      payload,
      txn,
      "dateTimeCreated",
      true,
      columnsToSelect,
    );
  } catch (error) {
    console.log(error);
    return { error: true, message: error };
  }
};

const insertToTable = async function (payload, table, txn) {
  if (!util.isObj(payload)) {
    return { error: true, message: "Invalid payload" };
  }
  try {
    return await sqlHelper.insert(`${table}`, payload, txn);
  } catch (error) {
    console.log(error);
    return { error: true, message: error };
  }
};

const insertToTableWithColumns = async function (
  payload,
  table,
  txn,
  columnsToSelect,
) {
  if (!util.isObj(payload)) {
    return { error: true, message: "Invalid payload" };
  }
  try {
    return await sqlHelper.insert(
      `${table}`,
      payload,
      txn,
      "dateTimeCreated",
      true,
      columnsToSelect,
    );
  } catch (error) {
    console.log(error);
    return { error: true, message: error };
  }
};

const updatePatientResult = async function (payload, condition, table, txn) {
  try {
    return await sqlHelper.update(`${table}`, payload, condition, txn);
  } catch (error) {
    console.log(error);
    return { error: true, message: error };
  }
};

const updatePatientResultWithColumns = async function (
  payload,
  condition,
  table,
  txn,
  columnsToSelect,
) {
  try {
    return await sqlHelper.update(
      `${table}`,
      payload,
      condition,
      txn,
      "dateTimeUpdated",
      true,
      columnsToSelect,
    );
  } catch (error) {
    console.log(error);
    return { error: true, message: error };
  }
};

const updateToTable = async function (payload, condition, table, txn) {
  try {
    const updateTable = await sqlHelper.update(
      `${table}`,
      payload,
      condition,
      txn,
    );
    return updateTable;
  } catch (error) {
    console.log(error);
    return { error: true, message: error };
  }
};

const updateToTableWithColumns = async function (
  payload,
  condition,
  table,
  txn,
  columnsToSelect,
) {
  try {
    return await sqlHelper.update(
      `${table}`,
      payload,
      condition,
      txn,
      "dateTimeUpdated",
      true,
      columnsToSelect,
    );
  } catch (error) {
    console.log(error);
    return { error: true, message: error };
  }
};

module.exports = {
  selectPatientResults,
  selectPatientResultValueFiles,
  insertPatientResult,
  insertPatientResultWithColumns,
  insertToTable,
  insertToTableWithColumns,
  updatePatientResult,
  updatePatientResultWithColumns,
  updateToTable,
  updateToTableWithColumns,
};
