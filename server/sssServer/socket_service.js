var crypto = require('../utils/crypto');

var tokenMgr = require('../utils/tokenmgr');
var roomMgr = require('./roommgr');
var userMgr = require('./usermgr');
var GameState = require('./Define').GameState;
var io = null;
exports.start = function(config,mgr){
	io = require('socket.io')(config.CLIENT_PORT);
	
	io.sockets.on('connection',function(socket){
		socket.on('login',function(data){
			data = JSON.parse(data);
			if(socket.userId != null){
				//已经登陆过的就忽略
				return;
			}
			var token = data.token;
			var roomId = data.roomid;
			var time = data.time;
			var sign = data.sign;

			console.log(roomId);
			console.log(token);
			console.log(time);
			console.log(sign);

			
			//检查参数合法性
			if(token == null || roomId == null || sign == null || time == null){
				console.log(1);
				socket.emit('login_result',{errcode:1,errmsg:"invalid parameters"});
				return;
			}
			
			//检查参数是否被篡改
			var md5 = crypto.md5(roomId + token + time + config.ROOM_PRI_KEY);
			if(md5 != sign){
				console.log(2);
				socket.emit('login_result',{errcode:2,errmsg:"login failed. invalid sign!"});
				return;
			}
			
			//检查token是否有效
			if(tokenMgr.isTokenValid(token)==false){
				console.log(3);
				socket.emit('login_result',{errcode:3,errmsg:"token out of time."});
				return;
			}
			
			//检查房间合法性
			var userId = tokenMgr.getUserID(token);
			userMgr.sendMsg(userId, 'limit_login', 0);
			userMgr.disconnectSocket(userId);
			userMgr.bind(userId,socket);
			socket.userId = userId;

			//返回房间信息
			var roomInfo = roomMgr.getRoom(roomId);
			
			var seatIndex = roomMgr.getUserSeat(userId);
			
			roomInfo.seats[seatIndex].ip = socket.handshake.address;

			var userData = null;
			var seats = [];
			for(var i = 0; i < roomInfo.seats.length; ++i){
				var rs = roomInfo.seats[i];
				var online = false;
				if(rs.userId > 0){
					online = userMgr.isOnline(rs.userId);
				}

				seats.push({
					userid:rs.userId,
					ip:rs.ip,
					score:rs.score,
					name:rs.name,
					online:online,
					ready:rs.ready,
					seatindex:i
				});

				if(userId == rs.userId){
					userData = seats[i];
				}
			}

			//通知前端
			var ret = {
				errcode:0,
				errmsg:"ok",
				data:{
					roomid:roomInfo.id,
					conf:roomInfo.conf,
					numofgames:roomInfo.numOfGames,
					wanfa:roomInfo.conf.wanfa,
					seats:seats
				}
			};
			var roomId = roomMgr.getUserRoom(userId);
			if(roomMgr.isCreator(roomId,userId)){
				socket.gameMgr = roomInfo.gameMgr;
				//如果游戏已经开始，则不可以
				if(socket.gameMgr.hasBegan(roomId) == false){
					socket.gameMgr.stopTime(roomId);//把解散房间的定时器关掉
					socket.gameMgr.sendTime(userId,roomId);//发送解散房间剩余时间
				}
			}
			socket.emit('login_result',ret);

			//通知其它客户端
			userMgr.broacastInRoom('new_user_comes_push',userData,userId);
			
			socket.gameMgr = roomInfo.gameMgr;

			//玩家上线，强制设置为TRUE
			//socket.gameMgr.setReady(userId);
			socket.emit('login_finished');
			socket.gameMgr.userCome(userId);

			//移除断线定时器
			socket.gameMgr.disconnectOutTime(userId,false);
		});

		socket.on('backToHall', function(){
			var userId = socket.userId;
			if(userId == null){
				return;
			}
			userMgr.disconnectSocket(userId);
		});

		socket.on('ready',function(data){
			//data = JSON.parse(data);
			var userId = socket.userId;
			if(userId == null){
				return;
			}
			//如果是游戏开始状态，则不可以准备
			if(socket.gameMgr.getGameState(userId) === GameState.GAME_START){
				return;
			}
			socket.gameMgr.setReady(userId);
			
		});

		socket.on('special_card', function(){
			var userId = socket.userId;
			if(userId == null){
				return;
			}
			socket.gameMgr.setSpecialCard(userId);
		});
		
		socket.on('compare',function(data){
			data = JSON.parse(data);
			var userId = socket.userId;
			var uData = {};
			uData.userId = userId;
			uData.data = data;
			var game = socket.gameMgr.compare(uData);
		});
		
		//发送表情包
		socket.on('expression',function(data){
			var data = JSON.parse(data);
			if(socket.userId == null || socket.userId === data.receiveId){
				return;
			}
			//发送人，接收人，表情类型
			var sendId = socket.userId;
			var receiveId = data.receiveId;
			var type = data.type;
			userMgr.broacastInRoom('expression_push',{sendId:sendId,receiveId:receiveId,type:type},socket.userId,true);
		});

		//聊天
		socket.on('chat',function(data){
			if(socket.userId == null){
				return;
			}
			var chatContent = data;
			userMgr.broacastInRoom('chat_push',{sender:socket.userId,content:chatContent},socket.userId,true);
		});
		
		//快速聊天
		socket.on('quick_chat',function(data){
			if(socket.userId == null){
				return;
			}
			var chatId = data;
			userMgr.broacastInRoom('quick_chat_push',{sender:socket.userId,content:chatId},socket.userId,true);
		});
		
		//语音聊天
		socket.on('voice_msg',function(data){
			if(socket.userId == null){
				return;
			}
			console.log(data.length);
			userMgr.broacastInRoom('voice_msg_push',{sender:socket.userId,content:data},socket.userId,true);
		});
		
		//表情
		socket.on('emoji',function(data){
			if(socket.userId == null){
				return;
			}
			var phizId = data;
			userMgr.broacastInRoom('emoji_push',{sender:socket.userId,content:phizId},socket.userId,true);
		});
		
		//语音使用SDK不出现在这里
		
		//退出房间
		socket.on('exit',function(data){
			var userId = socket.userId;
			var roomId = roomMgr.getUserRoom(userId);
			socket.gameMgr.stopTime(roomId);//把解散房间的定时器关掉
			
			if(userId == null){
				return;
			}
			var roomId = roomMgr.getUserRoom(userId);
			if(roomId == null){
				return;
			}

			//如果游戏已经开始，则不可以
			if(socket.gameMgr.hasBegan(roomId)){
				return;
			}

			//如果是房主，则只能走解散房间
			if(roomMgr.isCreator(userId)){
				return;
			}
			
			//通知其它玩家，有人退出了房间
			userMgr.broacastInRoom('exit_notify_push',userId,userId,false);
			
			roomMgr.exitRoom(userId);
			userMgr.del(userId);
			
			socket.emit('exit_result');
			socket.disconnect();
		});
		
		//解散房间
		socket.on('dispress',function(data){
			var userId = socket.userId;
			var roomId = roomMgr.getUserRoom(userId);
			socket.gameMgr.stopTime(roomId);//把解散房间的定时器关掉
			
			if(userId == null){
				return;
			}

			
			if(roomId == null){
				return;
			}

			//如果游戏已经开始，则不可以
			// if(socket.gameMgr.hasBegan(roomId)){
			// 	return;
			// }

			//如果不是房主，则不能解散房间
			if(roomMgr.isCreator(roomId,userId) == false){
				return;
			}
			
			userMgr.broacastInRoom('dispress_push',{},userId,true);
			userMgr.kickAllInRoom(roomId);
			roomMgr.destroy(roomId);
			socket.disconnect();
		});

		//解散房间
		socket.on('dissolve_request',function(data){
			var userId = socket.userId;
			var roomId = roomMgr.getUserRoom(userId);
			socket.gameMgr.stopTime(roomId);//把解散房间的定时器关掉
			
			console.log(1);
			if(userId == null){
				console.log(2);
				return;
			}

			var roomId = roomMgr.getUserRoom(userId);
			if(roomId == null){
				console.log(3);
				return;
			}

			//如果游戏未开始，则不可以
            if (socket.gameMgr.hasBegan(roomId) == false) {
                console.log(4);
                return;
            }

			var ret = socket.gameMgr.dissolveRequest(roomId,userId);
			if(ret != null){
				var dr = ret.dr;
				var ramaingTime = (dr.endTime - Date.now()) / 1000;
				var data = {
					time:ramaingTime,
					states:dr.states
				}
				console.log(5);
				userMgr.broacastInRoom('dissolve_notice_push',data,userId,true,true);
			}
			console.log(6);
		});

		//退出房间
		socket.on('exit_game',function(data){
			var userId = socket.userId;
			if(userId == null){
				return;
			}

			var roomId = roomMgr.getUserRoom(userId);
			if(roomId == null){
				return;
			}
			
			socket.gameMgr.exitGame(userId);
		});

		socket.on('exit_disconnect',function(){
			userMgr.disconnect(socket);
		});
		
		socket.on('quick_swing_request',function(data){
			var userId = socket.userId;
			if(userId == null){
				return;
			}

			var roomId = roomMgr.getUserRoom(userId);
			if(roomId == null){
				return;
			}
			socket.gameMgr.quickSwingRequest(roomId,userId);
		});

		socket.on('dissolve_agree',function(data){
			var userId = socket.userId;

			if(userId == null){
				return;
			}

			var roomId = roomMgr.getUserRoom(userId);
			if(roomId == null){
				return;
			}

			var ret = socket.gameMgr.dissolveAgree(roomId,userId,true);
			if(ret != null){
				var dr = ret.dr;
				var ramaingTime = (dr.endTime - Date.now()) / 1000;
				var data = {
					time:ramaingTime,
					states:dr.states
				}
				userMgr.broacastInRoom('dissolve_notice_push',data,userId,true,true);

				// var doAllAgree = true;
				// for(var i = 0; i < dr.states.length; ++i){
				// 	if(dr.states[i] == false){
				// 		doAllAgree = false;
				// 		break;
				// 	}
				// }

				// if(doAllAgree){
				// 	socket.gameMgr.doDissolve(roomId);					
				// }
			}
		});

		socket.on('dissolve_reject',function(data){
			var userId = socket.userId;

			if(userId == null){
				return;
			}

			var roomId = roomMgr.getUserRoom(userId);
			if(roomId == null){
				return;
			}

			var ret = socket.gameMgr.dissolveAgree(roomId,userId,false);
			if(ret != null){
				userMgr.broacastInRoom('dissolve_cancel_push',{},userId,true,true);
			}
		});

		//断开链接
		socket.on('disconnect',function(data){
			var userId = socket.userId;
			if(!userId){
				return;
			}
			var data = {
				userid:userId,
				online:false
			};

			//离线60秒后，其它玩家可以继续玩
			socket.gameMgr.disconnectOutTime(userId,true);
			//通知房间内其它玩家
			userMgr.broacastInRoom('user_state_push',data,userId);

			//清除玩家的在线信息
			userMgr.del(userId);
			socket.userId = null;
		});
		
		socket.on('game_ping',function(data){
			var userId = socket.userId;
			if(!userId){
				return;
			}
			//console.log('game_ping');
			socket.emit('game_pong');
		});
	});

	console.log("game server is listening on " + config.CLIENT_PORT);	
};