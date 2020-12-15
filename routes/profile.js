const router = require("express").Router();
const db_pool = require("../db-config");

router.route("/:id").get((req,res)=>{
    //it returns the profile with the given id
    const id = req.params.id;
    const query = `select u.username, u.fullname, u.regdno, 
                    u.email, u.profilepic from user as u where regdno='${id}';`

    db_pool.getConnection(function(error, connection){
        if(error){
            return res.status(503).send({eid:2,details:"Database servers are down",error:error});
        }
        connection.query(query, (error, results, fields)=>{
            if(error){
                return res.status(503).send({eid:3,details:"Invalid Query",error:error});
            }
            if(results.length!=0){
                res.status(200).send(results);
            }else{
                res.status(200).send({id:10,message:"No user with the specified ID"});
            }
        });
        connection.release();
    });
});


module.exports = router;