// UE MANILA/CALOOCAN STUDENTS AND EMPLOYEES
const db = require("../helpers/db.js");

const ueStudempModel = require("../models/ue-studemp.js");

const get = async (req, res) => {
  if (!req.query.name && !req.query.code) {
    res.status(400).json("URL query `name` or `code` is required.");
    return;
  }

  if (req.query.name && req.query.name.length < 5) {
    res.status(400).json("URL query `name` should be at least 5 characters.");
    return;
  }

  if (req.query.code && req.query.code.length < 2) {
    res.status(400).json("URL query `code` should be at least 2 characters.");
    return;
  }

  const whereStr = req.query.code
    ? "s.Code = ?"
    : "CONCAT(s.LastName, ', ', s.FirstName) LIKE ? OR CONCAT(s.FirstName, ' ', s.LastName) LIKE ?";

  const whereArgs = req.query.code
    ? [req.query.code]
    : [`%${req.query.name}%`, `%${req.query.name}%`];

  const response = await db.query(
    `${ueStudempModel.selectManySql} WHERE ${whereStr};`,
    whereArgs,
  );

  if (response?.error) {
    res.status(500).json(null);
    return;
  }

  res.json(response);
};

module.exports = {
  get,
};
