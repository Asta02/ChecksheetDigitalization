const sql = require("msnodesqlv8");

const dbSource = "DEV-KRW";
const dbName = "db_qc";
const dbUsers = "gsmagang";
const dbPass = "G5magang!";

const connectionString = `Data Source=${dbSource};Initial Catalog=${dbName};User Id=${dbUsers};Password=${dbPass};Driver={SQL Server Native Client 11.0}`;
const query = "Select * from tlkp_user";

console.log(connectionString);
sql.query(connectionString, query, (err, rows) => {
    if (err) {
        console.error("Error executing query:", err);
    } else {
        console.log(rows);
    }
});