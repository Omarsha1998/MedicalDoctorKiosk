const util = require("../../../helpers/util.js");
const sqlHelper = require("../../../helpers/sql.js");

// MODELS //

const orSchedRecords = require("../models/orSchedRecords.js");
const orRecords = require("../models/orRecords.js");
const patient = require("../../cf4-db-dump/models/patient.js");

// const getAppointeeDept = async function (req, res) {
//   try {
//     const result = await sqlHelper.transact(async (txn) => {
//       // const { code } = req.query;
//       const activeUser = util.currentUserToken(req).code;
//       console.log("activeUser",activeUser)
//       const sqlWhere = ` and isActive = ? and code = ?`;
//       const args = [1, activeUser];
//       const options = {
//         top: "1",
//         order: "",
//       };
//       return await orRecords.selectEmployeeTbl(sqlWhere, args, options, txn);
//     });

//     return res.json(result);
//   } catch (error) {
//     return res
//       .status(500)
//       .json({ error: `Internal Server Error: ${error.message}` });
//   }
// };
const getTATDatas = async function (req, res) {
  try {
    const result = await sqlHelper.transact(async (txn) => {
      const sqlWhere = ` and os.isFinalized = ? and  os.ORType= ?  `;
      const args = [1, "EYESURG"];
      const options = {
        top: "",
        order: "os.dateTimeCreated desc",
      };
      return await orSchedRecords.selectTATDatas(sqlWhere, args, options, txn);
    });

    return res.json(result);
  } catch (error) {
    return res
      .status(500)
      .json({ error: `Internal Server Error: ${error.message}` });
  }
};

const getSpecificTAT = async function (req, res) {
  try {
    const result = await sqlHelper.transact(async (txn) => {
      const { selectedCaseNo } = req.query;

      const sqlWhere = ` and os.isFinalized = ? and  os.ORType= ? and tr.orSchedCode = ?  `;
      const args = [1, "EYESURG", selectedCaseNo];
      const options = {
        top: "",
        order: "os.dateTimeCreated desc",
      };

      // const sqlWhere = `and ts.orSchedCode = ? and active = ?`;
      // const args = [selectedCaseNo, 1];
      // const options = {
      //   top: "",
      //   order: "dateTimeCreated desc",
      // };

      return await orSchedRecords.selectTATDatas(sqlWhere, args, options, txn);
    });

    return res.json(result);
  } catch (error) {
    return res
      .status(500)
      .json({ error: `Internal Server Error: ${error.message}` });
  }
};

const checkifDIscharge = async (proceCode, txn) => {
  // console.log("checkOrbitTAT proceCode:", proceCode);

  const sqlWhere = ` and cases.CASENO = ? and cases.DISCHARGE <> ? and cases.ForORScheduled = ? `;
  const args = [proceCode, "Y", 1];
  const options = {
    top: "",
    order: "dateTimeCreated desc",
  };

  const result = await orSchedRecords.selectOrbitTAT(
    sqlWhere,
    args,
    options,
    txn,
  );

  // return first record if multiple found
  // return result && result.length ? result[0] : null;
  return result || [];
};
// check in cases
const getTodayConfirmedSchedule = async function (req, res) {
  try {
    const result = await sqlHelper.transact(async (txn) => {
      // const sqlWhere = ` and active = ? and initialSchedStatus <> ? OR (isEmergencyCase = ? and initialSchedStatus <> ? )`;
      // const args = [1, "INITIAL", 1, "OR COMPLETED"];
      // const cc = await checkifDIscharge();

      // console.log("cc mo", cc);
      const sqlWhere = `and active = ? and isFinalized = ? and isAdmitted =?  `;
      const args = [1, 0, 1];
      const options = {
        top: "",
        order: "initialDate ASC ",
      };
      return await orSchedRecords.selectInitialSchedule(
        sqlWhere,
        args,
        options,
        txn,
      );
    });

    return res.json(result);
  } catch (error) {
    return res
      .status(500)
      .json({ error: `Internal Server Error: ${error.message}` });
  }
};

const getAppointeeDept = async function (req, res) {
  try {
    const result = await sqlHelper.transact(async (txn) => {
      // const sqlWhere = ` and active = ? and initialSchedStatus <> ? OR (isEmergencyCase = ? and initialSchedStatus <> ? )`;
      // const args = [1, "INITIAL", 1, "OR COMPLETED"];
      const activeUser = util.currentUserToken(req).code;
      // console.log("activeUser", activeUser);
      const sqlWhere = `and is_active = ? and code = ?`;
      const args = [1, activeUser];
      const options = {
        top: "",
        order: "",
      };
      return await orRecords.selectEmployeeTbl(sqlWhere, args, options, txn);
    });
    // console.log("result", result);
    return res.json(result);
  } catch (error) {
    return res
      .status(500)
      .json({ error: `Internal Server Error: ${error.message}` });
  }
};

const getSchedLogProgess = async function (req, res) {
  try {
    const result = await sqlHelper.transact(async (txn) => {
      const { selectedCaseNo } = req.query;

      const sqlWhere = ` and fieldName = ? and orSchedCode = ?`;
      const args = ["initialSchedStatus", selectedCaseNo];
      const options = {
        top: "",
        order: "dateTimeCreated desc",
      };
      return await orSchedRecords.selectOrSchedLogs(
        sqlWhere,
        args,
        options,
        txn,
      );
    });

    return res.json(result);
  } catch (error) {
    return res
      .status(500)
      .json({ error: `Internal Server Error: ${error.message}` });
  }
};
const getSchedLogProgessTAT = async function (req, res) {
  try {
    const result = await sqlHelper.transact(async (txn) => {
      const { selectedCaseNo } = req.query;

      const sqlWhere = `and orSchedCode = ? and active = ?`;
      const args = [selectedCaseNo, 1];
      const options = {
        top: "",
        order: "dateTimeCreated desc",
      };
      return await orSchedRecords.selectOrbitTAT(sqlWhere, args, options, txn);
    });

    return res.json(result);
  } catch (error) {
    return res
      .status(500)
      .json({ error: `Internal Server Error: ${error.message}` });
  }
};
const getAuditTrail = async function (req, res) {
  try {
    const result = await sqlHelper.transact(async (txn) => {
      const { selectedCaseNo } = req.query;
      // console.log("selectedCaseNo:", selectedCaseNo);

      const sqlWhere = `and orSchedCode = ?`;
      const args = [selectedCaseNo];
      const options = {
        top: "",
        order: "dateTimeCreated desc",
      };
      return await orSchedRecords.selectOrSchedLogs(
        sqlWhere,
        args,
        options,
        txn,
      );
    });

    return res.json(result);
  } catch (error) {
    return res
      .status(500)
      .json({ error: `Internal Server Error: ${error.message}` });
  }
};

const getInitialSchedule = async function (req, res) {
  try {
    const result = await sqlHelper.transact(async (txn) => {
      // const sqlWhere = ` and active = ? and initialSchedStatus <> ?`;
      // const args = [1, "COMPLETED"];
      const sqlWhere = ``;
      const args = [];
      const options = {
        top: "",
        order: "initialDate ASC ",
      };
      return await orSchedRecords.selectInitialSchedule(
        sqlWhere,
        args,
        options,
        txn,
      );
    });

    return res.json(result);
  } catch (error) {
    return res
      .status(500)
      .json({ error: `Internal Server Error: ${error.message}` });
  }
};
const getCompletedORschedules = async function (req, res) {
  try {
    const result = await sqlHelper.transact(async (txn) => {
      const sqlWhere = ` and active = ? and isFinalized = ? `;
      const args = [0, 1]; //"OR COMPLETED"
      const options = {
        top: "",
        order: "initialDate desc ",
      };
      return await orSchedRecords.simpleFetchOrSched(
        sqlWhere,
        args,
        options,
        txn,
      );
    });

    return res.json(result);
  } catch (error) {
    return res
      .status(500)
      .json({ error: `Internal Server Error: ${error.message}` });
  }
};
const putLocked = async function (req, res) {
  try {
    const { selectedOpenConfirmedSched, lockStatus } = req.body;

    const activeUser = util.currentUserToken(req).code;
    const lockingStatus = lockStatus;
    await sqlHelper.transact(async (txn) => {
      return await orSchedRecords.updateInitialSchedule(
        {
          isLocked: lockingStatus, // FIX
          lockedBy: activeUser,
          updatedBy: activeUser,
        },
        {
          code: selectedOpenConfirmedSched?.code, // FIX
        },
        txn,
      );
    });

    return res.status(200).json({
      success: true,
      message: "Update successful.",
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
const putInactivate = async function (req, res) {
  try {
    const { selectedOpenConfirmedSched, lockStatus } = req.body;
    // console.log("selectedOpenConfirmedSched", selectedOpenConfirmedSched);
    // console.log("lockStatus", lockStatus);
    const activeUser = util.currentUserToken(req).code;
    const lockingStatus = lockStatus;
    await sqlHelper.transact(async (txn) => {
      return await orSchedRecords.updateInitialSchedule(
        {
          initialSchedStatus: selectedOpenConfirmedSched?.initialSchedStatus,
          isLocked: lockingStatus, // FIX
          updatedBy: activeUser,
          active: false,
          isFinalized: true,
        },
        {
          code: selectedOpenConfirmedSched?.code, // FIX
        },
        txn,
      );
    });

    return res.status(200).json({
      success: true,
      message: "Update successful.",
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
const getSchedsOfSelectedCase = async function (req, res) {
  try {
    const result = await sqlHelper.transact(async (txn) => {
      const { selectedRowCase } = req.query;

      const sqlWhere = ` and active = ? and caseNo = ?`;
      const args = [1, selectedRowCase];
      const options = {
        top: "",
        order: "initialDate ASC ",
      };
      return await orSchedRecords.selectInitialSchedule(
        sqlWhere,
        args,
        options,
        txn,
      );
    });

    return res.json(result);
  } catch (error) {
    return res
      .status(500)
      .json({ error: `Internal Server Error: ${error.message}` });
  }
};

const getAdmittedPx = async function (req, res) {
  try {
    const result = await sqlHelper.transact(async (txn) => {
      const sqlWhere = ` and cases.DISCHARGE <> ? and cases.ForORScheduled = ? `;
      const args = ["Y", 1];
      const options = {
        top: "100",
        order: "cases.DATEAD desc",
      };
      return await orSchedRecords.selectAdmittedPx(
        sqlWhere,
        args,
        options,
        txn,
      );
    });

    return res.json(result);
  } catch (error) {
    return res
      .status(500)
      .json({ error: `Internal Server Error: ${error.message}` });
  }
};

const checkSchedule = async (proceCode, txn) => {
  const sqlWhere = `and code = ? and active = ?`;
  const args = [proceCode, 1];
  const options = {
    top: "",
    order: "dateTimeCreated desc",
  };

  const result = await orSchedRecords.selectInitialSchedule(
    sqlWhere,
    args,
    options,
    txn,
  );

  // return first record if multiple found
  return result && result.length ? result[0] : null;
};
const checkOrbitTAT = async (proceCode, txn) => {
  // console.log("checkOrbitTAT proceCode:", proceCode);
  const sqlWhere = `and orSchedCode = ? and active = ?`;
  const args = [proceCode, 1];
  const options = {
    top: "",
    order: "dateTimeCreated desc",
  };

  const result = await orSchedRecords.selectOrbitTAT(
    sqlWhere,
    args,
    options,
    txn,
  );

  // return first record if multiple found
  // return result && result.length ? result[0] : null;
  return result || [];
};
// To check if already encoded na yung status sa TAT if yes for UPDATE na sya
const checkSchedStatusExist = async (proceCode, schedTAT, txn) => {
  // console.log("checkOrbitTAT proceCode:", proceCode);
  const sqlWhere = `and orSchedCode = ? and active = ? and initialSchedStatus = ?`;
  const args = [proceCode, 1, schedTAT];
  const options = {
    top: "",
    order: "dateTimeCreated desc",
  };

  const result = await orSchedRecords.selectOrbitTAT(
    sqlWhere,
    args,
    options,
    txn,
  );

  // return first record if multiple found
  // return result && result.length ? result[0] : null;
  return result || [];
};
const normalizeValue = (key, value) => {
  if (value == null) return "";

  // room dropdown
  if (key === "room" && typeof value === "object") {
    return value.value ?? "";
  }

  // date
  if (key === "initialDate") {
    const date = new Date(value);
    if (isNaN(date)) return "";
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}/${m}/${d}`;
  }

  return value;
};
const putArrivedInOr = async function (req, res) {
  try {
    const { selectedOpenConfirmedSched, valPass, initialStatusLogs, newFiled } =
      req.body;
    // console.log("newFiled", newFiled);
    // console.log(
    //   "selectedOpenConfirmedSched.code",
    //   selectedOpenConfirmedSched.code,
    // );
    const oldRecord = await checkSchedule(selectedOpenConfirmedSched.code);
    const existingTATRecord = await checkOrbitTAT(
      selectedOpenConfirmedSched.code,
    );
    // console.log("existingTATRecord", existingTATRecord);
    const activeUser = util.currentUserToken(req).code;

    const fieldMap = {
      room: "room",
      initialDate: "initialDate",
      initialSchedStatus: "initialSchedStatus",
      remarks: "remarks",
      initialTime: "initialTime",
    };

    const modifiedData2 = {};
    const existingMap = {};
    for (const rec of existingTATRecord) {
      existingMap[rec.code] = rec;
    }

    for (const [oldKey, newKey] of Object.entries(fieldMap)) {
      const rawOldValue = oldRecord[oldKey];

      const oldValue = normalizeValue(oldKey, rawOldValue);
      const rawNewValue = selectedOpenConfirmedSched[newKey];
      const newValue = normalizeValue(oldKey, rawNewValue);

      if (oldValue !== newValue) {
        modifiedData2[oldKey] = {
          old: oldValue,
          new: newValue,
        };
      }
    }

    //PAHABOL NA TAT
    if (
      newFiled &&
      newFiled.remarks &&
      Object.keys(newFiled.remarks).length > 0
    ) {
      await sqlHelper.transact(async (txn) => {
        const groupInsertCode = await sqlHelper.generateUniqueCode(
          "[UERMMMC].[dbo].[OrbitTAT]",
          "GIC",
          4,
          txn,
        );

        for (const [statusTitle, remark] of Object.entries(newFiled.remarks)) {
          const generatedCode = await sqlHelper.generateUniqueCode(
            "[UERMMMC].[dbo].[OrbitTAT]",
            "LOG",
            4,
            txn,
          );

          const payload = {
            code: generatedCode,
            caseNo: selectedOpenConfirmedSched.caseNo,
            fieldName: "initialSchedStatus",
            initialSchedStatus: statusTitle,
            orSchedCode: selectedOpenConfirmedSched.code,
            createdBy: activeUser,
            groupCode: groupInsertCode,
            remarks: remark || null,
            active: 1,
          };

          await orSchedRecords.insertOrbitTAT(payload, txn);
        }
        // }

        return true; // so the transaction resolves with something
      });
    }

    for (const change of initialStatusLogs) {
      //UPDATING NA LANG pero sa TAT TABLE
      if (!change || !change.code) continue;

      const oldRec = existingMap[change.code];
      if (!oldRec) continue; // safety

      const oldRemarks = (oldRec.remarks || "").trim();
      const newRemarks = (change.remarks || "").trim();

      if (oldRemarks === newRemarks) {
        continue;
      }

      await sqlHelper.transact(async (txn) => {
        return await orSchedRecords.updateTATLog(
          {
            remarks: newRemarks,
            updatedBy: activeUser,
          },
          {
            code: change.code,
          },
          txn,
        );
      });

      //    // LOGS INSERT START
      // await sqlHelper.transact(async (txn) => {
      //   const groupInsertCode = await sqlHelper.generateUniqueCode(
      //     "[UERMMMC].[dbo].[OrbitSchedLogs]",
      //     "GIC",
      //     4,
      //     txn,
      //   );
      //   const generatedCode = await sqlHelper.generateUniqueCode(
      //     "[UERMMMC].[dbo].[OrbitSchedLogs]",
      //     "LOG",
      //     4,
      //     txn,
      //   );

      //   const payload = {
      //     code: generatedCode,
      //     caseNo: selectedOpenConfirmedSched.caseNo,
      //     fieldName: "remarks",
      //     orSchedCode: selectedOpenConfirmedSched.code,
      //     // prevousColValue: selectedOpenConfirmedSched.initialSchedStatus,
      //     newColValue: newRemarks,
      //     createdBy: activeUser,
      //     groupCode: groupInsertCode,
      //     remarks: newRemarks,
      //   };

      //   await orSchedRecords.insertSchedLogs(payload, txn);
      //   // }

      //   return true; // so the transaction resolves with something
      // });
    }
    // await sqlHelper.transact(async (txn) => {

    // return await orSchedRecords.updateTATLog(
    //     {

    //    remarks: modifiedData2.remarks?.new,
    //       initialTime: modifiedData2.initialTime?.new,
    //       initialDate: modifiedData2.initialDate?.new,
    //       room: modifiedData2.room?.new,
    //       initialSchedStatus: modifiedData2.initialSchedStatus?.new,
    //       updatedBy: activeUser,
    //          isFinalized: true,
    //     },
    //     {
    //       code: selectedOpenConfirmedSched?.code, // FIX
    //     },
    //     txn,
    //   );

    //   // return await orSchedRecords.updateInitialSchedule(
    //   //   {
    //   //     // initialSchedStatus: valPass, // FIX
    //   //     // updatedBy: activeUser,
    //   //     // isFinalized: true,
    //   //  remarks: modifiedData2.remarks?.new,
    //   //     initialTime: modifiedData2.initialTime?.new,
    //   //     initialDate: modifiedData2.initialDate?.new,
    //   //     room: modifiedData2.room?.new,
    //   //     initialSchedStatus: modifiedData2.initialSchedStatus?.new,
    //   //     updatedBy: activeUser,
    //   //        isFinalized: true,
    //   //   },
    //   //   {
    //   //     code: selectedOpenConfirmedSched?.code, // FIX
    //   //   },
    //   //   txn,
    //   // );
    // });

    return res.status(200).json({
      success: true,
      message: "Update successful.",
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
// FOR TIME pa lang copy and working do not delete
// const updateDetails = async function (req, res) {
//   try {
//     const { selectedInitialSched } = req.body;
//     const oldRecord = await checkSchedule(selectedInitialSched.code);
//     const activeUser = util.currentUserToken(req).code;

//     const fieldMap = {
//       room: "room",
//       initialDate: "initialDate",
//       initialSchedStatus: "initialSchedStatus",
//       remarks: "remarks",
//       initialTime: "initialTime",
//     };

//     const modifiedData2 = {};

//     for (const [oldKey, newKey] of Object.entries(fieldMap)) {
//       const rawOldValue = oldRecord[oldKey];
//       const rawNewValue = selectedInitialSched[newKey];

//       const oldValue = normalizeValue(oldKey, rawOldValue);
//       const newValue = normalizeValue(oldKey, rawNewValue);

//       if (oldValue !== newValue) {
//         modifiedData2[oldKey] = {
//           old: oldValue,
//           new: newValue,
//         };
//       }
//     }
//     let isFinalizedValue;

//     if (modifiedData2.initialSchedStatus?.new === "CANCELLED") {
//       isFinalizedValue = true;
//     }

//     /* =========================
//        UPDATE MAIN RECORD
//     ========================= */

//     await sqlHelper.transact(async (txn) => {
//       const payload = {
//         remarks: modifiedData2.remarks?.new,
//         initialTime: modifiedData2.initialTime?.new,
//         initialDate: modifiedData2.initialDate?.new,
//         room: modifiedData2.room?.new,
//         initialSchedStatus: modifiedData2.initialSchedStatus?.new,
//         updatedBy: activeUser,
//       };

//       // ONLY add isFinalized kung CANCELLED
//       if (isFinalizedValue === true) {
//         payload.isFinalized = true;
//         payload.isCancel = true;
//         payload.active = false;
//       }

//       return await orSchedRecords.updateInitialSchedule(
//         payload,
//         { code: selectedInitialSched.code },
//         txn,
//       );

//       // return await orSchedRecords.updateInitialSchedule(
//       //   {
//       //     remarks: modifiedData2.remarks?.new,
//       //     initialTime: modifiedData2.initialTime?.new,
//       //     isFinalized: modifiedData2.isFinalized?.new,
//       //     initialDate: modifiedData2.initialDate?.new,
//       //     room: modifiedData2.room?.new,
//       //     initialSchedStatus: modifiedData2.initialSchedStatus?.new,
//       //     updatedBy: activeUser,
//       //   },
//       //   { code: selectedInitialSched.code },
//       //   txn,
//       // );
//     });

//     /* =========================
//        INSERT TATS
//     ========================= */
//     // await sqlHelper.transact(async (txn) => {
//     //   const groupInsertCode = await sqlHelper.generateUniqueCode(
//     //     "[UERMMMC].[dbo].[OrbitTAT]",
//     //     "GIC",
//     //     4,
//     //     txn,
//     //   );

//     //   for (const fieldName in modifiedData2) {
//     //     const change = modifiedData2[fieldName];
//     //     if (!change) continue;

//     //     const generatedCode = await sqlHelper.generateUniqueCode(
//     //       "[UERMMMC].[dbo].[OrbitTAT]",
//     //       "TAT",
//     //       4,
//     //       txn,
//     //     );

//     //     const payload = {
//     //       code: generatedCode,
//     //       caseNo: selectedInitialSched.caseNo,
//     //       fieldName,
//     //       orSchedCode: selectedInitialSched.code,
//     //       prevousColValue: String(change.old),
//     //       initialSchedStatus: String(change.new),
//     //       createdBy: activeUser,
//     //       groupCode: groupInsertCode,
//     //     };

//     //     await orSchedRecords.insertTATLogs(payload, txn);
//     //   }

//     //   return true;
//     // });

//     /* =========================
//        INSERT LOGS
//     ========================= */
//     await sqlHelper.transact(async (txn) => {
//       const groupInsertCode = await sqlHelper.generateUniqueCode(
//         "[UERMMMC].[dbo].[OrbitSchedLogs]",
//         "GIC",
//         4,
//         txn,
//       );

//       for (const fieldName in modifiedData2) {
//         const change = modifiedData2[fieldName];
//         if (!change) continue;

//         const generatedCode = await sqlHelper.generateUniqueCode(
//           "[UERMMMC].[dbo].[OrbitSchedLogs]",
//           "LOG",
//           4,
//           txn,
//         );

//         const payload = {
//           code: generatedCode,
//           caseNo: selectedInitialSched.caseNo,
//           fieldName,
//           orSchedCode: selectedInitialSched.code,
//           prevousColValue: String(change.old),
//           newColValue: String(change.new),
//           createdBy: activeUser,
//           groupCode: groupInsertCode,
//         };

//         await orSchedRecords.insertSchedLogs(payload, txn);
//       }

//       return true;
//     });

//     return res.status(200).json({
//       success: true,
//       message: "Update successful.",
//     });
//   } catch (error) {
//     return res.status(500).json({ error: error.message });
//   }
// };
const updateDetails = async function (req, res) {
  try {
    const { selectedInitialSched } = req.body;
    const oldRecord = await checkSchedule(selectedInitialSched.code);
    const activeUser = util.currentUserToken(req).code;

    const fieldMap = {
      room: "room",
      initialDate: "initialDate",
      initialSchedStatus: "initialSchedStatus",
      remarks: "remarks",
      initialTime: "initialTime",
    };

    const modifiedData2 = {};

    for (const [oldKey, newKey] of Object.entries(fieldMap)) {
      const rawOldValue = oldRecord[oldKey];
      const rawNewValue = selectedInitialSched[newKey];

      const oldValue = normalizeValue(oldKey, rawOldValue);
      const newValue = normalizeValue(oldKey, rawNewValue);

      if (oldValue !== newValue) {
        modifiedData2[oldKey] = {
          old: oldValue,
          new: newValue,
        };
      }
    }
    let isFinalizedValue;

    if (modifiedData2.initialSchedStatus?.new === "CANCELLED") {
      isFinalizedValue = true;
    }

    /* =========================
       UPDATE MAIN RECORD
    ========================= */

    await sqlHelper.transact(async (txn) => {
      const payload = {
        remarks: modifiedData2.remarks?.new,
        initialTime: modifiedData2.initialTime?.new,
        initialDate: modifiedData2.initialDate?.new,
        room: modifiedData2.room?.new,
        initialSchedStatus: modifiedData2.initialSchedStatus?.new,
        updatedBy: activeUser,
      };

      // ONLY add isFinalized kung CANCELLED
      if (isFinalizedValue === true) {
        payload.isFinalized = true;
        payload.isCancel = true;
        payload.active = false;
      }

      return await orSchedRecords.updateInitialSchedule(
        payload,
        { code: selectedInitialSched.code },
        txn,
      );

      // return await orSchedRecords.updateInitialSchedule(
      //   {
      //     remarks: modifiedData2.remarks?.new,
      //     initialTime: modifiedData2.initialTime?.new,
      //     isFinalized: modifiedData2.isFinalized?.new,
      //     initialDate: modifiedData2.initialDate?.new,
      //     room: modifiedData2.room?.new,
      //     initialSchedStatus: modifiedData2.initialSchedStatus?.new,
      //     updatedBy: activeUser,
      //   },
      //   { code: selectedInitialSched.code },
      //   txn,
      // );
    });

    /* =========================
       INSERT LOGS 
    ========================= */
    await sqlHelper.transact(async (txn) => {
      const groupInsertCode = await sqlHelper.generateUniqueCode(
        "[UERMMMC].[dbo].[OrbitSchedLogs]",
        "GIC",
        4,
        txn,
      );

      for (const fieldName in modifiedData2) {
        const change = modifiedData2[fieldName];
        if (!change) continue;

        const generatedCode = await sqlHelper.generateUniqueCode(
          "[UERMMMC].[dbo].[OrbitSchedLogs]",
          "LOG",
          4,
          txn,
        );

        const payload = {
          code: generatedCode,
          caseNo: selectedInitialSched.caseNo,
          fieldName,
          orSchedCode: selectedInitialSched.code,
          prevousColValue: String(change.old),
          newColValue: String(change.new),
          createdBy: activeUser,
          groupCode: groupInsertCode,
        };

        await orSchedRecords.insertSchedLogs(payload, txn);
      }

      return true;
    });

    return res.status(200).json({
      success: true,
      message: "Update successful.",
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const putInitialSched = async function (req, res) {
  try {
    // console.log("PUT INITIAL SCHED REACHED");
    const { selectedInitialSched, verifyAdmittedPatient, isAdmit } = req.body;
    const oldRecord = await checkSchedule(selectedInitialSched.code);
    // console.log("isAdmit:", isAdmit);
    // console.log("OLD RECORD:", selectedInitialSched);
    // console.log("verifyAdmittedPatient:", verifyAdmittedPatient);
    const activeUser = util.currentUserToken(req).code;

    // Map old record fields to new patient fields
    const fieldMap = {
      caseNo: "cASENO",
      patientFirstName: "fIRSTNAME",
      patientLastName: "lASTNAME",
      patientMiddleName: "mIDDLENAME",
      patientNo: "pATIENTNO",
      initialProcedure: "initialProcedure",
      initialSchedStatus: "initialSchedStatus",
      isEmergencyCase: "isEmergencyCase",
    };
    const formatDateForCompare = (isoString) => {
      if (!isoString) return "";
      const date = new Date(isoString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}/${month}/${day}`; // 2026/01/08
    };
    const modifiedData = {};
    const modifiedData2 = {};

    // Compare old vs new data using the mapping
    for (const [oldKey, newKey] of Object.entries(fieldMap)) {
      let oldValue = oldRecord[oldKey] ?? "";
      const newValue = verifyAdmittedPatient[newKey] ?? "";
      // Format dates if this is initialDate
      if (oldKey === "initialDate" && oldValue) {
        oldValue = formatDateForCompare(oldValue);
      }

      if (oldValue !== newValue) {
        modifiedData[oldKey] = {
          old: oldValue,
          new: newValue,
        };
      }
    }

    for (const [oldKey, newKey] of Object.entries(fieldMap)) {
      let oldValue = oldRecord[oldKey] ?? "";
      // console.log("oldValue:", oldValue);
      const newValue = selectedInitialSched[newKey] ?? "";
      // console.log("newValue:", newValue);
      // Format dates if this is initialDate
      if (oldKey === "initialDate" && oldValue) {
        oldValue = formatDateForCompare(oldValue);
      }

      if (oldValue !== newValue) {
        // console.log("field oldValue:", oldValue);
        // console.log("field newValue:", newValue);
        modifiedData2[oldKey] = {
          old: oldValue,
          new: newValue,
        };
      }
    }

    const initialSchedStatus = isAdmit
      ? "CONFIRMED"
      : modifiedData2.initialSchedStatus?.new ?? oldRecord.initialSchedStatus;

    if (isAdmit && oldRecord.initialSchedStatus !== "CONFIRMED") {
      modifiedData2.initialSchedStatus = {
        old: oldRecord.initialSchedStatus,
        new: "CONFIRMED",
      };
    }

    await sqlHelper.transact(async (txn) => {
      // console.log(
      //   " modifiedData.isEmergencyCase?.new",
      //   modifiedData.isEmergencyCase?.new,
      // );
      // console.log(
      //   " modifiedData2.isEmergencyCase?.new",
      //   modifiedData2.isEmergencyCase?.new,
      // );
      // console.log(" modifiedDatsfdvcdzxcvw", modifiedData);
      // console.log("saddddddddddddddw", modifiedData2);
      return await orSchedRecords.updateInitialSchedule(
        {
          initialSchedStatus,
          remarks: modifiedData2.remarks?.new,
          initialTime: modifiedData2.timePart?.new,
          initialDate: modifiedData2.datePart?.new,
          caseNo: modifiedData.caseNo?.new,
          patientFirstName: modifiedData.patientFirstName?.new,
          patientLastName: modifiedData.patientLastName?.new,
          patientMiddleName: modifiedData.patientMiddleName?.new,
          patientNo: modifiedData.patientNo?.new,
          initialProcedure: modifiedData2.initialProcedure?.new,
          isEmergencyCase: modifiedData2.isEmergencyCase?.new,
          isAdmitted: isAdmit,
          updatedBy: activeUser,
        },
        { code: selectedInitialSched.code },
        txn,
      );
    });

    // LOGS INSERT START
    await sqlHelper.transact(async (txn) => {
      const groupInsertCode = await sqlHelper.generateUniqueCode(
        "[UERMMMC].[dbo].[OrbitSchedLogs]",
        "GIC",
        4,
        txn,
      );

      for (const fieldName in modifiedData2) {
        const change = modifiedData2[fieldName];
        if (!change) continue; // safety check

        const generatedCode = await sqlHelper.generateUniqueCode(
          "[UERMMMC].[dbo].[OrbitSchedLogs]",
          "LOG",
          4,
          txn,
        );

        const payload = {
          code: generatedCode,
          caseNo: verifyAdmittedPatient.cASENO,
          fieldName,
          orSchedCode: selectedInitialSched.code,
          prevousColValue: change.old,
          newColValue: change.new,
          createdBy: activeUser,
          groupCode: groupInsertCode,
        };

        await orSchedRecords.insertSchedLogs(payload, txn);
      }

      return true; // so the transaction resolves with something
    });
    return res.status(200).json({
      success: true,
      message: "Update successful.",
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
const putTrackProgress = async function (req, res) {
  try {
    const { selectedOpenConfirmedSched, title, step, rems } = req.body;
    // console.log("rems", rems);
    const activeUser = util.currentUserToken(req).code;

    const existingSchedStatTitle = await checkSchedStatusExist(
      selectedOpenConfirmedSched.code,
      title,
    );
    if (existingSchedStatTitle.length > 0) {
      // console.log("existingSchedStatTitle", existingSchedStatTitle);
      const oldRemarks = (existingSchedStatTitle[0].remarks || "").trim();
      const newRemarks = (rems || "").trim();
      // console.log("oldRemarks", oldRemarks);
      // console.log("newRemarks", newRemarks);
      if (oldRemarks !== newRemarks) {
        await sqlHelper.transact(async (txn) => {
          return await orSchedRecords.updateTATLog(
            {
              remarks: newRemarks,
              updatedBy: activeUser,
            },
            {
              code: existingSchedStatTitle[0].code,
            },
            txn,
          );
        });
      }
    } else {
      // LOGS INSERT START
      await sqlHelper.transact(async (txn) => {
        return await orSchedRecords.updateInitialSchedule(
          {
            initialSchedStatus: title,
            progressLevel: selectedOpenConfirmedSched.progressLevel,
            updatedBy: activeUser,
          },
          { code: selectedOpenConfirmedSched.code },
          txn,
        );
      });
      await sqlHelper.transact(async (txn) => {
        const groupInsertCode = await sqlHelper.generateUniqueCode(
          "[UERMMMC].[dbo].[OrbitTAT]",
          "GIC",
          4,
          txn,
        );
        const generatedCode = await sqlHelper.generateUniqueCode(
          "[UERMMMC].[dbo].[OrbitTAT]",
          "TAT",
          4,
          txn,
        );

        const payload = {
          code: generatedCode,
          caseNo: selectedOpenConfirmedSched.caseNo,
          fieldName: "initialSchedStatus",
          orSchedCode: selectedOpenConfirmedSched.code,
          // prevousColValue: selectedOpenConfirmedSched.initialSchedStatus,
          initialSchedStatus: title,
          createdBy: activeUser,
          groupCode: groupInsertCode,
          remarks: rems,
        };

        await orSchedRecords.insertTATLogs(payload, txn);
        // }

        return true; // so the transaction resolves with something
      });
    }

    // LOGS INSERT START
    await sqlHelper.transact(async (txn) => {
      const groupInsertCode = await sqlHelper.generateUniqueCode(
        "[UERMMMC].[dbo].[OrbitSchedLogs]",
        "GIC",
        4,
        txn,
      );
      const generatedCode = await sqlHelper.generateUniqueCode(
        "[UERMMMC].[dbo].[OrbitSchedLogs]",
        "LOG",
        4,
        txn,
      );

      const payload = {
        code: generatedCode,
        caseNo: selectedOpenConfirmedSched.caseNo,
        fieldName: "initialSchedStatus",
        orSchedCode: selectedOpenConfirmedSched.code,
        // prevousColValue: selectedOpenConfirmedSched.initialSchedStatus,
        newColValue: title,
        createdBy: activeUser,
        groupCode: groupInsertCode,
        remarks: rems,
      };

      await orSchedRecords.insertSchedLogs(payload, txn);
      // }

      return true; // so the transaction resolves with something
    });
    return res.status(200).json({
      success: true,
      message: "Update successful.",
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const putInitialSchedHIMSVerified = async function (req, res) {
  try {
    // console.log("PUT HIMS VERIFIED REACHED");
    const { selectedInitialSched } = req.body;
    const oldRecord = await checkSchedule(selectedInitialSched.code);

    const activeUser = util.currentUserToken(req).code;
    // const scheduleStatusUpdate = "CONFIRMED";
    // Map old record fields to new patient fields
    const fieldMap = {
      // caseNo: "cASENO",
      // patientFirstName: "fIRSTNAME",
      // patientLastName: "lASTNAME",
      // patientMiddleName: "mIDDLENAME",
      remarks: "remarks",
      initialTime: "initialTime",
      initialDate: "initialDate",
      initialProcedure: "initialProcedure",
      initialSchedStatus: "initialSchedStatus",
      slotStatus: "slotStatus",
    };

    // const modifiedData = {};
    const modifiedData2 = {};

    // Compare old vs new data using the mapping
    // for (const [oldKey, newKey] of Object.entries(fieldMap)) {
    //   const oldValue = oldRecord[oldKey] ?? "";
    //   const newValue = verifyAdmittedPatient[newKey] ?? "";

    //   if (oldValue !== newValue) {
    //     modifiedData[oldKey] = {
    //       old: oldValue,
    //       new: newValue,
    //     };
    //   }
    // }

    for (const [oldKey, newKey] of Object.entries(fieldMap)) {
      const oldValue = oldRecord[oldKey] ?? "";
      const newValue = selectedInitialSched[newKey] ?? "";

      if (oldValue !== newValue) {
        modifiedData2[oldKey] = {
          old: oldValue,
          new: newValue,
        };
      }
    }

    const derivedInitialStatus =
      modifiedData2.initialSchedStatus?.new ??
      (modifiedData2.isEmergencyCase || modifiedData2.slotStatus
        ? "CONFIRMED"
        : "INITIAL") ??
      oldRecord.initialSchedStatus;
    await sqlHelper.transact(async (txn) => {
      return await orSchedRecords.updateInitialSchedule(
        {
          initialSchedStatus: derivedInitialStatus,

          slotStatus: modifiedData2.slotStatus?.new ?? oldRecord.slotStatus,
          // remarks: modifiedData2.remarks,
          // initialTime: modifiedData2.timePart,
          // initialDate: modifiedData2.datePart,
          // caseNo: modifiedData2.caseNo.new,
          // patientFirstName: modifiedData2.patientFirstName.new,
          // patientLastName: modifiedData2.patientLastName.new,
          // patientMiddleName: modifiedData2.patientMiddleName.new,
          // initialProcedure: modifiedData2.initialProcedure.new,
          remarks: modifiedData2.remarks?.new ?? oldRecord.remarks,
          initialTime: modifiedData2.initialTime?.new ?? oldRecord.initialTime,
          initialDate: modifiedData2.initialDate?.new ?? oldRecord.initialDate,
          // initialProcedure: modifiedData2.initialProcedure.new,
          initialProcedure:
            modifiedData2.initialProcedure?.new ?? oldRecord.initialProcedure,
          isAdmitted: true,
          updatedBy: activeUser,
        },
        {
          code: selectedInitialSched?.code, // FIX
        },
        txn,
      );
    });
    // LOGS INSERT START
    await sqlHelper.transact(async (txn) => {
      const groupInsertCode = await sqlHelper.generateUniqueCode(
        "[UERMMMC].[dbo].[OrbitSchedLogs]",
        "GIC",
        4,
        txn,
      );

      for (const fieldName in modifiedData2) {
        const change = modifiedData2[fieldName];
        if (!change) continue; // safety check

        const generatedCode = await sqlHelper.generateUniqueCode(
          "[UERMMMC].[dbo].[OrbitSchedLogs]",
          "LOG",
          4,
          txn,
        );

        const payload = {
          code: generatedCode,
          caseNo: change.caseNo,
          fieldName,
          orSchedCode: selectedInitialSched.code,
          prevousColValue: change.old,
          newColValue: change.new,
          createdBy: activeUser,
          groupCode: groupInsertCode,
        };

        await orSchedRecords.insertSchedLogs(payload, txn);
      }

      return true; // so the transaction resolves with something
    });
    return res.status(200).json({
      success: true,
      message: "Update successful.",
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// allowing to update px details since not admitted pa or HIMS Verified
const putAliasScheduling = async function (req, res) {
  try {
    const { selectedInitialSched } = req.body;
    const oldRecord = await checkSchedule(selectedInitialSched.code);

    const activeUser = util.currentUserToken(req).code;
    // const scheduleStatusUpdate = "CONFIRMED";
    // Map old record fields to new patient fields
    const fieldMap = {
      caseNo: "caseNo",
      patientFirstName: "patientFirstName",
      patientLastName: "patientLastName",
      patientMiddleName: "patientMiddleName",
      remarks: "remarks",
      initialTime: "initialTime",
      initialDate: "initialDate",
      initialProcedure: "initialProcedure",
      slotStatus: "slotStatus",
      isEmergencyCase: "isEmergencyCase",
    };

    // const modifiedData = {};
    const modifiedData2 = {};

    // Compare old vs new data using the mapping
    // for (const [oldKey, newKey] of Object.entries(fieldMap)) {
    //   const oldValue = oldRecord[oldKey] ?? "";
    //   const newValue = verifyAdmittedPatient[newKey] ?? "";

    //   if (oldValue !== newValue) {
    //     modifiedData[oldKey] = {
    //       old: oldValue,
    //       new: newValue,
    //     };
    //   }
    // }
    const formatDateForCompare = (isoString) => {
      if (!isoString) return "";
      const date = new Date(isoString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}/${month}/${day}`; // 2026/01/08
    };
    for (const [oldKey, newKey] of Object.entries(fieldMap)) {
      let oldValue = oldRecord[oldKey] ?? "";
      const newValue = selectedInitialSched[newKey] ?? "";
      if (oldKey === "initialDate" && oldValue) {
        oldValue = formatDateForCompare(oldValue);
      }

      if (oldValue !== newValue) {
        modifiedData2[oldKey] = {
          old: oldValue,
          new: newValue,
        };
      }
    }

    const derivedInitialStatus =
      modifiedData2.initialSchedStatus?.new ??
      (modifiedData2.isEmergencyCase || modifiedData2.slotStatus
        ? "CONFIRMED"
        : "INITIAL") ??
      oldRecord.initialSchedStatus;
    await sqlHelper.transact(async (txn) => {
      return await orSchedRecords.updateInitialSchedule(
        {
          initialSchedStatus: derivedInitialStatus,
          caseNo: modifiedData2.caseNo?.new ?? oldRecord.caseNo,
          patientFirstName:
            modifiedData2.patientFirstName?.new ?? oldRecord.patientFirstName,
          patientLastName:
            modifiedData2.patientLastName?.new ?? oldRecord.patientLastName,
          patientMiddleName:
            modifiedData2.patientMiddleName?.new ?? oldRecord.patientMiddleName,
          slotStatus: modifiedData2.slotStatus?.new ?? oldRecord.slotStatus,
          // remarks: modifiedData2.remarks,
          // initialTime: modifiedData2.timePart,
          // initialDate: modifiedData2.datePart,
          // caseNo: modifiedData2.caseNo.new,
          // patientFirstName: modifiedData2.patientFirstName.new,
          // patientLastName: modifiedData2.patientLastName.new,
          // patientMiddleName: modifiedData2.patientMiddleName.new,
          // initialProcedure: modifiedData2.initialProcedure.new,
          remarks: modifiedData2.remarks?.new ?? oldRecord.remarks,
          initialTime: modifiedData2.initialTime?.new ?? oldRecord.initialTime,
          initialDate: modifiedData2.initialDate?.new ?? oldRecord.initialDate,
          // initialProcedure: modifiedData2.initialProcedure.new,
          initialProcedure:
            modifiedData2.initialProcedure?.new ?? oldRecord.initialProcedure,
          isAdmitted: modifiedData2.isAdmitted?.new ?? oldRecord.isAdmitted,
          isEmergencyCase:
            modifiedData2.isEmergencyCase?.new ?? oldRecord.isEmergencyCase,

          updatedBy: activeUser,
        },
        {
          code: selectedInitialSched?.code, // FIX
        },
        txn,
      );
    });
    // LOGS INSERT START
    await sqlHelper.transact(async (txn) => {
      const groupInsertCode = await sqlHelper.generateUniqueCode(
        "[UERMMMC].[dbo].[OrbitSchedLogs]",
        "GIC",
        4,
        txn,
      );

      for (const fieldName in modifiedData2) {
        const change = modifiedData2[fieldName];
        if (!change) continue; // safety check

        const generatedCode = await sqlHelper.generateUniqueCode(
          "[UERMMMC].[dbo].[OrbitSchedLogs]",
          "LOG",
          4,
          txn,
        );

        const payload = {
          code: generatedCode,
          caseNo: change.caseNo,
          fieldName,
          orSchedCode: selectedInitialSched.code,
          prevousColValue: change.old,
          newColValue: change.new,
          createdBy: activeUser,
          groupCode: groupInsertCode,
        };

        await orSchedRecords.insertSchedLogs(payload, txn);
      }

      return true; // so the transaction resolves with something
    });
    return res.status(200).json({
      success: true,
      message: "Update successful.",
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
const putRescheduled = async function (req, res) {
  try {
    const { selectedInitialSched } = req.body;
    const oldRecord = await checkSchedule(selectedInitialSched.code);

    const activeUser = util.currentUserToken(req).code;
    // const scheduleStatusUpdate = "CONFIRMED";
    const fieldMap = {
      // caseNo: "cASENO",
      // patientFirstName: "fIRSTNAME",
      // patientLastName: "lASTNAME",
      // patientMiddleName: "mIDDLENAME",
      remarks: "remarks",
      initialTime: "initialTime",
      initialDate: "initialDate",
      initialProcedure: "initialProcedure",
    };

    const modifiedData2 = {};

    for (const [oldKey, newKey] of Object.entries(fieldMap)) {
      const oldValue = oldRecord[oldKey] ?? "";
      const newValue = selectedInitialSched[newKey] ?? "";

      if (oldValue !== newValue) {
        modifiedData2[oldKey] = {
          old: oldValue,
          new: newValue,
        };
      }
    }
    await sqlHelper.transact(async (txn) => {
      return await orSchedRecords.updateInitialSchedule(
        {
          remarks: modifiedData2.remarks?.new ?? oldRecord.remarks,
          initialTime: modifiedData2.initialTime?.new ?? oldRecord.initialTime,
          initialDate: modifiedData2.initialDate?.new ?? oldRecord.initialDate,
          // initialProcedure: modifiedData2.initialProcedure.new,
          initialProcedure:
            modifiedData2.initialProcedure?.new ?? oldRecord.initialProcedure,

          // isAdmitted: true,
          updatedBy: activeUser,
        },
        {
          code: selectedInitialSched?.code, // FIX
        },
        txn,
      );
    });
    // LOGS INSERT START
    await sqlHelper.transact(async (txn) => {
      const groupInsertCode = await sqlHelper.generateUniqueCode(
        "[UERMMMC].[dbo].[OrbitSchedLogs]",
        "GIC",
        4,
        txn,
      );

      for (const fieldName in modifiedData2) {
        const change = modifiedData2[fieldName];
        if (!change) continue; // safety check

        const generatedCode = await sqlHelper.generateUniqueCode(
          "[UERMMMC].[dbo].[OrbitSchedLogs]",
          "LOG",
          4,
          txn,
        );

        const payload = {
          code: generatedCode,
          caseNo: change.caseNo,
          fieldName,
          orSchedCode: selectedInitialSched.code,
          prevousColValue: change.old,
          newColValue: change.new,
          createdBy: activeUser,
          groupCode: groupInsertCode,
        };

        await orSchedRecords.insertSchedLogs(payload, txn);
      }

      return true; // so the transaction resolves with something
    });
    return res.status(200).json({
      success: true,
      message: "Update successful.",
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
// const putInitialSched = async function (req, res) {
//   try {
//     const { selectedInitialSched, verifyAdmittedPatient } = req.body;

//     const activeUser = util.currentUserToken(req).code;
//     const scheduleStatusUpdate = "CONFIRMED";
//     await sqlHelper.transact(async (txn) => {
//       return await orSchedRecords.updateInitialSchedule(
//         {
//           // initialSchedStatus:  selectedInitialSched.initialSchedStatus?.label, // FIX

//           initialSchedStatus: scheduleStatusUpdate,

//           remarks: selectedInitialSched.remarks,
//           initialTime: selectedInitialSched.timePart,
//           initialDate: selectedInitialSched.datePart,
//           caseNo: verifyAdmittedPatient.cASENO,
//           patientFirstName: verifyAdmittedPatient.fIRSTNAME,
//           patientLastName: verifyAdmittedPatient.lASTNAME,
//           patientMiddleName: verifyAdmittedPatient.mIDDLENAME,
//           initialProcedure: selectedInitialSched.initialProcedure,

//           isAdmitted: true,
//           updatedBy: activeUser,
//         },
//         {
//           code: selectedInitialSched?.code, // FIX
//         },
//         txn,
//       );
//     });

//     return res.status(200).json({
//       success: true,
//       message: "Update successful.",
//     });
//   } catch (error) {
//     return res.status(500).json({ error: error.message });
//   }
// };

const postInitialSched = async function (req, res) {
  try {
    if (util.empty(req.body)) {
      return res.status(400).json({ error: "`body` is required." });
    }
    const { defaultInitialScheduleForm, imUser } = req.body;
    // console.log("imUser:", imUser);
    // Transaction
    // const a = await getAppointeeDept();
    // console.log("a", a);
    const returnValue = await sqlHelper.transact(async (txn) => {
      const activeUser = util.currentUserToken(req).code;
      const prefixs = "PROCE";
      const generatedCode = await sqlHelper.generateUniqueCode(
        "[UERMMMC].[dbo].[OrbitScheduling]",
        prefixs.toUpperCase(),
        2,
        txn,
      );
      // let finalRe = "INITIAL";
      // if (defaultInitialScheduleForm.isEmergencyCase) {
      //   finalRe = "CONFIRMED";
      // }
      const initialSchedData = {
        code: generatedCode,
        remarks: defaultInitialScheduleForm.remarks,
        initialTime: defaultInitialScheduleForm.timePart,
        initialDate: defaultInitialScheduleForm.datePart,
        caseNo: defaultInitialScheduleForm.caseNo,
        patientFirstName: defaultInitialScheduleForm.patientFirstName,
        patientLastName: defaultInitialScheduleForm.patientLastName,
        patientMiddleName: defaultInitialScheduleForm.patientMiddleName,
        initialProcedure: defaultInitialScheduleForm.initialProcedure,
        initialSchedStatus: defaultInitialScheduleForm.isEmergencyCase
          ? "CONFIRMED"
          : "INITIAL",
        isEmergencyCase: defaultInitialScheduleForm.isEmergencyCase,
        isAdmitted: defaultInitialScheduleForm.isAdmitted,
        ORType: "EYESURG",
        createdBy: activeUser,
        slotStatus: defaultInitialScheduleForm.slotStatus,
        room: defaultInitialScheduleForm.room.value,
      };

      const insertData = await orSchedRecords.insertInitialSchedule(
        initialSchedData,
        txn,
      );

      if (insertData.error) {
        return res.status(500).json({ error: insertData.error });
      }
      // if (newVisitinSurg.length > 0) {
      // for (const newSign of newVisitinSurg) {
      const generatedCoding = await sqlHelper.generateUniqueCode(
        "UERMMMC..OrbitSignatories",
        "SIG",
        4,
        txn,
      );

      const payload = {
        procedureCode: generatedCode,
        code: generatedCoding,
        // caseNO: defaultInitialScheduleForm.caseNo,
        name: defaultInitialScheduleForm.uePrimaryConsultant.nAME,
        empCode: defaultInitialScheduleForm.uePrimaryConsultant.cODE,
        createdBy: activeUser,
        type: "ueSurg", //defaultInitialScheduleForm.type,
      };

      await orRecords.insertSignatories(payload, txn);
      // }
      // }

      // }

      // }

      return { success: true };
    });

    if (returnValue.error) {
      return res.status(500).json({ error: returnValue.error });
    }

    return res.status(200).json(returnValue);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
// const reschedulePosting = async function (req, res) {
//   try {
//     if (util.empty(req.body)) {
//       return res.status(400).json({ error: "`body` is required." });
//     }
//     const { defaultInitialScheduleForm,  oldSchedule } = req.body;
//     console.log("oldSchedule: whyyyyy noooot", oldSchedule);

//     const returnValue = await sqlHelper.transact(async (txn) => {
//       const activeUser = util.currentUserToken(req).code;
//       const prefixs = "PROCE";
//       const generatedCode = await sqlHelper.generateUniqueCode(
//         "[UERMMMC].[dbo].[OrbitScheduling]",
//         prefixs.toUpperCase(),
//         2,
//         txn,
//       );

//       console.log("oldSchedule: agggaiin noooot", oldSchedule);
//       const initialSchedData = {
//         code: generatedCode,
//         remarks: defaultInitialScheduleForm.remarks,
//         initialTime: defaultInitialScheduleForm.timePart,
//         initialDate: defaultInitialScheduleForm.datePart,
//         caseNo: defaultInitialScheduleForm.caseNo,
//         patientFirstName: defaultInitialScheduleForm.patientFirstName,
//         patientLastName: defaultInitialScheduleForm.patientLastName,
//         patientMiddleName: defaultInitialScheduleForm.patientMiddleName,
//         initialProcedure: defaultInitialScheduleForm.initialProcedure,
//         initialSchedStatus: defaultInitialScheduleForm.isEmergencyCase
//           ? "CONFIRMED"
//           : "INITIAL",

//         ORType: "EYESURG",
//         createdBy: activeUser,
//         slotStatus: defaultInitialScheduleForm.slotStatus,
//         room: defaultInitialScheduleForm.room.value,
//       };

//       const insertData = await orSchedRecords.insertInitialSchedule(
//         initialSchedData,
//         txn,
//       );

//       if (insertData.error) {
//         return res.status(500).json({ error: insertData.error });
//       }

//       await sqlHelper.transact(async (txn) => {
//         return await orSchedRecords.updateInitialSchedule(
//           {
//             initialSchedStatus: "RESCHEDULED",

//             updatedBy: activeUser,
//             active: false,
//             isFinalized: true,
//           },
//           {
//             code: oldSchedule?.code, // FIX
//           },
//           txn,
//         );
//       });

//       return { success: true };
//     });

//     if (returnValue.error) {
//       return res.status(500).json({ error: returnValue.error });
//     }

//     return res.status(200).json(returnValue);
//   } catch (error) {
//     return res.status(500).json({ error: error.message });
//   }
// };
const reschedulePosting = async function (req, res) {
  try {
    if (util.empty(req.body)) {
      return res.status(400).json({ error: "`body` is required." });
    }

    const { defaultInitialScheduleForm, oldSchedule } = req.body;
    if (!oldSchedule?.code) {
      return res.status(400).json({ error: "`oldSchedule.code` is required." });
    }

    const returnValue = await sqlHelper.transact(async (txn) => {
      const activeUser = util.currentUserToken(req).code;
      const prefix = "PROCE";

      const generatedCode = await sqlHelper.generateUniqueCode(
        "[UERMMMC].[dbo].[OrbitScheduling]",
        prefix.toUpperCase(),
        2,
        txn,
      );

      const initialSchedData = {
        code: generatedCode,
        remarks: defaultInitialScheduleForm.remarks,
        initialTime: defaultInitialScheduleForm.timePart,
        initialDate: defaultInitialScheduleForm.datePart,
        caseNo: defaultInitialScheduleForm.caseNo,
        patientFirstName: defaultInitialScheduleForm.patientFirstName,
        patientLastName: defaultInitialScheduleForm.patientLastName,
        patientMiddleName: defaultInitialScheduleForm.patientMiddleName,
        initialProcedure: defaultInitialScheduleForm.initialProcedure,
        initialSchedStatus: defaultInitialScheduleForm.isEmergencyCase
          ? "CONFIRMED"
          : "INITIAL",
        ORType: "EYESURG",
        createdBy: activeUser,
        slotStatus: defaultInitialScheduleForm.slotStatus,
        room: defaultInitialScheduleForm.room?.value || null,
      };

      // Insert the new schedule
      const insertData = await orSchedRecords.insertInitialSchedule(
        initialSchedData,
        txn,
      );
      if (insertData.error) {
        throw new Error(insertData.error);
      }

      // Update the old schedule as rescheduled
      const updateData = await orSchedRecords.updateInitialSchedule(
        {
          initialSchedStatus: "RESCHEDULED",
          updatedBy: activeUser,
          active: false,
          isFinalized: true,
        },
        {
          code: oldSchedule.code,
        },
        txn,
      );

      if (updateData.error) {
        throw new Error(updateData.error);
      }

      return { success: true, newScheduleCode: generatedCode };
    });

    return res.status(200).json(returnValue);
  } catch (error) {
    // console.error("Reschedule Error:", error);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  postInitialSched, //pre-scheduling
  reschedulePosting,

  putInitialSched,
  putInitialSchedHIMSVerified,
  putAliasScheduling,
  putRescheduled,
  putArrivedInOr,
  putLocked,
  getTATDatas,
  getCompletedORschedules,
  getInitialSchedule,

  getAdmittedPx,
  getSchedsOfSelectedCase,
  getTodayConfirmedSchedule,
  getSchedLogProgess,
  getSchedLogProgessTAT,
  getAuditTrail, // logs / history lang

  updateDetails, //CANCEL
  checkifDIscharge,
  putTrackProgress, // for TAT progress
  putInactivate, //pang finalized na last touch

  //helpers checks if exist
  checkSchedStatusExist,
  checkOrbitTAT,
  checkSchedule,
  getAppointeeDept,
  getSpecificTAT,
};
