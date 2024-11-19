const hana = require('@sap/hana-client');
require('dotenv').config();

const hanaUrl = process.env.HANA_DB_ENDPOINT_URL
const port = process.env.HANA_DB_PORT
const userId = process.env.HANA_DB_USER_ID
const pass = process.env.HANA_DB_PASS

var connOptions = {
  serverNode: `${hanaUrl}:${port}`,
  UID: userId,
  PWD: pass,
  encrypt: 'true',
  sslValidateCertificate: 'false'
};

var connection = hana.createConnection();
connection.connect(connOptions);

var sql = 'SELECT EmployeeID, FirstName, LastName, BirthDate, HireDate, Salary FROM DBADMIN.Employee;';
var t0 = performance.now();
// var result = connection.exec(sql);
// console.log(util.inspect(result, { colors: false }));
var t1 = performance.now();
console.log("time in ms " + (t1 - t0));
connection.disconnect();
