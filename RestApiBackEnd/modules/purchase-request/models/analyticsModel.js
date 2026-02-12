/* eslint-disable no-console */
const util = require("../../../helpers/util");
const sqlHelper = require("../../../helpers/sql");

const selectAnalytics = async function (conditions, args, options, txn) {
  try {
    const analytics = await sqlHelper.query(
      `SELECT       
        id, 
        code, 
        name,
        description, 
        type, 
        roles, 
        params, 
        query, 
        helperMethod,
        otherHelperMethod, 
        otherHelperCondition,
        columns,
        externalParams,
        valueParams,
        externalConditions,
        internalConditions,
        printout,
        active, 
        createdBy,
        updatedBy, 
        dateTimeCreated, 
        dateTimeUpdated, 
        remarks
      FROM UERMINV..Analytics
        where 1=1
        ${conditions}
    ${util.empty(options.order) ? "" : `order by ${options.order}`}
    `,
      args,
      txn,
    );

    if (analytics.length > 0) {
      for (const list of analytics) {
        const stringifyColumns = JSON.stringify(list.columns);
        list.columns = JSON.parse(stringifyColumns);
      }
    }

    return analytics;
  } catch (error) {
    console.log(error);
    return { error: true, message: error };
  }
};

const getPRWarehouseItems = async function (conditions, args, options, txn) {
  try {
    const analytics = await sqlHelper.query(
      `SELECT 
        code, 
        category, 
        a.description prDescription, 
        dateNeeded, 
        approvedBy, 
        completedBy, 
        a.createdBy, 
        a.updatedBy, 
        dateTimeApproved, 
        dateTimeCompleted, 
        a.dateTimeCreated, 
        a.dateTimeUpdated, 
        a.dateTimeRejected, 
        pri.itemCode, 
        pri.name, 
        pri.description, 
        pri.OtherDescription, 
        pri.unit, 
        pri.quantity, 
        pri.poNo, 
        case when (
          select 
            count(prcode) 
          from 
            UERMINV..PurchaseRequestItems 
          where 
            prCode = code 
            and (
              pono is not null 
              or pono <> ''
            )
        ) > 0 then cast (1 as bit) else cast(0 as bit) end hasPO, 
        case when (
          select 
            count(prCode) 
          from 
            UERMINV..PurchaseRequestItems b 
          where 
            b.prCode = code 
            and b.status = 11
        ) > 0 then cast (1 as bit) else cast(0 as bit) end hasIssuance, 
        (
          SELECT 
            STRING_AGG(name, ', ') AS cat 
          FROM 
            (
              SELECT 
                DISTINCT case when c.name is null then 'NO CATEGORY - NO SUBCATEGORY' else -- c.name
                case when b.InternalCategoryCode = 10 then concat('MEDICINES - ', c.name) else c.name end end name, 
                prCode 
              FROM 
                UERMINV..PurchaseRequestItems a 
                JOIN UERMMMC..Phar_items b ON b.itemCode = a.ItemCode COLLATE SQL_Latin1_General_CP1_CI_AS 
                LEFT JOIN UERMINV..ItemCategory d ON d.CategoryCode = b.ActionCategoryCode COLLATE SQL_Latin1_General_CP1_CI_AS 
                LEFT JOIN UERMINV..ItemSubcategories c ON c.categoryCode = b.InternalCategoryCode COLLATE SQL_Latin1_General_CP1_CI_AS 
                AND c.code = b.ActionCategoryCode COLLATE SQL_Latin1_General_CP1_CI_AS
            ) AS distinct_cats 
          WHERE 
            prCode = a.code
        ) itemCategories 
      from 
        UERMINV..PurchaseRequests a 
        join UERMINV..PurchaseRequestItems pri on pri.PRCode = a.code 
      WHERE 
        1 = 1 
        ${conditions}
    ${util.empty(options.order) ? "" : `order by ${options.order}`}
    `,
      args,
      txn,
    );

    if (analytics.length > 0) {
      for (const list of analytics) {
        if (list.dateTimeCreated !== null) {
          list.dateTimeCreated = util.formatDate2({
            date: list.dateTimeCreated,
          });
        }
        if (list.dateTimeUpdated !== null) {
          list.dateTimeUpdated = util.formatDate2({
            date: list.dateTimeUpdated,
          });
        }
        if (list.dateTimeApproved !== null) {
          list.dateTimeApproved = util.formatDate2({
            date: list.dateTimeApproved,
          });
        }
      }
    }

    return analytics;
  } catch (error) {
    console.log(error);
    return { error: true, message: error };
  }
};

const getRRWarehouseDetailed = async function (conditions, args, options, txn) {
  try {
    const analytics = await sqlHelper.query(
      `SELECT 
        a.rrno
        ,a.suppliercode
        ,b.name supplierName
        ,a.rrdate
        ,a.invoiceno
        ,a.deliverydate
        ,a.receivingdept
        ,c.requestingdept
        ,c.itemCode
        ,d.brandName
        ,d.genName
        ,d.dosageForm
        ,d.mg
        ,c.qty
        ,c.freeQty
        ,c.unitCost
        ,c.discount
        ,c.isFree
        ,c.poNo
        ,c.inventorytype
        ,c.lotno
        ,c.batchno
        ,c.expirationdate
        ,c.manufacturedate
        ,a.amount
        ,a.remarks
        ,a.createdBy
        ,a.datecreated
        ,(
                SELECT 
                  STRING_AGG(name, ', ') AS cat 
                FROM 
                  (
                    SELECT 
                      DISTINCT case when subcat.name is null then 'NO CATEGORY - NO SUBCATEGORY' else -- c.name
                      case when pit.InternalCategoryCode = 10 then concat('MEDICINES - ', subcat.name) else subcat.name end end name,
              pit.itemCode
                    FROM  UERMMMC..Phar_items pit 
                      LEFT JOIN UERMINV..ItemCategory cate ON cate.CategoryCode = pit.ActionCategoryCode COLLATE SQL_Latin1_General_CP1_CI_AS 
                      LEFT JOIN UERMINV..ItemSubcategories subcat ON subcat.categoryCode = pit.InternalCategoryCode COLLATE SQL_Latin1_General_CP1_CI_AS 
                      AND subcat.code = pit.ActionCategoryCode COLLATE SQL_Latin1_General_CP1_CI_AS
                  ) AS distinct_cats 
                WHERE 
            itemCode = c.ItemCode COLLATE SQL_Latin1_General_CP1_CI_AS 
              ) itemCategories 
        FROM [UERMINV].[dbo].[Deliveries] a 
        join UERMMMC..Supplier b on b.code = a.suppliercode collate SQL_Latin1_General_CP1_CI_AS
        join UERMINV..DeliveryDetails c on c.rrno = a.rrno
        join UERMMMC..phar_items d on d.itemCode = c.itemcode collate SQL_Latin1_General_CP1_CI_AS 
        where 1=1
        ${conditions}
    ${util.empty(options.order) ? "" : `order by ${options.order}`}
    `,
      args,
      txn,
    );

    if (analytics.length > 0) {
      for (const list of analytics) {
        if (list.datecreated !== null) {
          list.datecreated = util.formatDate2({
            date: list.datecreated,
          });
        }

        if (list.rrdate !== null) {
          list.rrdate = util.formatDate2({
            date: list.rrdate,
            dateOnly: true,
          });
        }

        if (list.deliverydate !== null) {
          list.deliverydate = util.formatDate2({
            date: list.deliverydate,
            dateOnly: true,
          });
        }

        if (list.manufacturedate !== null) {
          list.manufacturedate = util.formatDate2({
            date: list.manufacturedate,
            dateOnly: true,
          });
        }

        if (list.expirationdate !== null) {
          list.expirationdate = util.formatDate2({
            date: list.expirationdate,
            dateOnly: true,
          });
        }
      }
    }

    return analytics;
  } catch (error) {
    console.log(error);
    return { error: true, message: error };
  }
};

const getRRWarehouse = async function (conditions, args, options, txn) {
  try {
    const analytics = await sqlHelper.query(
      `SELECT 
            a.rrno
            ,a.suppliercode
            ,b.name supplierName
            ,a.rrdate
            ,a.invoiceno
            ,a.deliverydate
            ,a.receivingdept
            ,a.amount
            ,a.remarks
            ,a.createdBy
            ,a.datecreated
        FROM [UERMINV].[dbo].[Deliveries] a 
      join UERMMMC..Supplier b on b.code = a.suppliercode collate SQL_Latin1_General_CP1_CI_AS
      where 1=1
      ${conditions}
    ${util.empty(options.order) ? "" : `order by ${options.order}`}
    `,
      args,
      txn,
    );

    if (analytics.length > 0) {
      for (const list of analytics) {
        if (list.datecreated !== null) {
          list.datecreated = util.formatDate2({
            date: list.datecreated,
          });
        }

        if (list.rrdate !== null) {
          list.rrdate = util.formatDate2({
            date: list.rrdate,
            dateOnly: true,
          });
        }

        if (list.deliverydate !== null) {
          list.deliverydate = util.formatDate2({
            date: list.deliverydate,
            dateOnly: true,
          });
        }

        if (list.manufacturedate !== null) {
          list.manufacturedate = util.formatDate2({
            date: list.manufacturedate,
            dateOnly: true,
          });
        }

        if (list.expirationdate !== null) {
          list.expirationdate = util.formatDate2({
            date: list.expirationdate,
            dateOnly: true,
          });
        }
      }
    }

    return analytics;
  } catch (error) {
    console.log(error);
    return { error: true, message: error };
  }
};

const getRRWarehouseCensus = async function (conditions, args, options, txn) {
  try {
    const analytics = await sqlHelper.query(
      `SELECT
          CONVERT(date, a.rrdate) AS rrdate,
          COUNT(*) AS censusCount
      FROM [UERMINV].[dbo].[Deliveries] a
      WHERE 1=1
      ${conditions}
      GROUP BY CONVERT(date, a.rrdate)
    ${util.empty(options.order) ? "" : `order by ${options.order}`}
    `,
      args,
      txn,
    );

    if (analytics.length > 0) {
      for (const list of analytics) {
        if (list.rrdate !== null) {
          list.rrdate = util.formatDate2({
            date: list.rrdate,
            dateOnly: true,
          });
        }
      }
    }

    return analytics;
  } catch (error) {
    console.log(error);
    return { error: true, message: error };
  }
};

const getRRWarehouseCensusPerDept = async function (
  conditions,
  args,
  options,
  txn,
) {
  try {
    const analytics = await sqlHelper.query(
      `exec UERMINV..Usp_Inv_DeliveryCensusByReceivingDept ${args}`,
      [],
      txn,
    );

    return analytics;
  } catch (error) {
    console.log(error);
    return { error: true, message: error };
  }
};

const getRRWarehouseDetailedCensus = async function (
  conditions,
  args,
  options,
  txn,
) {
  try {
    const analytics = await sqlHelper.query(
      `SELECT
          CONVERT(date, a.rrdate) AS rrdate,
          COUNT(*) AS censusCount
      FROM [UERMINV].[dbo].[Deliveries] a
      JOIN UERMINV..DeliveryDetails c
          ON c.rrno = a.rrno
      WHERE 1=1
      ${conditions}
      GROUP BY CONVERT(date, a.rrdate)
    ${util.empty(options.order) ? "" : `order by ${options.order}`}
    `,
      args,
      txn,
    );

    if (analytics.length > 0) {
      for (const list of analytics) {
        if (list.rrdate !== null) {
          list.rrdate = util.formatDate2({
            date: list.rrdate,
            dateOnly: true,
          });
        }
      }
    }

    return analytics;
  } catch (error) {
    console.log(error);
    return { error: true, message: error };
  }
};

const getRRWarehouseDetailedCensusPerDept = async function (
  conditions,
  args,
  options,
  txn,
) {
  try {
    const analytics = await sqlHelper.query(
      `exec UERMINV..Usp_Inv_DeliveryCensusDetailedByReceivingDept ${args}`,
      [],
      txn,
    );

    return analytics;
  } catch (error) {
    console.log(error);
    return { error: true, message: error };
  }
};

const getPRWarehouseTracker = async function (conditions, args, options, txn) {
  try {
    const prTracker = await sqlHelper.query(
      `exec UERMINV..Usp_jf_GetPurchaseRequestTracker ${args}, '', ''`,
      [],
      txn,
    );

    if (prTracker.length > 0) {
      for (const list of prTracker) {
        if (list.pR_DateTimeCreated !== null) {
          list.pR_DateTimeCreated = util.formatDate2({
            date: list.pR_DateTimeCreated,
          });
        }

        if (list.pR_DateTimeApproved !== null) {
          list.pR_DateTimeApproved = util.formatDate2({
            date: list.pR_DateTimeApproved,
          });
        }

        if (list.rrdate !== null) {
          list.rrdate = util.formatDate2({
            date: list.rrdate,
          });
        }

        if (list.expirationdate !== null) {
          list.expirationdate = util.formatDate2({
            date: list.expirationdate,
          });
        }

        if (list.podate !== null) {
          list.podate = util.formatDate2({
            date: list.podate,
          });
        }

        if (list.podateapproved !== null) {
          list.podateapproved = util.formatDate2({
            date: list.podateapproved,
          });
        }

        if (list.podatecreated !== null) {
          list.podatecreated = util.formatDate2({
            date: list.podatecreated,
          });
        }
      }
    }

    return prTracker;
  } catch (error) {
    console.log(error);
    return { error: true, message: error };
  }
};

const getPRDeptTracker = async function (conditions, args, options, txn) {
  try {
    const prTracker = await sqlHelper.query(
      `exec UERMINV..Usp_jf_GetPurchaseRequestTracker ${args}, '', ''`,
      [],
      txn,
    );

    if (prTracker.length > 0) {
      for (const list of prTracker) {
        if (list.pR_DateTimeCreated !== null) {
          list.pR_DateTimeCreated = util.formatDate2({
            date: list.pR_DateTimeCreated,
          });
        }

        if (list.pR_DateTimeApproved !== null) {
          list.pR_DateTimeApproved = util.formatDate2({
            date: list.pR_DateTimeApproved,
          });
        }

        if (list.rrdate !== null) {
          list.rrdate = util.formatDate2({
            date: list.rrdate,
          });
        }

        if (list.expirationdate !== null) {
          list.expirationdate = util.formatDate2({
            date: list.expirationdate,
          });
        }

        if (list.podate !== null) {
          list.podate = util.formatDate2({
            date: list.podate,
          });
        }

        if (list.podateapproved !== null) {
          list.podateapproved = util.formatDate2({
            date: list.podateapproved,
          });
        }

        if (list.podatecreated !== null) {
          list.podatecreated = util.formatDate2({
            date: list.podatecreated,
          });
        }
      }
    }

    return prTracker;
  } catch (error) {
    console.log(error);
    return { error: true, message: error };
  }
};

module.exports = {
  selectAnalytics,
  getPRWarehouseItems,
  getPRWarehouseTracker,
  getPRDeptTracker,
  getRRWarehouse,
  getRRWarehouseDetailed,
  getRRWarehouseCensus,
  getRRWarehouseCensusPerDept,
  getRRWarehouseDetailedCensus,
  getRRWarehouseDetailedCensusPerDept,
};
