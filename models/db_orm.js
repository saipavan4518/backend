const dbconn = require('../db-config');
const seq_main= require('sequelize');

var seq_obj;

// init the sequelize object
try{
    seq_obj = new seq_main(
        dbconn.database,
        dbconn.user,
        dbconn.password,
        {
            host: dbconn.host,
            port: 3306,
            logging: console.log,
            maxConcurrentQueries: 100,
            dialect: dbconn.dialect,
            pool:{
                max: dbconn.pool.max,
                min: dbconn.pool.min,
                acquire: dbconn.pool.acquire,
                idle: dbconn.pool.idle
            },
            language: 'en'
        }
    );
}catch(error){
    console.log("error in db_orm");
}


try{
    seq_obj.authenticate();
    console.log("successfullt connected to database.");
}catch(error){
    console.log(`Error in connecting the database ${error}`)
}

const db = {}
db.seq_main = seq_main;
db.seq_obj =  seq_obj;
db.user = require("./users.model")(seq_main,seq_obj)

module.exports = db
