var crypto = require('../../utils/crypto');
var sqlClient = require('../sqlClient');

var gamesDBMgr = {};

function nop(a,b,c,d,e,f,g){
};

gamesDBMgr.create_game = function(room_uuid,index,base_info,callback){
    callback = callback == null? nop:callback;
    var sql = "INSERT INTO t_games(room_uuid,game_index,base_info,create_time) VALUES('{0}',{1},'{2}',unix_timestamp(now()))";
    sql = sql.format(room_uuid,index,base_info);
    //console.log(sql);
    sqlClient.query(sql,function(err,rows,fields){
        if(err){
            callback(null);
            throw err;
        }
        else{
            callback(rows.insertId);
        }
    });
};

gamesDBMgr.delete_games = function(room_uuid,callback){
    callback = callback == null? nop:callback;
    if(room_uuid == null){
        callback(false);
    }    
    var sql = "DELETE FROM t_games WHERE room_uuid = '{0}'";
    sql = sql.format(room_uuid);
    console.log(sql);
    sqlClient.query(sql,function(err,rows,fields){
        if(err){
            callback(false);
            throw err;
        }
        else{
            callback(true);
        }
    });
};

gamesDBMgr.update_game_action_records = function(room_uuid,index,actions,callback){
    callback = callback == null? nop:callback;
    var sql = "UPDATE t_games SET action_records = '"+ actions +"' WHERE room_uuid = '" + room_uuid + "' AND game_index = " + index ;
    //console.log(sql);
    sqlClient.query(sql,function(err,rows,fields){
        if(err){
            callback(false);
            throw err;
        }
        else{
            callback(true);
        }
    });
};

gamesDBMgr.update_game_result = function(room_uuid,index,result,callback){
    callback = callback == null? nop:callback;
    if(room_uuid == null || result){
        callback(false);
    }
    
    result = JSON.stringify(result);
    var sql = "UPDATE t_games SET result = '"+ result +"' WHERE room_uuid = '" + room_uuid + "' AND game_index = " + index ;
    //console.log(sql);
    sqlClient.query(sql,function(err,rows,fields){
        if(err){
            callback(false);
            throw err;
        }
        else{
            callback(true);
        }
    });
};

gamesDBMgr.update_game_jushu = function(room_uuid,index,win,lose,draw,callback){
    callback = callback == null? nop:callback;
    if(room_uuid == null || win || lose || lose){
        callback(false);
    }
    
    win = JSON.stringify(win);
    lose = JSON.stringify(lose);
    draw = JSON.stringify(draw);
    var sql = "UPDATE t_games SET win = '"+ win +"',lose = '"+ lose +"',draw = '"+ draw +"' WHERE room_uuid = '" + room_uuid + "' AND game_index = " + index ;
    //console.log(sql);
    sqlClient.query(sql,function(err,rows,fields){
        if(err){
            callback(false);
            throw err;
        }
        else{
            callback(true);
        }
    });
};

module.exports = gamesDBMgr;