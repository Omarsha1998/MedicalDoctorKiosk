/* eslint-disable no-console */

const util = require("../../../helpers/util.js");
const sqlHelper = require("../../../helpers/sql.js");
const puppeteer = require("puppeteer");
const mustache = require("mustache");
const { createClient } = require("redis");

// const { extractTokenFromRequest } = require("../../../helpers/controller.js");

const { pwFromBirthDate } = require("../../../helpers/util.js");
const { PDFDocument } = require("pdf-lib");
const pdfEncrypt = require("pdf-lib-plus-encrypt");
const crypto = require("../../../helpers/crypto");

const fs = require("fs");
const path = require("path");

// // MODELS //
const ediagnosticModel = require("../models/pxPortalModel.js");
// // MODELS //

const toBase64 = (filePath) =>
  `data:image/png;base64,${fs.readFileSync(filePath, "base64")}`;

const cachedLogos = {
  uermLogo: toBase64(
    path.resolve(__dirname, "../../../assets/images/uerm.png"),
  ),
  uermMedLogo: toBase64(
    path.resolve(__dirname, "../../../assets/images/uerm-med-logo.png"),
  ),
};

const __handleTransactionResponse = (returnValue, res) => {
  if (returnValue.error) {
    return res.status(500).json({ error: returnValue.error });
  }
  return res.json(returnValue);
};

const setPatientAuthToken = async function (req, res) {
  if (util.empty(req.body))
    return res.status(400).json({ error: "Query is required." });

  const returnValue = await sqlHelper.transact(async (txn) => {
    try {
      const patientDetails = await ediagnosticModel.selectPatients(
        "and patientNo = ?",
        [req.body.patientNo],
        {},
        txn,
      );
      const patientDetail = patientDetails[0];
      if (Object.keys(patientDetail).length > 0) {
        const userAccessToken = crypto.generateAccessToken(patientDetail); // (user,screct key, expiration) Generate an access token using the crypto.generateAccessToken function
        const redisClient = createClient(); //create redis client
        await redisClient.connect(); //connect
        await redisClient.set(patientDetail.code, userAccessToken); // Set a key-value pair in Redis with the code from userDetails as the key
        // and userAccessToken as the value
        // await crypto.initSocket(io)
        return {
          userAccessToken: userAccessToken,
        };
      } else {
        return {};
      }
    } catch (error) {
      console.log(error);
      return { error: error };
    }
  });

  return __handleTransactionResponse(returnValue, res);
};

const unsetPatientAuthToken = async function (req, res) {
  const user = req.user;
  const returnValue = await sqlHelper.transact(async () => {
    try {
      const redisClient = createClient();
      await redisClient.connect();
      if (user !== undefined) {
        await redisClient.sendCommand(["DEL", user.code]);
      }
      res.clearCookie("access_token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "dev" ? false : true,
        sameSite: "Strict",
      });
    } catch (error) {
      console.log(error);
      return { error: error };
    }

    return { success: "success" };
  });

  if (returnValue.error !== undefined) {
    return res.status(500).json({ error: `${returnValue.error}` });
  }

  return res.json(returnValue);
};

const getTestOrders = async function (req, res) {
  if (util.empty(req.query)) {
    return res.status(400).json({ error: "URL query is required." });
  }

  const returnValue = await sqlHelper.transact(async (txn) => {
    try {
      const { deptCode, fromDate, toDate, patientNo } = req.query;
      let conditions = "";
      let args = [];
      let testOrders = [];
      let orderCondition = {};
      if (deptCode) {
        conditions = `and convert(date, t0.dateTimeCreated) between ? and ?
            and c.patientNo = ?
            and t.DepartmentCode = ?
            and (t0.dateTimeReleased <> '' and t0.dateTimeReleased is not null)    
			      and isFinalStep = 1`;
        args = [fromDate, toDate, patientNo, deptCode];
        orderCondition = {
          order: ` t0.dateTimeCreated asc`,
          top: "",
        };

        testOrders = await ediagnosticModel.selectTestOrders(
          conditions,
          args,
          orderCondition,
          txn,
        );
      }

      return testOrders;
    } catch (error) {
      console.log(error);
      return { error: error };
    }
  });

  return __handleTransactionResponse(returnValue, res);
};

const getPatientResult = async function (req, res) {
  if (util.empty(req.query.testOrderCode)) {
    return res.status(400).json({ error: "URL query is required." });
  }

  const returnValue = await sqlHelper.transact(async (txn) => {
    try {
      const { testOrderCode } = req.query;
      let conditions = "";
      let args = [];

      if (testOrderCode) {
        conditions = `and testOrderCode = ?`;
        args = [testOrderCode];
      }

      return await ediagnosticModel.selectPatientResults(
        conditions,
        args,
        {
          order: "",
          top: "",
        },
        txn,
      );
    } catch (error) {
      console.log(error);
      return { error: error };
    }
  });

  return __handleTransactionResponse(returnValue, res);
};

const getPatientResultValueFile = async function (req, res) {
  if (util.empty(req.query.testComponentCode)) {
    return res.status(400).json({ error: "URL query is required." });
  }

  const returnValue = await sqlHelper.transact(async (txn) => {
    try {
      const { testComponentCode, resultId } = req.query;
      let conditions = "";
      let args = [];

      if (testComponentCode) {
        conditions = `and testComponentCode = ? and patientResultId = ?`;
        args = [testComponentCode, resultId];
      }

      const returnResultValueFiles =
        await ediagnosticModel.selectPatientResultValueFiles(
          conditions,
          args,
          {
            order: "",
            top: "",
          },
          txn,
        );

      if (returnResultValueFiles.length > 0) {
        return returnResultValueFiles[0];
      }

      return {
        fileType: "",
        fileValue: "",
      };
    } catch (error) {
      console.log(error);
      return { error: error };
    }
  });

  // res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", returnValue.fileType);
  // res.setHeader("Cache-Control", "public, max-age=3600");
  res.send(returnValue.fileValue); // Send raw binary
};

const getTestsAndComponents = async function (req, res) {
  const { testCode, gender, birthdate } = req.query;
  if (util.empty(testCode))
    return res.status(400).json({ error: "Test code is required." });

  const returnValue = await sqlHelper.transact(async (txn) => {
    const ageDays = await util.getDaysFromBirthdate(birthdate);

    const tests = await ediagnosticModel.selectTestComponents(
      ` and (? BETWEEN d.AgeMinDays AND d.AgeMaxDays OR (d.AgeMinDays IS NULL AND d.AgeMaxDays IS NULL))
        AND (? = d.gender OR d.gender IS NULL)
      `,
      "and a.code = ?",
      [ageDays, gender, testCode],
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

    const testFlaggings = await ediagnosticModel.selectTestComponentFlagging(
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

const generateDynamicPDF = async function (req, res) {
  const data = req.body;

  try {
    const {
      testCode,
      gender,
      birthdate,
      testOrderCode,
      rawBirthdate,
      code,
      accessToken,
    } = data;

    const ageDays = await util.getDaysFromBirthdate(birthdate);

    const testResultValues = await sqlHelper.transact(async (txn) => {
      const employeeName = await ediagnosticModel.selectUERMEmployee(
        ` and code = ?`,
        [data.releasedby],
        {},
        txn,
      );
      data.releasedByName = employeeName.name;

      const consultant = await ediagnosticModel.selectDoctors(
        ` and ehr_code = ?`,
        [data.consultantId],
        {},
        txn,
      );

      if (consultant.length > 0) {
        data.consultantName = consultant[0].name;
        data.consultantDesignation = consultant[0].ancillaryDesignation;
      }

      const tests = await ediagnosticModel.selectTestComponents(
        ` and (? BETWEEN d.AgeMinDays AND d.AgeMaxDays OR (d.AgeMinDays IS NULL AND d.AgeMaxDays IS NULL))
        AND (? = d.gender OR d.gender IS NULL)
      `,
        `and a.code = ? and f.testOrderCode = ? and b.allowPrintout = 1`,
        [ageDays, gender, testCode, testOrderCode],
        {
          order: "b.sequence",
          top: "",
        },
        txn,
      );

      return tests;
    });

    const htmlHeader =
      testResultValues.length === 0
        ? ""
        : `
          <style>
          html, body {
            font-family: Arial, sans-serif;
          }
          </style>
        <div>${testResultValues[0].headerHtml}</div>`;
    const bodyHtml =
      testResultValues.length === 0
        ? ""
        : `<div>${testResultValues[0].contentHtml}</div>`;
    const htmlFooter =
      testResultValues.length === 0
        ? ""
        : `
          <style>
          html, body {
            font-family: Arial, sans-serif;
          }
          </style>
        <div>${testResultValues[0].footerHtml}</div>`;

    data.results = testResultValues;

    const clonedData = JSON.parse(JSON.stringify(data));

    if (data.results.length > 0) {
      for (const list of data.results) {
        list.value = list.value.includes("patient-result-file")
          ? list.inputType === "uploadFileField"
            ? `<img src="${await util.convertURLtoBase64(
                `http://localhost:3000/ediagnostics/px-portal${list.value}`,
                true,
                `access_token=${accessToken}`,
              )}" height="620" width="800">`
            : null
          : list.value;
      }
    }

    const mergedData = {
      ...data,
      uermLogo: cachedLogos.uermLogo,
      uermMedLogo: cachedLogos.uermMedLogo,
      currentDate: util.formatDate2({ date: util.currentDateTime() }),
      // signature1: returnValue.signature1,
    };

    const browser = await puppeteer.launch({
      headless: "new",
      slowMo: 50,
      // args: ["--no-sandbox", "--disable-setuid-sandbox"],
      args: [
        // "--disable-dev-shm-usage",
        // "--disable-setuid-sandbox",
        // "--no-sandbox",
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--no-zygote",
      ],
    });

    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(0);

    page.on("console", (msg) => console.log("PAGE LOG:", msg.text()));
    page.on("pageerror", (err) => console.log("PAGE ERROR:", err));

    const contentHtml = `
    <html>
      <head>
        <style>
          html, body {
            font-family: Arial, sans-serif;
          }
          .watermark {
            position: fixed;
            top: -15%;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
            background-image: url('${cachedLogos.uermLogo}'); /* shortened */
            background-repeat: no-repeat;
            background-position: center;
            background-size: 30%;
            opacity: 0.1;
            pointer-events: none;
          }
          .text-watermark {
            position: fixed;
            top: 20%;
            left: 3%;
            width: 80%;
            text-align: center;
            font-size: 100px;
            font-weight: 600;
            color: rgba(150, 150, 150, 0.2);
            transform: rotate(-30deg);
            z-index: 5;
            pointer-events: none;
            font-family: helvetica;
            user-select: none;
            padding: 40px;
            letter-spacing: 30px; /* space between characters */
            line-height: 1.2;
          }
        </style>
      </head>
      <body>
        <div class="watermark"></div>
        {{#showPreviewWatermark}}
        <div class="text-watermark">PREVIEW</div>
        {{/showPreviewWatermark}}
        ${bodyHtml}
      </body>
    </html>`;

    const renderedHtml = mustache.render(contentHtml, mergedData || {});

    const headerHTML = mustache.render(htmlHeader, mergedData || {});

    const footerHTML = mustache.render(htmlFooter, mergedData || {});

    await page.setContent(renderedHtml, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });

    // await page.goto(url, { waitUntil: "networkidle2" });

    await page.evaluateHandle("document.fonts.ready");

    const pdfBuffer = await page.pdf({
      format: "LETTER",
      printBackground: true,
      displayHeaderFooter: true,
      margin: {
        top: "340px", // reserve space for header
        bottom: "120px", // reserve space for footer
        left: "25px",
        right: "25px",
      },
      headerTemplate: headerHTML,
      footerTemplate: footerHTML,
      // `<div style="font-size:10px; text-align:center; width:100%;">
      //   Page <span class="pageNumber"></span> of <span class="totalPages"></span>
      // </div>`,
    });

    await browser.close();

    let finalBuffer = pdfBuffer;

    const filterPDF = clonedData.results.filter(
      (filterResult) => filterResult.inputType === "uploadFilePdfField",
    );

    if (filterPDF.length > 0) {
      const mainDoc = await PDFDocument.load(pdfBuffer);
      for (const pdfFile of filterPDF) {
        const response = await fetch(
          `http://localhost:3000/ediagnostics/px-portal${pdfFile.value}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );

        const urlPdfBytes = await response.arrayBuffer();

        const urlPdfDoc = await PDFDocument.load(urlPdfBytes);
        const copiedPages = await mainDoc.copyPages(
          urlPdfDoc,
          urlPdfDoc.getPageIndices(),
        );
        copiedPages.forEach((page) => mainDoc.addPage(page));

        finalBuffer = await mainDoc.save();
      }
    }

    if (req.body.encrypted) {
      const userBirthDate = new Date(rawBirthdate);
      const pdfDoc = await pdfEncrypt.PDFDocument.load(finalBuffer);
      pdfDoc.encrypt({
        userPassword: `${code}:${pwFromBirthDate(userBirthDate)}`,
      });

      finalBuffer = Buffer.from(await pdfDoc.save());
    }

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline; filename=output.pdf",
      "Content-Length": finalBuffer.length,
    });

    res.end(finalBuffer);
  } catch (error) {
    console.error("❌ PDF generation error:", error);
    res.status(500).send("Error generating PDF.");
  }
};

const generateResult = async function (req, res) {
  const { testCode, gender, birthdate, testOrderCode } = req.body;
  const ageDays = await util.getDaysFromBirthdate(birthdate);

  const returnValue = await sqlHelper.transact(async (txn) => {
    const tests = await ediagnosticModel.selectTestComponents(
      ` and (? BETWEEN d.AgeMinDays AND d.AgeMaxDays OR (d.AgeMinDays IS NULL AND d.AgeMaxDays IS NULL))
        AND (? = d.gender OR d.gender IS NULL)
      `,
      "and a.code = ? and f.testOrderCode = ?",
      [ageDays, gender, testCode, testOrderCode],
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

const getDepartments = async function (req, res) {
  const returnValue = await sqlHelper.transact(async (txn) => {
    const departments = await ediagnosticModel.selectDepartments(
      "and active = ?",
      [1],
      {
        order: "",
        top: "",
      },
      txn,
    );

    return departments;
  });

  return __handleTransactionResponse(returnValue, res);
};

const getDoctors = async function (req, res) {
  const returnValue = await sqlHelper.transact(async (txn) => {
    const departments = await ediagnosticModel.selectDoctors(
      "and deleted = ?",
      [0],
      {
        order: "name, lastName ",
        top: "",
      },
      txn,
    );

    return departments;
  });

  return __handleTransactionResponse(returnValue, res);
};

module.exports = {
  getTestOrders,
  generateDynamicPDF,
  getPatientResult,
  getPatientResultValueFile,
  getTestsAndComponents,
  getTestFlaggings,
  generateResult,
  getDoctors,
  getDepartments,
  setPatientAuthToken,
  unsetPatientAuthToken,
};
