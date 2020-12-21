const router = require('express').Router();
const db_pool = require('../db-config');
const multer = require('multer');

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
    const query = "select * from threads as t inner join threads_subject as s on t.thread_id=s.thread_id;";
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

router.route("/createthread").post((req, res)=>{
    //subject is nothing but the actual thread question by the user.
    const u_id = req.body.u_id;
    const f_id = req.body.f_id;
    const t_status = req.body.status;
    const thread_subject = req.body.subject;
    


    const query = `insert into threads (user_id,forum_id,thread_status) values ('${u_id}',${f_id},'${t_status}')`

    db_pool.getConnection(function(error,connection){
        if(error){
            return res.status(503).send({eid:2,details:"Database servers are down",error:error});
        }
        connection.query(query, (error, results, fields)=>{
            if(error){
                return res.status(503).send({eid:3,details:"Invalid Query",error:error});
            }
            id = results.insertId;
            //now using this id insert the text in the row of the threads_subject
            const q1 = `insert into threads_subject (thread_id,thread_subject) values (${id},"${thread_subject}")`
            connection.query(q1, (error, results, fields)=>{
                if(error){
                    return res.status(503).send({eid:3,details:"Invalid Query",error:error});
                }
                res.send(results);
            });
        });
        connection.release();
    });
});

router.route("/thread/:threadid/:action").put((req,res)=>{
    //here we are creating upvotes and downvotes for the thread.
    //we need to keep in mind that a user can only upvote/downvote once.
    // 1989: upvote 2324: downvote

    const thread_id = req.params.threadid;
    const action = req.params.action;

    const valid_action = ["1989","2324"];
    if(!thread_id || !action){
        return res.status(400).send({eid:10,message:"Error in Query"});
    }

    if(!valid_action.includes(action) || !valid_action.includes(action)){
        return res.status(400).send({eid:11,message:"Error in Query"});
    }

    const query = `select thread_votes  from threads where thread_id = ${thread_id}`;
    db_pool.getConnection(function(error,connection){
        if(error){
            return res.status(503).send({eid:2,details:"Database servers are down",error:error});
        }
        connection.query(query, (error, results, fields)=>{
            if(error){
                return res.status(503).send({eid:3,details:"Invalid Query",error:error});
            }

            if(results.length == 0){
                //this is , when the given thread id is not found.
                return res.status(400).send({eid:11,message:"Error in Query"});
            }
            let value = parseInt(results[0].thread_votes);
            let up_q = "";
            if(value > 0){
                //do normal upvote and downvote
                if(action == "1989"){
                    //upvote
                    up_q = `update threads set thread_votes = thread_votes+1 where thread_id = ${thread_id}`;
                    value = value + 1;
                }else{
                    up_q = `update threads set thread_votes = thread_votes-1 where thread_id = ${thread_id}`;
                    value = value - 1;
                }
            }else{
                //value == 0, then for downvote we do nothing, set as 0 again for safety.
                if(action == "1989"){
                    //upvote
                    up_q = `update threads set thread_votes = thread_votes+1 where thread_id = ${thread_id}`;
                    value = value + 1;
                }else{
                    up_q = `update threads set thread_votes = 0 where thread_id = ${thread_id}`;
                    value = 0;
                }
            }
            console.log(up_q);
            connection.query(up_q,(error,results,fields)=>{
                if(error){
                    return res.status(503).send({eid:3,details:"Invalid Query",error:error});
                }
                res.send({
                    thread_id:thread_id,
                    votes:value
                });
            });
        });
        connection.release();
    });

});

//delete thread
router.route("/deletethread/:id").delete((req,res)=>{
    const id = req.params.id;
    query = `delete from threads where thread_id = '${id}'`
    db_pool.getConnection(function(error, connection){
        if(error){
            return res.status(503).send({eid:2,details:"Database servers are down",error:error});
        }
        connection.query(query, (error, results, fields)=>{
            if(error){
                return res.status(503).send({eid:3,details:"Invalid Query",error:error});
            }
            res.status(200).send({eid:5,message:"Succesfully Deleted"});
        });
        connection.release();
    });
})

//here write the code for the upload
const storage1 = multer.diskStorage({
    destination: function(req,file,cb){
        cb(null,`./uploads/posts`)
    },
    filename: function(req, file, cb){ 
        //windows doesnt support : element, so we need to replace.
        cb(null, new Date().toISOString().replace(/:/g,'')+"_"+file.originalname);
    }
});

const fileFilter = (req, file, cb) =>{
    if(file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg' || file.mimetype === 'application/pdf' || file.mimetype === 'application/msword'){
        cb(null, true);
    }else{
        cb(null, false);
    }
}

const upload = multer({
    storage: storage1,
    fileFilter: fileFilter,
    limits: {
        fileSize: 1000*1000*10
    }
})

//create a folder for every user.

router.route("/posts/createpost").post(upload.single('postdata'),async(req,res)=>{
    //create post
    // post_id int auto_increment primary key,
    // forum_id int,
    // thread_id int, 
    // user_id varchar(10), 
    // parent_id int,
    // post_status varchar(255),
    // post_votes int, for this we can do two things, 1.we can init with 0 or 2. we can send from the frontend.
    // post_img varchar(255)

    const forum_id = req.body.f_id;
    const thread_id = req.body.t_id;
    const user_id = req.body.u_id;
    const parent_id = req.body.p_id;
    const status = req.body.status;
    const votes = req.body.votes;
    const subject = req.body.subject;

    var path = "http://localhost:8110/"+req.file.path.replace(/\\/g,'/');
    
    const query = `insert into posts (forum_id,thread_id,user_id,parent_id,post_status,post_votes,post_img) 
            values (${forum_id},${thread_id},'${user_id}',${parent_id},'${status}',${votes},'${path}')`;

    db_pool.getConnection(function(error,connection){
        if(error){
            return res.status(503).send({eid:2,details:"Database servers are down",error:error});
        }
        connection.query(query,function(error, results, fields){
            if(error){
                return res.status(503).send({eid:3,details:"Invalid Query",error:error});
            }
            let id = results.insertId;
            const q1 = `insert into posts_subject (post_id,post_subject) values (${id},"${subject}")`
            connection.query(q1, (error, results, fields)=>{
                if(error){
                    return res.status(503).send({eid:3,details:"Invalid Query",error:error});
                }
                res.send(results);
            });
        });

        connection.release();
    });
});

router.route("/posts/getpost/:id").get((req,res)=>{
    const id = req.params.id;
    const query = `select * from posts as p inner join posts_subject as s on p.post_id = s.post_id where p.thread_id = ${id}`

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


router.route("/posts/deletepost/:id").delete((req,res)=>{
    //delete the post of the given specific id
    const id = req.params.id
    query = `delete from posts where post_id = '${id}'`
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

router.route("/posts/:id/:action").put((req,res)=>{
    const id = req.params.id;
    const action = req.params.action;
    //here we are creating upvotes and downvotes for the post.
    //we need to keep in mind that a user can only upvote/downvote once.
    // 1989: upvote 2324: downvote

    const valid_action = ["1989","2324"];
    if(!id || !action){
        return res.status(400).send({eid:10,message:"Error in Query"});
    }

    if(!valid_action.includes(action) || !valid_action.includes(action)){
        return res.status(400).send({eid:11,message:"Error in Query"});
    }

    const query = `select post_votes  from posts where post_id = ${id}`;
    db_pool.getConnection(function(error,connection){
        if(error){
            return res.status(503).send({eid:2,details:"Database servers are down",error:error});
        }
        connection.query(query, (error, results, fields)=>{
            if(error){
                return res.status(503).send({eid:3,details:"Invalid Query",error:error});
            }

            if(results.length == 0){
                //this is , when the given posts id is not found.
                return res.status(400).send({eid:11,message:"Error in Query"});
            }
            let value = parseInt(results[0].post_votes);
            let up_q = "";
            if(value > 0){
                //do normal upvote and downvote
                if(action == "1989"){
                    //upvote
                    up_q = `update posts set post_votes = post_votes + 1 where post_id = ${id}`;
                    value = value + 1;
                }else{
                    up_q = `update posts set post_votes = post_votes - 1 where post_id = ${id}`;
                    value = value - 1;
                }
            }else{
                //value == 0, then for downvote we do nothing, set as 0 again for safety.
                if(action == "1989"){
                    //upvote
                    up_q = `update posts set post_votes = post_votes + 1 where post_id = ${id}`;
                    value = value + 1;
                }else{
                    up_q = `update posts set post_votes = 0 where post_id = ${id}`;
                    value = 0;
                }
            }
            connection.query(up_q,(error,results,fields)=>{
                if(error){
                    return res.status(503).send({eid:3,details:"Invalid Query",error:error});
                }
                res.send({
                    postid:id,
                    votes:value
                });
            });
        });
        connection.release();
    });

});


module.exports = router;