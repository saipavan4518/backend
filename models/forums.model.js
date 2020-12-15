function forumsModel(seq_main, seq_obj){
    return seq_obj.define("forums",{
        forum_id:{
            type: seq_main.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        forum_name:{
            type: seq_main.STRING,
            unique: true
        },
        forum_priority:{
            type: seq_main.INTEGER
        }
    },{
        timestamps: false,
        freezeTableName: true,
        tableName: 'forums' 
    });
}

module.exports = forumsModel;