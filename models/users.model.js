function userModel(seq_main, seq_obj){
    return seq_obj.define("user",{
        username:{
            type: seq_main.STRING
        },
        fullname:{
            type: seq_main.STRING
        },
        regdno:{
            type: seq_main.STRING,
            primaryKey: true
        },
        email:{
            type: seq_main.STRING
        },
        password:{
            type: seq_main.STRING
        },
        profilepic:{
            type: seq_main.STRING
        }
    },{
        timestamps: false,
        freezeTableName: true,
        tableName: 'user'
    });
}

module.exports = userModel;