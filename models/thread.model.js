function thread(seq_main, seq_obj){
    return new seq_obj.define("threads",
    {
    },
    {
        timestamps: false,
        freezeTableName: true,
        tableName: 'threads' 
    });
}

module.exports = thread;