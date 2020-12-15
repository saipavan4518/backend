const router = require('express').Router();
const db_pool = require('../db-config');

router.route("/getforums").get((req,res) =>{
    //get all the forums present in the "forums" table.
    const query = "select * from forums";
    db_pool.getConnection(function(error, connection){
        if(error){
            return res.status(503).send({eid:2,details:"Database servers are down",error:error});
        }
        connection.query(query, (error, results, fields)=>{
            if(error){
                return res.status(503).send({eid:3,details:"Invalid Query",error:error});
            }
            res.status(200).send(results);
        });
        connection.release();
    });
});

router.route("/getforum/:id").get((req,res) =>{
    //get all the forums present in the "forums" table.
    const id = req.params.id;
    const query = `select * from forums where forum_id = '${id}'`;
    db_pool.getConnection(function(error, connection){
        if(error){
            return res.status(503).send({eid:2,details:"Database servers are down",error:error});
        }
        connection.query(query, (error, results, fields)=>{
            if(error){
                return res.status(503).send({eid:3,details:"Invalid Query",error:error});
            }
            res.status(200).send(results);
        });
        connection.release();
    });
});


router.route("/deleteforum/:id").delete((req,res)=>{
    //delete the forum of the given specific id
    const id = req.params.id
    query = `delete from forums where forum_id = '${id}'`
    db_pool.getConnection(function(error, connection){
        if(error){
            return res.status(503).send({eid:2,details:"Database servers are down",error:error});
        }
        connection.query(query, (error, results, fields)=>{
            if(error){
                return res.status(503).send({eid:3,details:"Invalid Query",error:error});
            }
            res.status(200).send({message:"Succesfully Deleted"});
        });
        connection.release();
    });
});

router.route("/newforum").post((req,res)=>{
    const forum_name = req.body.forumname;
    const forum_priority = req.body.forumpriority;

    const query = `insert into forums (forum_name,forum_priority) values ('${forum_name}',${forum_priority})`;

    db_pool.getConnection(function(error, connection){
        if(error){
            return res.status(503).send({eid:2,details:"Database servers are down",error:error});
        }
        connection.query(query, (error, results, fields)=>{
            if(error){
                return res.status(503).send({eid:3,details:"Invalid Query",error:error});
            }
            res.status(200).send(results);
        });
        connection.release();
    });
});


router.route("/getthreads").get((req,res) =>{
    //get all the threads that are present in the database
    //this is inefficient. so, we should not use.
    const query = "select * from threads";
    db_pool.getConnection(function(error, connection){
        if(error){
            return res.status(503).send({eid:2,details:"Database servers are down",error:error});
        }
        connection.query(query, (error, results, fields)=>{
            if(error){
                return res.status(503).send({eid:3,details:"Invalid Query",error:error});
            }
            res.status(200).send(results);
        });
        connection.release();
    });
});

router.route("/getthreads/id/:forumid").get((req,res) =>{
    //get the threads that are specific to the given forum id
    const forum_id = req.params.forumid;
    const query = `select * from threads where forum_id = '${forum_id}'`
    db_pool.getConnection(function(error, connection){
        if(error){
            return res.status(503).send({eid:2,details:"Database servers are down",error:error});
        }
        connection.query(query, (error, results, fields)=>{
            if(error){
                return res.status(503).send({eid:3,details:"Invalid Query",error:error});
            }
            res.status(200).send(results);
        });
        connection.release();
    });
});

router.route("/getthreads/search/:text").get((req,res) =>{
    //here we return the threads which have the "text" in the thread subject
    // first get the id from the thread subject then return the thread
    const stext = req.params.text;
    const query = `select t.thread_id, t.user_id, t.forum_id, t.thread_status, s.thread_subject from threads
                 as t inner join threads_subject as s on t.thread_id = s.thread_id and thread_subject like '%${stext}%'`

    db_pool.getConnection(function(error, connection){
        if(error){
            return res.status(503).send({eid:2,details:"Database servers are down",error:error});
        }
        connection.query(query, (error, results, fields)=>{
            if(error){
                return res.status(503).send({eid:3,details:"Invalid Query",error:error});
            }
            var sresults = results.map((row)=>{
                return row;
            });
            res.status(200).send(sresults);
        });
        connection.release();
    });
    
});



module.exports = router;