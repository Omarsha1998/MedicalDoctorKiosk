const express = require("express");
const router = express.Router();
const LoginController = require("../controllers/loginController");
const IRController = require("../controllers/iRController");
const AssitantQAController = require("../controllers/assitantQAController");
const DirectorController = require("../controllers/directorController");
const QAController = require("../controllers/qaController");
const HRController = require("../controllers/hRController");
const AuditController = require("../controllers/auditController");
const PrimaryController = require("../controllers/primaryController");
const SecondaryController = require("../controllers/secondaryContoller");
const { validateAccessToken } = require("../../../helpers/crypto");

router.post("/Login", LoginController.login);
router.get(
  "/DisplayReportList",
  validateAccessToken,
  LoginController.ReportList,
);

////IRFORM/////
router.get("/EmpdeptForm", validateAccessToken, IRController.FormEmdept);
router.get("/SubNameForm", validateAccessToken, IRController.FormSubName);
// router.get(
//   "/SubCategoryForm",
//   validateAccessToken,
//   IRController.FormSubCategory,
// );
router.get("/DivisionForm", validateAccessToken, IRController.FormDivision);
router.post("/AddIncident", validateAccessToken, IRController.FormIncident);
////////////////////////////////////////

/////////////DASHBOARD///////////
router.get("/DisplayDashboard", IRController.FormDashboard);
//////////////////////////////////////

/////////////ASSISTANTQA TABLE///////////
router.get(
  "/DisplayAssistantQASub",
  validateAccessToken,
  AssitantQAController.FormAssistantQASub,
);
router.get("/DisplayAQA", validateAccessToken, AssitantQAController.FormDisAQA);
router.get(
  "/DisplaySubjectCode",
  validateAccessToken,
  AssitantQAController.FormDisSubject,
);
router.get(
  "/DisplayDivisionCode",
  validateAccessToken,
  AssitantQAController.FormDisDivision,
);
router.post(
  "/PutDivisionCode",
  validateAccessToken,
  AssitantQAController.FormUpdateDivCode,
);
router.post(
  "/PutSubjectCode",
  validateAccessToken,
  AssitantQAController.FormUpdateSubCode,
);
//////////////////////////////////////

/////////////DIRECTORTABLE///////////
router.get(
  "/DisplayDirectorForm",
  validateAccessToken,
  DirectorController.DirectorFormDisAll,
);
router.get(
  "/DisplayDirectorIRP",
  validateAccessToken,
  DirectorController.FormDisDirectorIRF,
);
router.put(
  "/AddRecommendationDirector",
  validateAccessToken,
  DirectorController.FormDirectorRecommendation,
);
//////////////////////////////////////

/////////////QATABLE///////////
router.get("/DisplayQAForm", validateAccessToken, QAController.QAFormDisAll);
router.get("/DisplayIRP", validateAccessToken, QAController.FormDisIRF);
router.get("/DepartmentForm", validateAccessToken, QAController.FormDepDis);
router.get(
  "/DepartmentListForm",
  validateAccessToken,
  QAController.FormDepListDis,
);
router.post(
  "/AddActionDeptEmail",
  validateAccessToken,
  QAController.QAActionInsertEmail,
);
router.post(
  "/AddRCADeptEmail",
  validateAccessToken,
  QAController.QARCAInsertEmail,
);
router.get("/DisplayQA", validateAccessToken, QAController.QADisAll);
router.put(
  "/PutRiskGrading",
  validateAccessToken,
  QAController.FormRiskGrading,
);
router.put("/AddReject", validateAccessToken, QAController.FormInsertReject);
router.put("/PutRCASub", validateAccessToken, QAController.FormCountRCASta);

/////// ACTION /////////////////
router.get(
  "/DisplayQAActionDetails",
  validateAccessToken,
  QAController.FormActionDetails,
);

router.post(
  "/addDisApprovedAction",
  validateAccessToken,
  QAController.FormDisApprovedAction,
);

router.get(
  "/DisplayReturnActionDetails",
  validateAccessToken,
  QAController.FormReturnActionDetails,
);

router.put(
  "/PutCountAction",
  validateAccessToken,
  QAController.FormCountActionItem,
);

router.get(
  "/DisplayQARevisionActionDetails",
  validateAccessToken,
  QAController.FormRevisionActionDetails,
);

router.post(
  "/AddDisAppActionEmail",
  validateAccessToken,
  QAController.FormDisAppActionEmail,
);

router.post(
  "/addDisapprovedReturnAction",
  validateAccessToken,
  QAController.FormDisapprovedReturnAction,
);

router.post(
  "/AddApprovedReturnAction",
  validateAccessToken,
  QAController.FormApprovedReturnAction,
);

router.post(
  "/ApprovedAction",
  validateAccessToken,
  QAController.FormApprovedAction,
);

router.get(
  "/DisplayActionApprovedReturn",
  validateAccessToken,
  QAController.FormActionApprovedReturnDetails,
);

router.get(
  "/DisplayApprovedActionDetails",
  validateAccessToken,
  QAController.FormApprovedActionItems,
);

router.put(
  "/putActionItemVLStatus",
  validateAccessToken,
  QAController.FormVLActItemStatus,
);

router.put(
  "/UpdateAccomplishmentActStatus",
  validateAccessToken,
  QAController.FormAccomplishmentActStatus,
);

/////////// RCA  ////////////////
router.post(
  "/AddDisApprovedRCA",
  validateAccessToken,
  QAController.FormDisApprovedRCA,
);
router.post(
  "/AddReturnDisApprovedRCA",
  validateAccessToken,
  QAController.FormReturnDisApprovedRCA,
);
router.post(
  "/AddApprovedRCA",
  validateAccessToken,
  QAController.FormApprovedRCA,
);
router.get(
  "/DisplayRCAApprovedDetails",
  validateAccessToken,
  QAController.FormApprovedDetails,
);

router.put(
  "/UpdateAccomplishmentStatus",
  validateAccessToken,
  QAController.FormAccomplishmentStatus,
);

// router.post(
//   "/AddReturnApprovedRCA",
//   validateAccessToken,
//   QAController.FormReturnApprovedRCA,
// );

router.post(
  "/AddREConclusion",
  validateAccessToken,
  QAController.FormREConclusion,
);
router.get(
  "/DisplayFilterQAReviewRCADetailsReturn",
  validateAccessToken,
  QAController.FormFilterQAReviewDisRCADetailsReturn,
);
router.get(
  "/DisplayQAReviewRCADetailsReturn",
  validateAccessToken,
  QAController.FormQAReviewDisRCADetailsReturn,
);
router.get(
  "/DisplayDisCorrectiveItems",
  validateAccessToken,
  QAController.FormDisCorrectiveItems,
);
router.get(
  "/DisplayDisRiskItems",
  validateAccessToken,
  QAController.FormDisRiskItems,
);
router.get(
  "/DisplayEmployeeName",
  validateAccessToken,
  QAController.FormEmployeeName,
);

// router.get(
//   "/DisplayDisPreventiveItems",
//   validateAccessToken,
//   QAController.FormDisPreventiveItems,
// );

router.put(
  "/putCorActionItemStatus",
  validateAccessToken,
  QAController.FormCorrectiveActStatus,
);

router.put(
  "/putActionRiskItem",
  validateAccessToken,
  QAController.FormRiskStatus,
);

// router.put(
//   "/putPrevActionItemStatus",
//   validateAccessToken,
//   QAController.FormPreventiveActStatus,
// );

router.get(
  "/DisplayPendingRemarks",
  validateAccessToken,
  QAController.FormPendingRemarks,
);
router.post(
  "/AddPendingRemarks",
  validateAccessToken,
  QAController.FormPostPendingRemarks,
);
router.put("/putQADStatus", validateAccessToken, QAController.FormQADoneStatus);
//////////////////////////////

/////////////PRIMARYTABLE///////////
router.get(
  "/DisplayPrimaryACTDetails",
  validateAccessToken,
  PrimaryController.PrimaryACTDisAll,
);

/////// ACTION /////////////////
router.post(
  "/AddActionItemVL",
  validateAccessToken,
  PrimaryController.FormActionItemVL,
);
router.get(
  "/DisplayActionDetails",
  validateAccessToken,
  PrimaryController.FormDisActionDetails,
);
router.get(
  "/DisplayReturnFilterAction",
  validateAccessToken,
  PrimaryController.FormFilterActionReturn,
);
router.get(
  "/DisplayReturnAction",
  validateAccessToken,
  PrimaryController.FormDisplayReturnAction,
);
router.post(
  "/AddReturnAction",
  validateAccessToken,
  PrimaryController.FormAddReturnAction,
);
router.get(
  "/DisplayApprovedAction",
  validateAccessToken,
  PrimaryController.FormActionApprovedDetails,
);

/////////// RCA  ////////////////
router.get(
  "/DisplayPrimaryRCADetails",
  validateAccessToken,
  PrimaryController.PrimaryRCADisAll,
);
router.post("/addRCAItem", validateAccessToken, PrimaryController.FormRCAItem);
router.post(
  "/addRCAReviewItem",
  validateAccessToken,
  PrimaryController.FormRCAReviewItem,
);
router.get(
  "/DisplayRCADetails",
  validateAccessToken,
  PrimaryController.FormDisRCADetails,
);
router.get(
  "/DisplayRCADetailsReturn",
  validateAccessToken,
  PrimaryController.FormDisRCADetailsReturn,
);
router.get(
  "/DisplayReviewRCADetailsReturn",
  validateAccessToken,
  PrimaryController.FormReviewDisRCADetailsReturn,
);
router.get(
  "/DisplayFilterDisRCADetailsReturn",
  validateAccessToken,
  PrimaryController.FormFilterDisRCADetailsReturn,
);
////////////////////////////////////

/////////////SECONDARYTABLE///////////
router.get(
  "/DisplaySecondaryDetails",
  validateAccessToken,
  SecondaryController.SecondaryDisAll,
);
////////////////////////////////////

/////////////HRTABLE///////////
router.get(
  "/DisplayHRRepDetails",
  validateAccessToken,
  HRController.FormHRREPDetails,
);
router.get(
  "/DisplayHRRefDetails",
  validateAccessToken,
  HRController.FormHRREFDetails,
);
router.get("/DisplayHRIRP", validateAccessToken, HRController.FormDisHRIRF);
router.put(
  "/AddFinancialLiability",
  validateAccessToken,
  HRController.FormFinancialLiability,
);
router.post("/AddNote", validateAccessToken, HRController.FormHRN);
router.post("/AddHRNote", validateAccessToken, HRController.FormHRNotes);
router.put("/puthrStatus", validateAccessToken, HRController.FormHRStatus);
////////////////////////////////////////

////////////AUDIT////////////////////
router.get("/DisplayTab", validateAccessToken, AuditController.FormAuditTable);
router.get(
  "/DisplayHeadForm",
  validateAccessToken,
  AuditController.FormAuditHead,
);

router.post(
  "/addDeptEditContent",
  validateAccessToken,
  AuditController.FormAuditEditHead,
);

router.post(
  "/addDeptContent",
  validateAccessToken,
  AuditController.FormAuditAddHead,
);

router.get(
  "/DisplayAreaTab",
  validateAccessToken,
  AuditController.FormAuditArea,
);

router.get(
  "/DisplayRequestAccess",
  validateAccessToken,
  AuditController.FormAuditRequest,
);

router.post(
  "/addRequest",
  validateAccessToken,
  AuditController.FormAuditAddRequest,
);

router.put(
  "/RemoveRequest",
  validateAccessToken,
  AuditController.FormAuditRemoveRequest,
);

router.post(
  "/addContentArea",
  validateAccessToken,
  AuditController.FormAuditAddArea,
);

router.put(
  "/RemoveContentArea",
  validateAccessToken,
  AuditController.FormAuditDeleteArea,
);

router.get(
  "/DisplaySubjectTab",
  validateAccessToken,
  AuditController.FormAuditReportable,
);

router.post(
  "/AddSubjectDetails",
  validateAccessToken,
  AuditController.FormAuditAddReportable,
);

router.get(
  "/DisplayRiskChildTab",
  validateAccessToken,
  AuditController.FormAuditChild,
);

router.post(
  "/AddRiskChilds",
  validateAccessToken,
  AuditController.FormAuditAddChild,
);

router.get(
  "/DomainCodeForm",
  validateAccessToken,
  AuditController.FormAuditDomainCode,
);

router.post(
  "/addRiskDomains",
  validateAccessToken,
  AuditController.FormAuditAddDomain,
);

router.get(
  "/DisplayRiskUniForm",
  validateAccessToken,
  AuditController.FormAuditDictionary,
);

router.post(
  "/addRiskSubDomains",
  validateAccessToken,
  AuditController.FormAuditAddDictionary,
);

// router.post(
//   "/AddRiskDic",
//   validateAccessToken,
//   AuditController.FormAuditRiskCode,
// );

router.post(
  "/AddRemarks",
  validateAccessToken,
  AuditController.FormAuditRemarks,
);

router.get(
  "/DisplayNote",
  validateAccessToken,
  AuditController.FormRemarksNote,
);

router.post("/EditNote", validateAccessToken, AuditController.FormEditNote);
router.put("/DeletedNote", validateAccessToken, AuditController.FormDeleteNote);
router.put(
  "/PutauditStatus",
  validateAccessToken,
  AuditController.FormAuditStatus,
);

/////////////////////////////////////

// function runSendEmailRouteEvery12Hours() {
//   setInterval(() => {
//     QAController.sendEmail();
//   }, 1000);
// }
// runSendEmailRouteEvery12Hours();

module.exports = router;
