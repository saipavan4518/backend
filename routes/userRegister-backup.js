const router = require('express').Router();
const multer = require('multer');
const db_pool = require("../db-config");


const storage1 = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, "./uploads/profile_images");
    },
    filename: function(req, file, cb){ 
        //windows doesnt support : element, so we need to replace.
        cb(null, new Date().toISOString().replace(/:/g,'')+"_"+file.originalname);
    }
});

const fileFilter = (req, file, cb) =>{
    if(file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg'){
        cb(null, true);
    }else{
        cb(null, false);
    }
}

const upload = multer({
    storage: storage1,
    fileFilter: fileFilter,
    limits: {
        fileSize: 1000*1000*3
    }
})

router.route("/").post(upload.single('profilepic'),async (req,res)=>{
    //console.log(req.file);
    const username = req.body.username;
    const fullname = req.body.fullname;
    const regdno = req.body.regdno;
    const email = req.body.email;
    const password = req.body.password;

    var path = "http://localhost:8110/"+req.file.path.replace(/\\/g,'/');

    const query = `insert into user values("${username}","${fullname}","${regdno}","${email}","${password}","${path}")`
    
    db_pool.getConnection(function(error,connection){
        if(error){
            return res.status(503).send({eid:2,details:"Database servers are down",error:error});
        }

        connection.query(query,function(error, results, fields){
            if(error){
                return res.status(503).send({eid:3,details:"Invalid Query",error:error});
            }
            return res.send({
                eid:0,
                details:"successfully inserted"
            });
        });

        connection.release();
    });

    /*db_pool.query(query,function(error, results, fields){
        if(error){
            return res.status(503).send({eid:3,details:"Invalid Query",error:error});
        }
        return res.send({
            error:error,
            results:results
        })
    });*/
});

module.exports = router;