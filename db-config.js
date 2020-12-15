var mysql = require('mysql');
var pool;
var db;
function createPool(){
    if(!pool){
        pool = mysql.createPool({
            connectionLimit: 10,
            host : process.env.MYSQL_URI,
            user: process.env.db_uname,
            password: process.env.db_pass,
            database: 'dev_db'
        });
    }
    return pool;
}

function createConnection(){
    if(!db){
        db = mysql.createConnection({
            host : process.env.MYSQL_URI,
            user: process.env.db_uname,
            password: process.env.db_pass,
            database: 'dev_db',
        });

        db.connect(function(err){
           if(!err){
               console.log("(+) Database Connected Successfully");
           }else{
               console.log("(-) Error in connecting Database\n");
               console.log(err);
           }
        });
    }
    return db;
}

module.exports = {
    host: 'lms-mysql-db-dev.cycmupolap2j.ap-south-1.rds.amazonaws.com',
    user: 'admin',
    password: 'kVorojp6GmX2nYzMZj9S',
    database: 'dev_db',
    dialect: 'mysql',
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
}