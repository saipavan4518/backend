const express = require('express');
const multer = require('multer');
const cors = require('cors');
const http = require('http');

/*const dbconn = require('./models/db_orm')

//sync with db
try{
    dbconn.seq_obj.sync()
        .then(()=>{
            console.log("(*)Synced with Remote Database")
        })
        .catch((error)=>{
            console.log(`this is error\n${error}`)
        });
}catch(error){
    console.log("error in server.js")
}*/



const app = express();

require('dotenv').config();


//import routes
const userLogin = require("./routes/userlogin-backup");
const userRegister = require("./routes/userRegister-backup");
const forums = require("./routes/forums");
const profile = require("./routes/profile");


app.use(cors());
app.use(express.json());
app.use("/uploads/profile_images",express.static("./uploads/profile_images"));
app.use("/uploads/posts",express.static("./uploads/posts"));



app.use("/api/user/login",userLogin);
app.use("/api/user/register",userRegister);
app.use("/api/forums",forums);
app.use("/api/profiles/",profile);


var server = http.createServer(app);
const io = require('socket.io')(server,{
    cors: {
        origin: '*',
      }
});

io.on('connection',client =>{
    client.on('render_threads',()=>{
        //this is for re-rendering the components
        io.emit("render_threads_client")
        console.log("rendering the threads")
    })

    client.on('update_threads',(data)=>{
        // this is for upvote and downvote
        console.log(data)
        // emit this data to every person, except the sender
        client.broadcast.emit("update_threads_client",data)
    })

    client.on('disconnect',()=>{
        console.log('client disconnected');
    })
});



server.listen(8110, ()=>{
    console.log("Server up and running with socket io functio");
});