const express = require('express');
const multer = require('multer');
const cors = require('cors');
const dbconn = require('./models/db_orm')

//sync with db
try{
    dbconn.seq_obj.sync().then(console.log("yes")).catch((error)=>{console.log(`this is error\n${error}`)});
}catch(error){
    console.log("error in server.js")
}



const app = express();

require('dotenv').config();


//import routes
const userLogin = require("./routes/userLogin");
const userRegister = require("./routes/userRegister");



app.use(cors());
app.use(express.json());
app.use("/uploads/profile_images",express.static("./uploads/profile_images"));



app.use("/api/user/login",userLogin);
app.use("/api/user/register",userRegister);

app.listen(8110, ()=>{
    console.log("Server up and running");
});