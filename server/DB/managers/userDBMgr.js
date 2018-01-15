var crypto = require('../../utils/crypto');
var sqlClient = require('../sqlClient');

var userDBMgr = {};

function nop(a,b,c,d,e,f,g){
}

userDBMgr.is_user_exist = function(account,callback){
    callback = callback == null? nop:callback;
    if(account == null){
        callback(false);
        return;
    }

    var sql = 'SELECT userid FROM t_users WHERE account = "' + account + '"';
    sqlClient.query(sql, function(err, rows, fields) {
        if (err) {
            throw err;
        }

        if(rows.length == 0){
            callback(false);
            return;
        }

        callback(true);
    });  
};
userDBMgr.get_user_data = function(account,callback){
    callback = callback == null? nop:callback;
    if(account == null){
        callback(null);
        return;
    }

    var sql = 'SELECT userid,account,name,lv,exp,coins,gems,roomid FROM t_users WHERE account = "' + account + '"';
    sqlClient.query(sql, function(err, rows, fields) {
        if (err) {
            callback(null);
            throw err;
        }

        if(rows.length == 0){
            callback(null);
            return;
        }
        rows[0].name = crypto.fromBase64(rows[0].name);
        callback(rows[0]);
    });
};

userDBMgr.get_user_data_by_userid = function(userid,callback){
    callback = callback == null? nop:callback;
    if(userid == null){
        callback(null);
        return;
    }

    var sql = 'SELECT userid,account,name,lv,exp,coins,gems,roomid FROM t_users WHERE userid = ' + userid;
    sqlClient.query(sql, function(err, rows, fields) {
        if (err) {
            callback(null);
            throw err;
        }

        if(rows.length == 0){
            callback(null);
            return;
        }
        rows[0].name = crypto.fromBase64(rows[0].name);
        callback(rows[0]);
    });
};

/**增加玩家房卡 */
userDBMgr.add_user_gems = function(userid,gems,callback){
    callback = callback == null? nop:callback;
    if(userid == null){
        callback(false);
        return;
    }
    
    var sql = 'UPDATE t_users SET gems = gems +' + gems + ' WHERE userid = ' + userid;
    console.log(sql);
    sqlClient.query(sql,function(err,rows,fields){
        if(err){
            console.log(err);
            callback(false);
            return;
        }
        else{
            callback(rows.affectedRows > 0);
            return; 
        } 
    });
};

userDBMgr.get_gems = function(account,callback){
    callback = callback == null? nop:callback;
    if(account == null){
        callback(null);
        return;
    }

    var sql = 'SELECT gems FROM t_users WHERE account = "' + account + '"';
    sqlClient.query(sql, function(err, rows, fields) {
        if (err) {
            callback(null);
            throw err;
        }

        if(rows.length == 0){
            callback(null);
            return;
        }

        callback(rows[0]);
    });
}; 

userDBMgr.get_user_history = function(userId,callback){
    callback = callback == null? nop:callback;
    if(userId == null){
        callback(null);
        return;
    }

    var sql = 'SELECT history FROM t_users WHERE userid = "' + userId + '"';
    sqlClient.query(sql, function(err, rows, fields) {
        if (err) {
            callback(null);
            throw err;
        }

        if(rows.length == 0){
            callback(null);
            return;
        }
        var history = rows[0].history;
        if(history == null || history == ""){
            callback(null);    
        }
        else{
            console.log(history.length);
            history = JSON.parse(history);
            callback(history);
        }        
    });
};

userDBMgr.update_user_history = function(userId,history,callback){
    callback = callback == null? nop:callback;
    if(userId == null || history == null){
        callback(false);
        return;
    }

    history = JSON.stringify(history);
    var sql = 'UPDATE t_users SET roomid = null, history = \'' + history + '\' WHERE userid = "' + userId + '"';
    //console.log(sql);
    sqlClient.query(sql, function(err, rows, fields) {
        if (err) {
            callback(false);
            throw err;
        }

        if(rows.length == 0){
            callback(false);
            return;
        }

        callback(true);
    });
};
userDBMgr.create_user = function(account,name,coins,gems,sex,headimg,callback){
    callback = callback == null? nop:callback;
    if(account == null || name == null || coins==null || gems==null){
        callback(false);
        return;
    }
    if(headimg){
        headimg = '"' + headimg + '"';
    }
    else{
        headimg = 'null';
    }
    name = crypto.toBase64(name);
    var sql = 'INSERT INTO t_users(account,name,coins,gems,sex,headimg) VALUES("{0}","{1}",{2},{3},{4},{5})';
    sql = sql.format(account,name,coins,gems,sex,headimg);
    console.log(sql);
    sqlClient.query(sql, function(err, rows, fields) {
        if (err) {
            throw err;
        }
        callback(true);
    });
};

userDBMgr.update_user_info = function(userid,name,headimg,sex,callback){
    callback = callback == null? nop:callback;
    if(userid == null){
        callback(null);
        return;
    }
 
    if(headimg){
        headimg = '"' + headimg + '"';
    }
    else{
        headimg = 'null';
    }
    name = crypto.toBase64(name);
    var sql = 'UPDATE t_users SET name="{0}",headimg={1},sex={2} WHERE account="{3}"';
    sql = sql.format(name,headimg,sex,userid);
    console.log(sql);
    sqlClient.query(sql, function(err, rows, fields) {
        if (err) {
            throw err;
        }
        callback(rows);
    });
};

userDBMgr.get_user_base_info = function(userid,callback){
    callback = callback == null? nop:callback;
    if(userid == null){
        callback(null);
        return;
    }
    var sql = 'SELECT name,sex,headimg FROM t_users WHERE userid={0}';
    sql = sql.format(userid);
    console.log(sql);
    sqlClient.query(sql, function(err, rows, fields) {
        if (err) {
            throw err;
        }
        rows[0].name = crypto.fromBase64(rows[0].name);
        callback(rows[0]);
    });
};

userDBMgr.cost_gems = function(userid,cost,callback){
    callback = callback == null? nop:callback;
    var sql = 'UPDATE t_users SET gems = gems -' + cost + ' WHERE userid = ' + userid;
    console.log(sql);
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

userDBMgr.addDiamond = function(userid,cost,callback){
    callback = callback == null? nop:callback;
    var sql = 'UPDATE t_users SET gems = gems +' + cost + ' WHERE userid = ' + userid;
    console.log(sql);
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

userDBMgr.set_room_id_of_user = function(userId,roomId,callback){
    callback = callback == null? nop:callback;
    if(roomId != null){
        roomId = '"' + roomId + '"';
    }
    var sql = 'UPDATE t_users SET roomid = '+ roomId + ' WHERE userid = "' + userId + '"';
    console.log(sql);
    sqlClient.query(sql, function(err, rows, fields) {
        if(err){
            console.log(err);
            callback(false);
            throw err;
        }
        else{
            callback(rows.length > 0);
        }
    });
};

userDBMgr.get_room_id_of_user = function(userId,callback){
    callback = callback == null? nop:callback;
    var sql = 'SELECT roomid FROM t_users WHERE userid = "' + userId + '"';
    sqlClient.query(sql, function(err, rows, fields) {
        if(err){
            callback(null);
            throw err;
        }
        else{
            if(rows.length > 0){
                callback(rows[0].roomid);
            }
            else{
                callback(null);
            }
        }
    });
};

module.exports = userDBMgr;