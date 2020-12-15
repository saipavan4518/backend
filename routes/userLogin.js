const router = require('express').Router();
const dbconfig = require('../db-config');
//const dbconn = require("../models/db_orm");
//const user = dbconn.user;
// operators = dbconn.seq_main.Op;


router.route("/").post(async (req, res)=>{
    var query = "";

    if(!req.body.email || !req.body.password){
        return res.status(400).send({eid:1,details:"Invalid Email or Password requests"});
    }
    
    user.findAll({
        attributes: ['password'],
        where:{
            email: req.body.email
        }
    }).then(data => {
        if (req.body.password == data[0].password){
            res.status(200).send("Logged In")
        }else{
            res.status(200).send("Login Failed")
        }

        
    }).catch(error => {
        res.status(500).send(error)
    });
    
});


module.exports = router;