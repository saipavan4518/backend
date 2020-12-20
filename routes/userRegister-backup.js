const router = require('express').Router();
const multer = require('multer');
const db_pool = require("../db-config");


var fileNameObtained = ''
const storage1 = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, "./uploads/profile_images");
    },
    filename: function(req, file, cb){ 
        //windows doesnt support : element, so we need to replace.
        fileNameObtained = "img_"+new Date().toISOString().replace(/:/g,'')+"_"+file.originalname;
        cb(null, fileNameObtained);
    }
});

const fileFilter = (req, file, cb) =>{
    if(file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
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
        //10 mb max size
    }
})

router.route("/").post(upload.single('profilepic'),async (req,res)=>{
    const username = req.body.username;
    const fullname = req.body.fullname;
    const regdno = req.body.regdno;
    const email = req.body.email;
    const password = req.body.password;

    var path = "http://localhost:8110/uploads/profile_images/"+fileNameObtained;

    const query = `insert into user values("${username}","${fullname}","${regdno}","${email}","${password}","${path}")`
    
    db_pool.getConnection(function(error,connection){
        if(error){
            return res.status(200).send({eid:2,details:"Database servers are down",error:error});
        }

        connection.query(query,function(error, results, fields){
            if(error){
                return res.status(200).send({eid:3,details:"Invalid Query",error:error});
            }
            return res.send({
                eid:0,
                details:"Registration Successful"
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