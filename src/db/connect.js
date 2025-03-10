const mysql = require('mysql2');

const pool = mysql.createPool({
    connectionLimit:10,
    host:'localhost',
    user:'miguel',
    password:'senai@604',
    database:'senai'
})

module.exports = pool;
