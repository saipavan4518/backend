const router = require('express').Router();
const multer = require('multer');
const dbconn = require("../models/db_orm");
const user = dbconn.user;
const operators = dbconn.seq_main.Op;


const pavan = multer({dest: "./uploads/"});

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
    if(file.mimetype === 'image/jpg' || file.mimetype === 'image/png'){
        cb(null, true);
    }else{
        cb(null, false);
    }
}

const upload = multer({
    storage: storage1
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
    
    const user_inserted = await user.create({
        username : username,
        fullname : fullname,
        regdno : regdno,
        email : email,
        password : password,
        profilepic : path
    }).then((m) =>{
        res.status(200).send({message:m,code:"successfully created",user:user_inserted});
    }).catch((error) =>{
        res.status(500).send({message:error,code:"error in creation"});
    })
});

module.exports = router;