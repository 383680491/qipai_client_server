var crypto = require('../utils/crypto');
var express = require('express');
var http = require('../utils/http');
var roomMgr = require("./roommgr");
var userMgr = require('./usermgr')
var tokenMgr = require("../utils/tokenmgr");
var userDB = require("../DB/managers/userDBMgr");

var app = express();
var config = null;

var serverIp = "";
//测试
app.all('*', function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");
	res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
	res.header("X-Powered-By",' 3.2.1');
	res.header("Content-Type", "application/json;charset=utf-8");
	next();
});

var gameServerInfo = null;
var lastTickTime = 0;

app.get('/get_server_info',function(req,res){
	var serverId = req.query.serverid;
	var sign = req.query.sign;
	console.log(serverId);
	console.log(sign);
	if(serverId  != config.SERVER_ID || sign == null){
		http.send(res,1,"invalid parameters");
		return;
	}

	var md5 = crypto.md5(serverId + config.ROOM_PRI_KEY);
	if(md5 != sign){
		http.send(res,1,"sign check failed.");
		return;
	}

	var locations = roomMgr.getUserLocations();
	var arr = [];
	for(var userId in locations){
		var roomId = locations[userId].roomId;
		arr.push(userId);
		arr.push(roomId);
	}
	http.send(res,0,"ok",{userroominfo:arr});
});

app.get('/create_room',function(req,res){
	var userId = parseInt(req.query.userid);
	var sign = req.query.sign;
	var gems = req.query.gems;
	var conf = req.query.conf;

	if(userId == null || sign == null || conf == null){
		http.send(res,1,"invalid parameters");
		return;
	}

	var md5 = crypto.md5(userId + conf + gems + config.ROOM_PRI_KEY);
	if(md5 != req.query.sign){
		console.log("invalid reuqest.");
		http.send(res,1,"sign check failed.");
		return;
	}

	conf = JSON.parse(conf);
	userDB.get_room_id_of_user(userId,function(roomId){
		//如果用户处于房间中，则需要对其房间进行检查。 如果房间还在，则通知用户进入
		if(roomId != null){
			http.send(res,1,"roomId is not null");
		}
		else{
			roomMgr.createRoom(userId,conf,gems,serverIp,config.CLIENT_PORT,function(errcode,roomId){
				if(errcode != 0 || roomId == null){
					http.send(res,errcode,"create failed.");
					return;	
				}
				else{
					http.send(res,0,"ok",{roomid:roomId});			
				}
			});
		}
	});
});

app.get('/enter_room',function(req,res){
	var userId = parseInt(req.query.userid);
	var name = req.query.name;
	var roomId = req.query.roomid;
	var sign = req.query.sign;
	var gems = req.query.gems;
	if(userId == null || roomId == null || sign == null){
		http.send(res,1,"invalid parameters");
		return;
	}

	var md5 = crypto.md5(userId + name + roomId + config.ROOM_PRI_KEY);
	console.log(req.query);
	console.log(md5);
	if(md5 != sign){
		http.send(res,2,"sign check failed.");
		return;
	}

	//房费aa的时候，加入房间需要检测是否有钻石
	var roomInfo = roomMgr.getRoom(roomId);
	if(roomInfo && roomInfo.conf.koufeixuanze === 1 && gems < 1){
		http.send(res,555,"gems is unfull.");
		return;
	}

	//安排玩家坐下
	var params = {
		roomId:roomId,
		userId:userId,
		name:name
	};
	roomMgr.enterRoom(params,function(ret){
		if(ret != 0){
			if(ret == 1){
				http.send(res,4,"room is full.");
			}
			else if(ret == 2){
				http.send(res,3,"can't find room.");
			}	
			return;		
		}

		var token = tokenMgr.createToken(userId,5000);
		http.send(res,0,"ok",{token:token});
	});
});

app.get('/limit_login',function(req,res){
	var userid = req.query.userId;
	userMgr.sendMsg(userid, 'limit_login', 0);
	http.send(res,0,"limit_login");
});

app.get('/ping',function(req,res){
	var sign = req.query.sign;
	var md5 = crypto.md5(config.ROOM_PRI_KEY);
	if(md5 != sign){
		return;
	}
	http.send(res,0,"pong");
});

app.get('/is_room_runing',function(req,res){
	var roomId = req.query.roomid;
	var sign = req.query.sign;
	if(roomId == null || sign == null){
		http.send(res,1,"invalid parameters");
		return;
	}

	var md5 = crypto.md5(roomId + config.ROOM_PRI_KEY);
	if(md5 != sign){
		http.send(res,2,"sign check failed.");
		return;
	}
	
	http.send(res,0,"ok",{runing:true});
});

//向大厅服定时心跳
function update(){
	if(lastTickTime + config.HTTP_TICK_TIME < Date.now()){
		lastTickTime = Date.now();
		gameServerInfo.load = roomMgr.getTotalRooms();
		http.get(config.HALL_IP,config.HALL_PORT,"/register_gs",gameServerInfo,function(ret,data){
			if(ret == true){
				if(data.errcode != 0){
					console.log(data.errmsg);
				}
				
				if(data.ip != null){
					serverIp = data.ip;
				}
			}
			else{
				lastTickTime = 0;
			}
		});

		var mem = process.memoryUsage();
		var format = function(bytes) {  
              return (bytes/1024/1024).toFixed(2)+'MB';  
        };
	}
};

exports.start = function($config){
	config = $config;

	gameServerInfo = {
		id:config.SERVER_ID,
		serverType:config.SERVER_TYPE,
		clientip:config.CLIENT_IP,
		clientport:config.CLIENT_PORT,
		httpPort:config.HTTP_PORT,
		load:roomMgr.getTotalRooms(),
	};

	setInterval(update,1000);
	app.listen(config.HTTP_PORT,config.FOR_HALL_IP);
	console.log("game server is listening on " + config.FOR_HALL_IP + ":" + config.HTTP_PORT);
};