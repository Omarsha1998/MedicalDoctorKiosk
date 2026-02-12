/* eslint-disable no-console */
const util = require("../../../helpers/util");
const sqlHelper = require("../../../helpers/sql");

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
        a.formMainComponent, 
        a.alternativeTestName,
        a.resultComponent, 
        a.smsResultFormat,
        a.displayAllConsultants,
        b.id testComponentId,
        b.code testComponentCode, 
        b.name testComponentName,  
        b.description testComponentDescription,  
        b.sequence, 
        b.groupTitle, 
        b.inputType, 
        b.versionSetId, 
        b.defaultValue,
        b.options,
        b.required,
        b.allowPrintout, 
        b.disabled,
        b.showName,
        d.id referenceRangeId,
        d.ageMinDays,
        d.ageMaxDays,
        d.normalMin,
        d.normalMax,
        d.criticalMin,
        d.criticalMax,
        d.delimiter,
        d.unit,
        d.overrideOldRange,
        b.active, 
        b.dateTimeCreated, 
        b.dateTimeUpdated 
        -- c.headerHtml,
        -- c.contentHtml,
        -- c.footerHtml,
      from 
        UERMResults..Tests a 
        join UERMResults..TestComponents b on b.TestCode = a.Code 
        left join UERMResults..TestComponentReferenceRanges d on d.TestComponentId = b.id 
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

const selectTestComponentFlagging = async function (
  conditions,
  args,
  options,
  txn,
) {
  try {
    const testComponentFlagging = await sqlHelper.query(
      `select 
        ${util.empty(options.top) ? "" : `TOP(${options.top})`}
        a.id,
        a.code,
        a.name,
        a.testCode,
        a.sequence,
        b.gender,
        b.normalMin,
        b.normalMax,
        c.minValue,
        c.maxValue,
        comparisonOperator,
        c.flagType,
        c.label,
        c.createdBy,
        c.updatedBy,
        c.dateTimeCreated,
        c.dateTimeUpdated
      from 
      UERMResults..TestComponents a 
      join UERMResults..TestComponentReferenceRanges b on b.TestComponentId = a.Id and b.active = 1
      join UERMResults..TestComponentFlagging c on c.ComponentReferenceRangeId = b.id and c.active = 1
      where 1=1 ${conditions}
      ${util.empty(options.order) ? "" : `order by ${options.order}`}`,
      args,
      txn,
    );

    return testComponentFlagging;
  } catch (error) {
    console.log(error);
    return error;
  }
};

const selectTestTemplate = async function (conditions, args, options, txn) {
  try {
    const testTemplate = await sqlHelper.query(
      `select 
        ${util.empty(options.top) ? "" : `TOP(${options.top})`}
        a.id,
        a.testCode,
        a.headerHtml,
        a.contentHtml,
        a.footerHtml,
        a.versionSetId,
        b.currentVersion,
        a.active,
        a.createdBy,
        a.updatedBy,
        a.dateTimeCreated,
        a.dateTimeUpdated,
        a.remarks
      from 
      UERMResults..TestTemplates a
      left join UERMResults..VersionSets b on b.id = a.versionSetId and b.active = 1
      where 1=1 ${conditions}
      ${util.empty(options.order) ? "" : `order by ${options.order}`}`,
      args,
      txn,
    );

    return testTemplate;
  } catch (error) {
    console.log(error);
    return error;
  }
};

module.exports = {
  selectTestComponents,
  selectTestComponentFlagging,
  selectTestTemplate,
};
