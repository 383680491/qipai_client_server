var crypto = require('../../utils/crypto');
var sqlClient = require('../sqlClient');

var messageDBMgr = {};

function nop(a,b,c,d,e,f,g){
};

messageDBMgr.get_message = function(type,version,callback){
    callback = callback == null? nop:callback;
    
    var sql = 'SELECT * FROM t_message WHERE type = "'+ type + '"';
    
    if(version == "null"){
        version = null;
    }
    
    if(version){
        version = '"' + version + '"';
        sql += ' AND version != ' + version;   
    }
     
    sqlClient.query(sql, function(err, rows, fields) {
        if(err){
            callback(false);
            throw err;
        }
        else{
            if(rows.length > 0){
                callback(rows[0]);    
            }
            else{
                callback(null);
            }
        }
    });
};

module.exports = messageDBMgr;