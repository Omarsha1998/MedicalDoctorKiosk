const sql = require("../../../helpers/sql.js");

async function generatedIRNo() {
  const result = await sql.query("SELECT GETDATE() AS now;");
  const now = result[0]?.now ?? null;

  if (!now) {
    throw new Error("Failed to retrieve current date from the database.");
  }

  const currentDate = now.toISOString().slice(0, 10).replace(/-/g, "");
  const currentYear = now.getFullYear();
  const numASC = await sql.query(`
    SELECT TOP 1 IRNo
    FROM IRUP..IRDetails
    WHERE IRNo LIKE '${currentYear}%'
    ORDER BY Id DESC;
  `);

  let ascNumber = 1;
  if (numASC.length > 0) {
    const lastIRNo = numASC[0].iRNo ?? null;
    const lastAscNumber = parseInt(lastIRNo.split("-")[1], 10);
    ascNumber = lastAscNumber + 1;
  }

  const uniqueNumber = Math.floor(Math.random() * 100)
    .toString()
    .padStart(2, "0");

  const generatedIRNo = `${currentDate}-${ascNumber.toString().padStart(5, "0")}-${uniqueNumber}`;
  return generatedIRNo;
}

async function formatSubCode() {
  const prefix = "RI";
  const result = await sql.query("SELECT GETDATE() AS now;");
  const now = result[0]?.now ?? null;
  const currentDate = now.toISOString().slice(0, 10).replace(/-/g, "");

  const maxCodeRecordset = await sql.query(`
    SELECT MAX(SubjectCode) AS LastSubjectCode
          FROM IRUP..IRSubjectName
          WHERE SubjectCode <> 'others';`);

  const lastCode = maxCodeRecordset[0]?.lastSubjectCode;
  const lastNumber = lastCode ? parseInt(lastCode.split("-")[2], 10) + 1 : 1;

  const generateSubCode = `${prefix}-${currentDate}-${String(lastNumber).padStart(5, "0")}`;
  return generateSubCode;
}

async function formatChilCode() {
  const prefix = "RIC";
  const result = await sql.query("SELECT GETDATE() AS now;");
  const now = result[0]?.now ?? null;
  const currentDate = now.toISOString().slice(0, 10).replace(/-/g, "");

  const maxCodeRecordset = await sql.query(`
    SELECT MAX(SubjectChilCode) AS LastSubjectCode
          FROM IRUP..IRReportableChildren;`);

  const lastCode = maxCodeRecordset[0]?.lastSubjectCode;
  const lastNumber = lastCode ? parseInt(lastCode.split("-")[2], 10) + 1 : 1;
  const generateChilCode = `${prefix}-${currentDate}-${String(lastNumber).padStart(5, "0")}`;
  return generateChilCode;
}

function formatDomainCode(resultDomain) {
  if (!resultDomain || resultDomain.length === 0) {
    return "I";
  }

  const nums = resultDomain.map((d) => {
    const value = romanToNumber(d.domainCode);
    return value;
  });

  const maxNum = Math.max(...nums);
  const next = maxNum + 1;
  const roman = toRoman(next);

  return roman;
}

function romanToNumber(roman) {
  const map = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
  let total = 0;
  for (let i = 0; i < roman.length; i++) {
    const curr = map[roman[i]];
    const next = map[roman[i + 1]];
    total += curr < next ? -curr : curr;
  }
  return total;
}

function toRoman(num) {
  const romans = [
    ["M", 1000],
    ["CM", 900],
    ["D", 500],
    ["CD", 400],
    ["C", 100],
    ["XC", 90],
    ["L", 50],
    ["XL", 40],
    ["X", 10],
    ["IX", 9],
    ["V", 5],
    ["IV", 4],
    ["I", 1],
  ];
  let result = "";
  for (const [roman, value] of romans) {
    while (num >= value) {
      result += roman;
      num -= value;
    }
  }
  return result;
}

function formatRiskSubCode(DomainRisk, resultSubDomain) {
  const codes = resultSubDomain
    .map((r) => r.riskCode)
    .filter((code) => code.startsWith(`${DomainRisk}-`))
    .map((code) => code.slice(DomainRisk.length + 1));

  if (codes.length === 0) {
    return `${DomainRisk}-A`;
  }

  codes.sort(compareCodes);
  const last = codes[codes.length - 1];
  const next = getNextCode(last);

  const finalCode = `${DomainRisk}-${next}`;
  return finalCode;
}

function compareCodes(a, b) {
  const pa = a.split("-");
  const pb = b.split("-");
  const len = Math.max(pa.length, pb.length);

  for (let i = 0; i < len; i++) {
    const x = pa[i] || "";
    const y = pb[i] || "";

    if (x === y) continue;

    if (x.length !== y.length) {
      const result = x.length - y.length;
      return result;
    }

    const result = x.localeCompare(y);
    return result;
  }
  return 0;
}

function getNextCode(code) {
  const parts = code.split("-");
  const last = parts.pop();

  const next = incLetters(last);

  if (next.length > last.length) {
    parts.push(last);
    parts.push("A");
  } else {
    parts.push(next);
  }

  const result = parts.join("-");
  return result;
}

function incLetters(str) {
  const chars = str.split("");
  let i = chars.length - 1;

  while (i >= 0) {
    if (chars[i] !== "Z") {
      chars[i] = String.fromCharCode(chars[i].charCodeAt(0) + 1);
      const result = chars.join("");
      return result;
    }
    chars[i] = "A";
    i--;
  }

  const overflow = `A${chars.join("")}`;
  return overflow;
}

module.exports = {
  generatedIRNo,
  formatSubCode,
  formatChilCode,
  formatDomainCode,
  formatRiskSubCode,
};
