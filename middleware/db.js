const mysql = require("mysql2/promise");

const pool = mysql.createPool({
    host: "3.38.85.139",
    user: "user2",
    password: "1111",
    port: 51531,
    database: "majangdongdb",
});

module.exports = pool;