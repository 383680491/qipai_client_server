var crypto = require('../utils/crypto');
var express = require('express');
var userDB = require('../DB/managers/userDBMgr');
var accountDB = require('../DB/managers/accountDBMgr');
var messageDB = require('../DB/managers/messageDBMgr');
var http = require("../utils/http");

var app = express();
var hallAddr = "";

function send(res,ret){
	var str = JSON.stringify(ret);
	res.send(str)
}

var config = null;

exports.start = function(cfg){
	config = cfg;
	hallAddr = config.HALL_IP  + ":" + config.HALL_CLIENT_PORT;
	app.listen(config.CLIENT_PORT);
	console.log("account server is listening on " + config.CLIENT_PORT);
}





//设置跨域访问
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1')
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});

app.get('/register',function(req,res){
	var account = req.query.account;
	var password = req.query.password;

	var fnFailed = function(){
		send(res,{errcode:1,errmsg:"account has been used."});
	};

	var fnSucceed = function(){
		send(res,{errcode:0,errmsg:"ok"});	
	};

	userDB.is_user_exist(account,function(exist){
		if(exist){
			accountDB.create_account(account,password,function(ret){
				if (ret) {
					fnSucceed();
				}
				else{
					fnFailed();
				}
			});
		}
		else{
			fnFailed();
			console.log("account has been used.");			
		}
	});
});

app.get('/get_version',function(req,res){
	var ret = {
		version:config.VERSION,
	}
	send(res,ret);
});

app.get('/get_serverinfo',function(req,res){
	var ret = {
		version:config.VERSION,
		hall:hallAddr,
		appweb:config.APP_WEB,
	}
	send(res,ret);
});

app.get('/guest',function(req,res){
	var account = "guest_" + req.query.account;
	var sign = crypto.md5(account + req.ip + config.ACCOUNT_PRI_KEY);
	var ret = {
		errcode:0,
		errmsg:"ok",
		account:account,
		halladdr:hallAddr,
		sign:sign
	}
	send(res,ret);
});

app.get('/get_message',function(req,res){
	var type = req.query.type;
	
	if(type == null){
		http.send(res,-1,"parameters don't match api requirements.");
		return;
	}
	
	
	if(type == 'control'){
		http.send(res,0,"ok",{msg:0,version:20161128});	
		return;
	}
	var version = req.query.version;
	messageDB.get_message(type,version,function(data){
		if(data != null){
			http.send(res,0,"ok",{msg:data.msg,version:data.version});	
		}
		else{
			http.send(res,1,"get message failed.");
		}
	});
});

app.get('/auth',function(req,res){
	var account = req.query.account;
	var password = req.query.password;

	accountDB.get_account_info(account,password,function(info){
		if(info == null){
			send(res,{errcode:1,errmsg:"invalid account"});
			return;
		}

        var account = "vivi_" + req.query.account;
        var sign = get_md5(account + req.ip + config.ACCOUNT_PRI_KEY);
        var ret = {
            errcode:0,
            errmsg:"ok",
            account:account,
            sign:sign
        }
        send(res,ret);
	});
});

var appInfo = {
	Android:{
		// appid:"wxe39f08522d35c80c",
		// secret:"fa88e3a3ca5a11b06499902cea4b9c01",
		appid:"wxdc2926e2b0973756",
		secret:"e6590011dd16d8ac2c40a4a2bdc7bc54",
	},
	iOS:{
		// appid:"wxcb508816c5c4e2a4",
		// secret:"7de38489ede63089269e3410d5905038",	
		appid:"wxdc2926e2b0973756",
		secret:"e6590011dd16d8ac2c40a4a2bdc7bc54",	
	}
};

function get_access_token(code,os,callback){
	var info = appInfo[os];
	if(info == null){
		callback(false,null);
	}
	var data = {
		appid:info.appid,
		secret:info.secret,
		code:code,
		//grant_type:"client_credential",
		grant_type:"authorization_code"
	};
	//http.get2("https://api.weixin.qq.com/cgi-bin/token",data,callback,true);
	//http.get2("http://oauth.anysdk.com/api/User/LoginOauth/",data,callback,true);
	http.get2("https://api.weixin.qq.com/sns/oauth2/access_token",data,callback,true);
	
}

function get_state_info(access_token,unionid,callback){
	var data = {
		access_token:access_token,
		unionid:unionid
	};

	//http.get2("https://api.weixin.qq.com/sns/userinfo",data,callback,true);
	http.get2("https://api.weixin.qq.com/cgi-bin/user/info",data,callback,true);
}

function create_user(account,name,sex,headimgurl,callback){
	var coins = 1000;
	var gems = 21;
	userDB.is_user_exist(account,function(ret){
		if(!ret){
			userDB.create_user(account,name,coins,gems,sex,headimgurl,function(ret){
				callback();
			});
		}
		else{
			userDB.update_user_info(account,name,headimgurl,sex,function(ret){
				callback();
			});
		}
	});
};

/*
app.get('/wechat_auth',function(req,res){
	var code = req.query.code;
	var os = req.query.os;
	if(code == null || code == "" || os == null || os == ""){
		return;
	}
	console.log(os);
	get_access_token(code,os,function(suc,data){
		if(suc){
			var access_token = data.access_token;
			var openid = data.openid;
			get_state_info(access_token,openid,function(suc2,data2){
				if(suc2){
					var openid = data2.openid;
					var nickname = data2.nickname;
					var sex = data2.sex;
					var headimgurl = data2.headimgurl;
					var account = "wx_" + openid;
					console.log("openid:" + openid + "nickname:" + nickname + "sex:"+sex);
					create_user(account,nickname,sex,headimgurl,function(){
						var sign = crypto.md5(account + req.ip + config.ACCOUNT_PRI_KEY);
					    var ret = {
					        errcode:0,
					        errmsg:"ok",
					        account:account,
					        halladdr:hallAddr,
					        sign:sign
					    };
					    send(res,ret);
					});						
				}
			});
		}
		else{
			send(res,{errcode:-1,errmsg:"unkown err."});
		}
	});
});
*/

app.get('/wechat_auth',function(req,res){
	var data = req.query;
	var unionid = data.unionid;
	if(unionid <= 0){
		return;
	}

	var nickname = data.nickname;
	var sex = data.sex;
	var headimgurl = data.headimgurl;
	var account = "wx_" + unionid;
	create_user(account,nickname,sex,headimgurl,function(){
		var sign = crypto.md5(account + req.ip + config.ACCOUNT_PRI_KEY);
	    var ret = {
	        errcode:0,
	        errmsg:"ok",
	        account:account,
	        halladdr:hallAddr,
	        sign:sign
	    };
	    send(res,ret);
	});	
});

app.get('/base_info',function(req,res){
	var userid = req.query.userid;
	userDB.get_user_base_info(userid,function(data){
		var ret = {
	        errcode:0,
	        errmsg:"ok",
			name:data.name,
			sex:data.sex,
	        headimgurl:data.headimg
	    };
	    send(res,ret);
	});
});