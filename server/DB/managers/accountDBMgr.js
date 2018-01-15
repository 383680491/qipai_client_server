var crypto = require('../../utils/crypto');
var sqlClient = require('../sqlClient');

var accountDbMgr = {};

function nop(a,b,c,d,e,f,g){
}

accountDbMgr.is_account_exist = function(account,callback) {
	// body...
	callback = callback == null? nop:callback;
    if(account == null){
        callback(false);
        return;
    }

    var sql = 'SELECT * FROM t_accounts WHERE account = "' + account + '"';
    sqlClient.query(sql, function(err, rows, fields) {
        if (err) {
            callback(false);
            throw err;
        }
        else{
            if(rows.length > 0){
                callback(true);
            }
            else{
                callback(false);
            }
        }
    });
};

accountDbMgr.create_account = function(account,password,callback){
	callback = callback == null? nop:callback;
    if(account == null || password == null){
        callback(false);
        return;
    }

    var psw = crypto.md5(password);
    var sql = 'INSERT INTO t_accounts(account,password) VALUES("' + account + '","' + psw + '")';
    sqlClient.query(sql, function(err, rows, fields) {
        if (err) {
            if(err.code == 'ER_DUP_ENTRY'){
                callback(false);
                return;         
            }
            callback(false);
            throw err;
        }
        else{
            callback(true);            
        }
    });
};

accountDbMgr.get_account_info = function(account,password,callback){
	callback = callback == null? nop:callback;
    if(account == null){
        callback(null);
        return;
    }  

    var sql = 'SELECT * FROM t_accounts WHERE account = "' + account + '"';
    sqlClient.query(sql, function(err, rows, fields) {
        if (err) {
            callback(null);
            throw err;
        }
        
        if(rows.length == 0){
            callback(null);
            return;
        }
        
        if(password != null){
            var psw = crypto.md5(password);
            if(rows[0].password == psw){
                callback(null);
                return;
            }    
        }

        callback(rows[0]);
    });
};

module.exports = accountDbMgr;