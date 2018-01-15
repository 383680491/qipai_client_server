var crypto = require('../utils/crypto');
var express = require('express');
var sssDB = require('../DB/managers/sssRoomDBMgr');
var sspDB = require('../DB/managers/sspRoomDBMgr');
var wskDB = require('../DB/managers/wskRoomDBMgr');
var userDB = require('../DB/managers/userDBMgr');
var archiveDB = require('../DB/managers/archiveDBMgr');
var archiveDB_SSP = require('../DB/managers/archiveDBMgr_SSP');
var roomDB = require('../DB/managers/roomDBMgr');
var messageDB = require('../DB/managers/messageDBMgr');
var http = require('../utils/http');
var room_service = require("./room_service");

var app = express();
var config = null;
var curDate = null;//当前日期
var addDiamondData = [];//存是否可以添加钻石的数组
var tokenTime = 0;//H5分享获取token的时间

function check_account(req,res){
	var account = req.query.account;
	var sign = req.query.sign;
	if(account == null || sign == null){
		http.send(res,1,"unknown error");
		return false;
	}
	/*
	var serverSign = crypto.md5(account + req.ip + config.ACCOUNT_PRI_KEY);
	if(serverSign != sign){
		http.send(res,2,"login failed.");
		return false;
	}
	*/
	return true;
}

//设置跨域访问
app.all('*', function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");
	res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
	res.header("X-Powered-By",' 3.2.1');
	res.header("Content-Type", "application/json;charset=utf-8");
	next();
});

app.get('/login',function(req,res){
	if(!check_account(req,res)){
		return;
	}
	
	var ip = req.ip;
	if(ip.indexOf("::ffff:") != -1){
		ip = ip.substr(7);
	}
	
	var account = req.query.account;
	userDB.get_user_data(account,function(data){
		if(data == null){
			http.send(res,0,"ok");
			return;
		}

		var ret = {
			account:data.account,
			userid:data.userid,
			name:data.name,
			lv:data.lv,
			exp:data.exp,
			coins:data.coins,
			gems:data.gems,
			ip:ip,
			sex:data.sex,
		};

		userDB.get_room_id_of_user(data.userid,function(roomId){
			var arrDB = [];
			arrDB.push(roomDB);
			arrDB.push(sssDB);
			arrDB.push(sspDB);
			arrDB.push(wskDB);
			var curIndex = 0;
			var fn = function(){
				var curDb = arrDB[curIndex];
				console.log("is_room_exist:"+curIndex);
				curDb.is_room_exist(roomId,function (retval){
					if(retval){
						ret.roomid = roomId;
						http.send(res,0,"ok",ret);
					}
					else{
						curIndex++;
						if (curIndex < arrDB.length) {
							fn();
						}
						else{
							//如果房间不在了，表示信息不同步，清除掉用户记录
							userDB.set_room_id_of_user(data.userid,null);
						}
					}
				});
			};
			//如果用户处于房间中，则需要对其房间进行检查。 如果房间还在，则通知用户进入
			if (roomId != null) {
				fn();
			}
			else{
				http.send(res,0,"ok",ret);
			}
		});
	});
});

app.get('/create_user',function(req,res){
	if(!check_account(req,res)){
		return;
	}
	var account = req.query.account;
	var name = req.query.name;
	var coins = 1000;
	var gems = 21;
	console.log(name);

	userDB.is_user_exist(account,function(ret){
		if(!ret){
			userDB.create_user(account,name,coins,gems,0,null,function(ret){
				if (ret == null) {
					http.send(res,2,"system error.");
				}
				else{
					http.send(res,0,"ok");					
				}
			});
		}
		else{
			http.send(res,1,"account have already exist.");
		}
	});
});

app.get('/is_login',function(req,res){
	var data = req.query;
	var account = data.account;
	userDB.get_user_data(account,function(data){
		if(data == null){
			http.send(res,null,"get user data fail");
			return;
		}
		var userId = data.userid;
		userDB.get_room_id_of_user(userId,function(roomId){
			if(roomId != null){
				http.send(res,roomId,"get roomId success");
			}else{
				http.send(res,null,"get roomId fail");
			}
		});
	});
});

app.get('/limit_login',function(req,res){
	var roomid = req.query.roomid;
	room_service.limitLogin(req,function(err){
		if(err == 0){
			http.send(res,roomid,"ok");
		}else{
			http.send(res,null,"error");
		}		
	});
});

app.get('/create_private_room',function(req,res){
	//验证参数合法性
	var data = req.query;
	//验证玩家身份
	if(!check_account(req,res)){
		return;
	}
	var params = {};
	var account = data.account;

	data.account = null;
	data.sign = null;
	var conf = data.conf;
	var serverType = data.serverType;
	userDB.get_user_data(account,function(data){
		if(data == null){
			http.send(res,1,"system error");
			return;
		}
		var userId = data.userid;
		var name = data.name;
		var gems = data.gems;
		//验证玩家状态
		userDB.get_room_id_of_user(userId,function(roomId){
			if(roomId != null){
				http.send(res,-1,"user is playing in room now.");
				return;
			}
			//创建房间
			room_service.createRoom(account,userId, serverType, conf,function(err,roomId){
				params.userId = userId;
				params.name = name;
				params.roomId = roomId;
				params.serverType = serverType;
				params.gems = gems;
				if(err == 0 && roomId != null){
					room_service.enterRoom(params,function(errcode,enterInfo){

						if(enterInfo){
							var ret = {
								roomid:roomId,
								ip:enterInfo.ip,
								port:enterInfo.port,
								token:enterInfo.token,
								time:Date.now()
							};
							ret.sign = crypto.md5(ret.roomid + ret.token + ret.time + config.ROOM_PRI_KEY);
							http.send(res,0,"ok",ret);
						}
						else{
							http.send(res,errcode,"room doesn't exist.");
						}
					});
				}
				else{
					http.send(res,err,"create failed.");					
				}
			});
		});
	});
});

app.get('/enter_private_room',function(req,res){
	var params = {};
	var data = req.query;
	var roomId = data.roomid;
	var serverType = data.serverType;
	if(roomId == null){
		http.send(res,-1,"parameters don't match api requirements.");
		return;
	}
	if(!check_account(req,res)){
		return;
	}
	
	var account = data.account;

	userDB.get_user_data(account,function(data){
		if(data == null){
			http.send(res,-1,"system error");
			return;
		}
		var userId = data.userid;
		var name = data.name;

		//验证玩家状态
		//todo
		//进入房间
		var params = {};
		params.userId = userId;
		params.name = name;
		params.roomId = roomId;
		params.serverType = serverType;
		params.gems = data.gems;
		room_service.enterRoom(params,function(errcode,enterInfo){
			if(enterInfo){
				var ret = {
					roomid:roomId,
					ip:enterInfo.ip,
					port:enterInfo.port,
					token:enterInfo.token,
					time:Date.now()
				};
				ret.sign = crypto.md5(roomId + ret.token + ret.time + config.ROOM_PRI_KEY);
				http.send(res,0,"ok",ret);
			}
			else{
				http.send(res,errcode,"enter room failed.");
			}
		});
	});
});

app.get('/get_history_list',function(req,res){
	var data = req.query;
	if(!check_account(req,res)){
		return;
	}
	var account = data.account;
	userDB.get_user_data(account,function(data){
		if(data == null){
			http.send(res,-1,"system error");
			return;
		}
		var userId = data.userid;
		userDB.get_user_history(userId,function(history){
			http.send(res,0,"ok",{history:history});
		});
	});
});

app.get('/get_games_of_room',function(req,res){
	var data = req.query;
	var uuid = data.uuid;
	if(uuid == null){
		http.send(res,-1,"parameters don't match api requirements.");
		return;
	}
	if(!check_account(req,res)){
		return;
	}
	archiveDB.get_games_of_room(uuid,function(data){
		console.log(data);
		http.send(res,0,"ok",{data:data});
	});
});

app.get('/get_detail_of_game',function(req,res){
	var data = req.query;
	var uuid = data.uuid;
	var index = data.index;
	if(uuid == null || index == null){
		http.send(res,-1,"parameters don't match api requirements.");
		return;
	}
	if(!check_account(req,res)){
		return;
	}
	archiveDB.get_detail_of_game(uuid,index,function(data){
		http.send(res,0,"ok",{data:data});
	});
});

app.get('/get_SSPgames_of_room',function(req,res){
	var data = req.query;
	var uuid = data.uuid;
	if(uuid == null){
		http.send(res,-1,"parameters don't match api requirements.");
		return;
	}
	if(!check_account(req,res)){
		return;
	}
	archiveDB_SSP.get_games_of_room(uuid,function(data){
		console.log(data);
		http.send(res,0,"ok",{data:data});
	});
});

app.get('/get_detail_of_SSPgame',function(req,res){
	var data = req.query;
	var uuid = data.uuid;
	var index = data.index;
	if(uuid == null || index == null){
		http.send(res,-1,"parameters don't match api requirements.");
		return;
	}
	if(!check_account(req,res)){
		return;
	}
	archiveDB_SSP.get_detail_of_game(uuid,index,function(data){
		http.send(res,0,"ok",{data:data});
	});
});

app.get('/get_detail_of_WSKgame',function(req,res){
	var data = req.query;
	var uuid = data.uuid;
	var index = data.index;
	if(uuid == null || index == null){
		http.send(res,-1,"parameters don't match api requirements.");
		return;
	}
	if(!check_account(req,res)){
		return;
	}
	archiveDB.get_detail_of_game(uuid,index,function(data){
		http.send(res,0,"ok",{data:data});
	});
});

app.get('/get_user_status',function(req,res){
	if(!check_account(req,res)){
		return;
	}
	var account = req.query.account;
	userDB.get_gems(account,function(data){
		if(data != null){
			http.send(res,0,"ok",{gems:data.gems});	
		}
		else{
			http.send(res,1,"get gems failed.");
		}
	});
});

app.get('/H5getToken',function(req,res){
	console.log('H5getToken')
	var data = req.query;

	var isgetToken = false;//是否获取Token
	if(tokenTime <= 0){ //获取token
		tokenTime = 7200000;//7200秒的token有效时间
		isgetToken = true;
		clearInterval(this.H5WXTime);
		this.H5WXTime = setInterval(function(tokenTime){
			tokenTime -= 1000;
		},1000,this);
	}

	var ret = {
		isgetToken:isgetToken
	};
	http.send(res,ret);
});

app.get('/getPayUrl',function(req,res){  //发送支付网站给客户端
	var data = req.query;
	var userId = data.userId;
	var ret = {
		PayUrl:"http://www.doudouyule.wang/wap/page/pay?uid="+userId,
	}
	http.send(res,ret);
});

//添加钻石
app.get('/addDiamond',function(req,res){
	var data = req.query;
	var userId = data.userId;
	var nowtime = data.nowtime;//今天日期
	var cost = 1;

	if(curDate){
		var date1 = new Date(curDate);
		var date2 = new Date(nowtime);
		if(date1.getTime() != date2.getTime() && addDiamondData){ //如果当前日期和传过来的日期不一样
			for(var i = 0;i < addDiamondData.length;i++){
				addDiamondData[i].isAddDiamond = true;//所有玩家设为可以添加钻石
			}
		}
	}

	var isAddUserID = true;//是否在addDiamondData添加userId
	for(var i = 0;i < addDiamondData.length;i++){
		if(addDiamondData[i].userId === userId){
			isAddUserID = false;
		}
	}
	if(isAddUserID){
		var Data = {
			userId:userId,
			isAddDiamond:true,//是否添加钻石
		}
		addDiamondData.push(Data);
	}

	for(var i = 0;i < addDiamondData.length;i++){
		if(addDiamondData[i].userId === userId && addDiamondData[i].isAddDiamond){ //可以添加钻石
			userDB.addDiamond(userId,cost);
			curDate = nowtime;//改变当前日期
			addDiamondData[i].isAddDiamond = false;
		}
	}
});

app.get('/get_message',function(req,res){
	if(!check_account(req,res)){
		return;
	}
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

app.get('/is_server_online',function(req,res){
	if(!check_account(req,res)){
		return;
	}
	var ip = req.query.ip;
	var port = req.query.port;
	var serverType = req.query.serverType;
	room_service.isServerOnline(ip,port, serverType, function(isonline){
		var ret = {
			isonline:isonline
		};
		http.send(res,0,"ok",ret);
	}); 
});

exports.start = function($config){
	config = $config;
	app.listen(config.CLEINT_PORT);
	console.log("client service is listening on port " + config.CLEINT_PORT);
};