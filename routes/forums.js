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

router.route("/createpost").post(upload.single('postdata'),async(req,res)=>{
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

router.route("/deletepost/:id").delete((req,res)=>{
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

module.exports = router;