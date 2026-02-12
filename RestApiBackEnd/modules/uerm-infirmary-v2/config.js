module.exports = {
  appName: "UERM Infirmary",
  appCode: "UERMINFMRY",
  appClientUrl: process.env.DEV
    ? "http://10.107.0.24:9000/health-mate"
    : "https://local.uerm.edu.ph/health-mate",
  appVersion: "1.0.0",
};
