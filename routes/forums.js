const router = require('express').Router();
//const dbconn = require('../models/db_orm');
//const forums = dbconn.forums;
//const operators =dbconn.seq_main.Op;

router.route("/").get((req,res) =>{
    forums.findAll()
        .then((data)=>{
            res.send(data);
        })
        .catch((error) =>{
            res.send(error)
        })
});


module.exports = router;