var crypto = require('../../utils/crypto');
var sqlClient = require('../sqlClient');

var sspRoomDBMgr = {};

function nop(a,b,c,d,e,f,g){
};

sspRoomDBMgr.is_room_exist = function(roomId,callback){
    callback = callback == null? nop:callback;
    var sql = 'SELECT * FROM t_ssp_rooms WHERE id = "' + roomId + '"';
    sqlClient.query(sql, function(err, rows, fields) {
        if(err){
            callback(false);
            throw err;
        }
        else{
            callback(rows.length > 0);
        }
    });
};

sspRoomDBMgr.create_room = function(roomId,conf,ip,port,create_time,callback){
    callback = callback == null? nop:callback;
    var sql = "INSERT INTO t_ssp_rooms(uuid,id,base_info,ip,port,create_time) \
                VALUES('{0}','{1}','{2}','{3}',{4},{5})";
    var uuid = Date.now() + roomId;
    var baseInfo = JSON.stringify(conf);
    sql = sql.format(uuid,roomId,baseInfo,ip,port,create_time);
    console.log(sql);
    sqlClient.query(sql,function(err,row,fields){
        if(err){
            callback(null);
            throw err;
        }
        else{
            callback(uuid);
        }
    });
};

sspRoomDBMgr.get_room_uuid = function(roomId,callback){
    callback = callback == null? nop:callback;
    var sql = 'SELECT uuid FROM t_ssp_rooms WHERE id = "' + roomId + '"';
    sqlClient.query(sql,function(err,rows,fields){
        if(err){
            callback(null);
            throw err;
        }
        else{
            callback(rows[0].uuid);
        }
    });
};

sspRoomDBMgr.update_seat_info = function(roomId,seatIndex,userId,icon,name,callback){
    callback = callback == null? nop:callback;
    var sql = 'UPDATE t_ssp_rooms SET user_id{0} = {1},user_icon{0} = "{2}",user_name{0} = "{3}" WHERE id = "{4}"';
    name = crypto.toBase64(name);
    sql = sql.format(seatIndex,userId,icon,name,roomId);
    //console.log(sql);
    sqlClient.query(sql,function(err,row,fields){
        if(err){
            callback(false);
            throw err;
        }
        else{
            callback(true);
        }
    });
}

sspRoomDBMgr.update_num_of_turns = function(roomId,numOfTurns,callback){
    callback = callback == null? nop:callback;
    var sql = 'UPDATE t_ssp_rooms SET num_of_turns = {0} WHERE id = "{1}"'
    sql = sql.format(numOfTurns,roomId);
    //console.log(sql);
    sqlClient.query(sql,function(err,row,fields){
        if(err){
            callback(false);
            throw err;
        }
        else{
            callback(true);
        }
    });
};


sspRoomDBMgr.update_next_button = function(roomId,nextButton,callback){
    callback = callback == null? nop:callback;
    var sql = 'UPDATE t_ssp_rooms SET next_button = {0} WHERE id = "{1}"'
    sql = sql.format(nextButton,roomId);
    //console.log(sql);
    sqlClient.query(sql,function(err,row,fields){
        if(err){
            callback(false);
            throw err;
        }
        else{
            callback(true);
        }
    });
};

sspRoomDBMgr.get_room_addr = function(roomId,callback){
    callback = callback == null? nop:callback;
    if(roomId == null){
        callback(false,null,null);
        return;
    }

    var sql = 'SELECT ip,port FROM t_ssp_rooms WHERE id = "' + roomId + '"';
    sqlClient.query(sql, function(err, rows, fields) {
        if(err){
            callback(false,null,null);
            throw err;
        }
        if(rows.length > 0){
            callback(true,rows[0].ip,rows[0].port);
        }
        else{
            callback(false,null,null);
        }
    });
};

sspRoomDBMgr.get_room_data = function(roomId,callback){
    callback = callback == null? nop:callback;
    if(roomId == null){
        callback(null);
        return;
    }

    var sql = 'SELECT * FROM t_ssp_rooms WHERE id = "' + roomId + '"';
    sqlClient.query(sql, function(err, rows, fields) {
        if(err){
            callback(null);
            throw err;
        }
        if(rows.length > 0){
            rows[0].user_name0 = crypto.fromBase64(rows[0].user_name0);
            rows[0].user_name1 = crypto.fromBase64(rows[0].user_name1);
            rows[0].user_name2 = crypto.fromBase64(rows[0].user_name2);
            rows[0].user_name3 = crypto.fromBase64(rows[0].user_name3);
            callback(rows[0]);
        }
        else{
            callback(null);
        }
    });
};

sspRoomDBMgr.delete_room = function(roomId,callback){
    callback = callback == null? nop:callback;
    if(roomId == null){
        callback(false);
    }
    var sql = "DELETE FROM t_ssp_rooms WHERE id = '{0}'";
    sql = sql.format(roomId);
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

module.exports = sspRoomDBMgr;