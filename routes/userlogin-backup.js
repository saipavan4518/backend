const router = require('express').Router();
const e = require('express');
const db_pool = require('../db-config');

router.route("/").post(async (req, res)=>{
    var query = "";

    if(!req.body.email || !req.body.password){
        return res.status(400).send({eid:1,details:"Invalid Email or Password requests"});
    }

    const e_password = req.body.password;

    if(req.body.email.includes('@')){
        //find the email
        query = `select * from user where email = '${req.body.email}'`;
    }else{
        //find the username
        query = `select * from user where regdno = '${req.body.email}'`;
    }

    db_pool.getConnection(function(error,connection){
        if(error){
            return res.status(503).send({eid:2,details:"Database servers are down"});
        }

        connection.query(query, function(error, results, fields){
            if(error){
                return res.status(503).send({eid:3,details:"Invalid Query",error:error});
            }

            // compare the passwords
            const db_password = results[0].password;
            if(e_password === db_password){
                res.send("Login successfull");
            }else{
                res.send('Login Failed');
            }
        });

        connection.release();
    });

});


module.exports = router;