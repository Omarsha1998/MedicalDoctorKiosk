require("dotenv/config");

module.exports = {
  prod: {
    user: process.env.DB_USER_LINKED_TO_UE,
    password: process.env.DB_PASS_LINKED_TO_UE,
    server: process.env.DB_HOST_LINKED_TO_UE,
    database: process.env.DB_DB_LINKED_TO_UE,
    options: {
      enableArithAbort: true,
      encrypt: false,
      appName: "node-rest-api-local",
      useUTC: false,
    },
    dialectOptions: {
      appName: "node-rest-api-local",
    },
    connectionTimeout: 30000,
    requestTimeout: 30000,
    pool: {
      idleTimeoutMillis: 30000,
      max: 100,
    },
  },
  dev: {
    user: process.env.DB_USER_LINKED_TO_UE_DEV,
    password: process.env.DB_PASS_LINKED_TO_UE_DEV,
    server: process.env.DB_HOST_LINKED_TO_UE_DEV,
    database: process.env.DB_DB_LINKED_TO_UE_DEV,
    options: {
      enableArithAbort: true,
      encrypt: false,
      appName: "node-rest-api-local",
      useUTC: false,
    },
    dialectOptions: {
      appName: "node-rest-api-local",
    },
    connectionTimeout: 30000,
    requestTimeout: 30000,
    pool: {
      idleTimeoutMillis: 30000,
      max: 100,
    },
  },
};
