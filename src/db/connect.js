const mysql = require('mysql2');

const pool = mysql.createPool({
    connectionLimit:10,
    host:'localhost',
    user:'alunods',
    password:'senai@604',
    database:'vio_miguel'
})

module.exports = pool;
