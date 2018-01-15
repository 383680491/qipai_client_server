var crypto = require('../utils/crypto');
var express = require('express');
var userDBMgr = require('../DB/managers/userDBMgr');
var http = require('../utils/http');
var app = express();

var hallIp = null;
var config = null;
var rooms = {};
var roomDB = {};
roomDB["MJ_SERVER_TYPE"] = require('../DB/managers/roomDBMgr');
roomDB["SSS_SERVER_TYPE"] = require('../DB/managers/sssRoomDBMgr')
roomDB["SSP_SERVER_TYPE"] = require('../DB/managers/sspRoomDBMgr')
roomDB["WSK_SERVER_TYPE"] = require('../DB/managers/wskRoomDBMgr')
var serverMap = {};
serverMap["MJ_SERVER_TYPE"] = {};
serverMap["SSS_SERVER_TYPE"] = {};
serverMap["SSP_SERVER_TYPE"] = {};
serverMap["WSK_SERVER_TYPE"] = {};
var roomIdOfUsers = {};

//设置跨域访问
app.all('*', function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");
	res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
	res.header("X-Powered-By",' 3.2.1');
	res.header("Content-Type", "application/json;charset=utf-8");
	next();
});

app.get('/register_gs',function(req,res){
	
	var ip = req.ip;
	var clientip = req.query.clientip;
	var clientport = req.query.clientport;
	var httpPort = req.query.httpPort;
	var load = req.query.load;
	var id = clientip + ":" + clientport;
	var serverType = req.query.serverType;

	if(serverMap[serverType][id]){
		var info = serverMap[serverType][id];
		if(info.clientport != clientport
			|| info.httpPort != httpPort
			|| info.ip != ip
		){
			console.log("duplicate gsid:" + id + ",addr:" + ip + "(" + httpPort + ")");
			http.send(res,1,"duplicate gsid:" + id);
			return;
		}
		info.load = load;
		http.send(res,0,"ok",{ip:ip});
		return;
	}
	serverMap[serverType][id] = {
		ip:ip,
		id:id,
		type:serverType,
		clientip:clientip,
		clientport:clientport,
		httpPort:httpPort,
		load:load
	};
	http.send(res,0,"ok",{ip:ip});
	console.log("game server registered.\n\tid:" + id + "\n\taddr:" + ip + "\n\thttp port:" + httpPort + "\n\tsocket clientport:" + clientport);

	var reqdata = {
		serverid:id,
		sign:crypto.md5(id+config.ROOM_PRI_KEY)
	};
	//获取服务器信息
	http.get(ip,httpPort,"/get_server_info",reqdata,function(ret,data){
		if(ret && data.errcode == 0){
			for(var i = 0; i < data.userroominfo.length; i += 2){
				var userId = data.userroominfo[i];
				var roomId = data.userroominfo[i+1];
			}
		}
		else{
			console.log(data.errmsg);
		}
	});
});

function chooseServer(serverType){
	var serverinfo = null;
	for(var s in serverMap[serverType]){
		var info = serverMap[serverType][s];
		if(serverinfo == null){
			serverinfo = info;			
		}
		else{
			if(serverinfo.load > info.load){
				serverinfo = info;
			}
		}
	}	
	return serverinfo;
}

exports.limitLogin = function(data,fnCallback){
	var serverType = data.query.serverType;
	var serverinfo = chooseServer(serverType);
	if(serverinfo == null){
		fnCallback(1);
		return;
	}
	var reqdata = {};
	reqdata.userId = data.query.userid;
	http.get(serverinfo.ip,serverinfo.httpPort,"/limit_login",reqdata,function(ret,data){
		if(ret){
			fnCallback(0);
		}
	});
};

exports.createRoom = function(account,userId, serverType,roomConf,fnCallback){
	var serverinfo = chooseServer(serverType);
	if(serverinfo == null){
		fnCallback(101,null);
		return;
	}
	
	userDBMgr.get_gems(account,function(data){
		if(data != null){
			//2、请求创建房间
			var reqdata = {
				userid:userId,
				gems:data.gems,
				conf:roomConf
			};
			reqdata.sign = crypto.md5(userId + roomConf + data.gems + config.ROOM_PRI_KEY);
			http.get(serverinfo.ip,serverinfo.httpPort,"/create_room",reqdata,function(ret,data){
				//console.log(data);
				if(ret){
					if(data.errcode == 0){
						fnCallback(0,data.roomid);
					}
					else{
						fnCallback(data.errcode,null);		
					}
					return;
				}
				fnCallback(102,null);
			});	
		}
		else{
			fnCallback(103,null);
		}
	});
};

exports.enterRoom = function(params,fnCallback){
	var userId = params.userId;
	var name = params.name;
	var roomId = params.roomId;
	var serverType = params.serverType;
	var gems = params.gems;

	var arrServerType = ['MJ_SERVER_TYPE','SSS_SERVER_TYPE','SSP_SERVER_TYPE','WSK_SERVER_TYPE'];
	if (-1 === arrServerType.indexOf(serverType)) {
		fnCallback(-3,null);
		return;
	}

	var reqdata = {
		userid:userId,
		name:name,
		roomid:roomId,
		serverType:serverType,
		gems:gems,
	};
	reqdata.sign = crypto.md5(userId + name + roomId + config.ROOM_PRI_KEY);

	var checkRoomIsRuning = function(serverinfo,roomId,callback){
		var sign = crypto.md5(roomId + config.ROOM_PRI_KEY);
		http.get(serverinfo.ip,serverinfo.httpPort,"/is_room_runing",{roomid:roomId,sign:sign},function(ret,data){
			if(ret){
				if(data.errcode == 0 && data.runing == true){
					callback(true);
				}
				else{
					callback(false);
				}
			}
			else{
				callback(false);
			}
		});
	}

	var enterRoomReq = function(serverinfo){
		http.get(serverinfo.ip,serverinfo.httpPort,"/enter_room",reqdata,function(ret,data){
			console.log(data);
			if(ret){
				if(data.errcode == 0){
					userDBMgr.set_room_id_of_user(userId,roomId,function(ret){
						fnCallback(0,{
							ip:serverinfo.clientip,
							port:serverinfo.clientport,
							token:data.token
						});
					});
				}
				else{
					console.log(data.errmsg);
					fnCallback(data.errcode,null);
				}
			}
			else{
				fnCallback(-1,null);
			}
		});
	};

	var chooseServerAndEnter = function(nserverType){
		serverinfo = chooseServer(nserverType);
		if(serverinfo != null){
			enterRoomReq(serverinfo);
		}
		else{
			fnCallback(-1,null);					
		}
	}

	roomDB[serverType].get_room_addr(roomId,function(ret,ip,port){
		if(ret){
			var id = ip + ":" + port;
			var serverinfo = serverMap[serverType][id];
			if(serverinfo != null){
				checkRoomIsRuning(serverinfo,roomId,function(isRuning){
					if(isRuning){
						enterRoomReq(serverinfo);
					}
					else{
						chooseServerAndEnter(serverType);
					}
				});
			}
			else{
				chooseServerAndEnter(serverType);
			}
		}
		else{
			fnCallback(-2,null);
		}
	});
};

exports.isServerOnline = function(ip,port, serverType, callback){
	var id = ip + ":" + port;
	var serverInfo = serverMap[serverType][id];
	if(!serverInfo){
		callback(false);
		return;
	}
	var sign = crypto.md5(config.ROOM_PRI_KEY);
	http.get(serverInfo.ip,serverInfo.httpPort,"/ping",{sign:sign},function(ret,data){
		if(ret){
			callback(true);
		}
		else{
			callback(false);
		}
	});
};

exports.start = function($config){
	config = $config;
	app.listen(config.ROOM_PORT,config.FOR_ROOM_IP);
	console.log("room service is listening on " + config.FOR_ROOM_IP + ":" + config.ROOM_PORT);
};