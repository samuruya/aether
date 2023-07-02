const mysql = require('mysql2');
const express = require('express');
const app = express();
const env = require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
});

let rs = "";

function fileUp(path, originalName, link){
    let files = {path: path, originalName: originalName, url: link}
    let sqlSta = 'INSERT INTO files SET ?'
    pool.query(sqlSta, files, (err, result) =>{
        if(err) throw err;
        console.log(result);
        
    });
};

function fileDown(){
    let sqlSta = 'SELECT path, originalName FROM files'
    pool.query(sqlSta, (err, results) =>{
        if(err) throw err;
        console.log(results);
        
    });
};


module.exports = {
    fileUp,
    fileDown
};