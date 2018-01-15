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
			socket.emit('login_result',ret);

			//通知其它客户端
			userMgr.broacastInRoom('new_user_comes_push',userData,userId);

			socket.gameMgr = roomInfo.gameMgr;

			//玩家上线，强制设置为TRUE
			socket.emit('login_finished');
			var isGameBegin = socket.gameMgr.isGameBegin(userId);
            if (isGameBegin) {
                socket.gameMgr.userCome(userId);
            }

		});
		socket.on('backToHall', function(){
			var userId = socket.userId;
			if(userId == null){
				return;
			}
			userMgr.disconnectSocket(userId);
		});
		//出牌
        socket.on('chupai', function (data) {
            if (socket.userId == null) {
                return;
			}
            data = JSON.parse(data);
            socket.gameMgr.chupai(socket.userId, data);
        });

        //吃
        socket.on('chi', function (data) {
            if (socket.userId == null) {
                return;
            }
            data = JSON.parse(data);
            socket.gameMgr.chi(socket.userId, data);
        });

        //碰
        socket.on('peng', function (data) {
            if (socket.userId == null) {
                return;
            }
            data = JSON.parse(data);
            socket.gameMgr.peng(socket.userId, data);
        });

        //杠
        socket.on('gang', function (data) {
            if (socket.userId == null) {
                return;
            }
            data = JSON.parse(data);
            socket.gameMgr.gang(socket.userId, data);
        });

        //过  遇上胡，碰，杠的时候，可以选择过
        socket.on('guo', function (data) {
            if (socket.userId == null) {
                return;
			}
			data = JSON.parse(data);
            socket.gameMgr.guo(socket.userId, data);
        });

        //确认吃牌
        socket.on('confirmChi', function(data){
        	if (socket.userId == null) {
                return;
            }
            data = JSON.parse(data);
            socket.gameMgr.confirmChi(socket.userId, data);
        });

        //胡牌
        socket.on('hu', function(data){
        	if (socket.userId == null) {
                return;
            }
            data = JSON.parse(data);
            socket.gameMgr.hu(socket.userId, data);
        });

		socket.on('ready',function(data){
			var userId = socket.userId;
			if(userId == null){
				return;
			}
			socket.gameMgr.setReady(userId);
			userMgr.broacastInRoom('user_ready_push',{userid:userId,ready:true},userId,true);
		});

		socket.on('closeTuoGuan',function(data){
			var userId = socket.userId;
			if(userId == null){
				return;
			}
			socket.gameMgr.closeTuoGuan(userId);
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
		
		//解散房间
		socket.on('dispress',function(data){
			var userId = socket.userId;
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

			//如果不是房主，则不能解散房间
			if(roomMgr.isCreator(roomId,userId) == false){
				return;
			}
			socket.gameMgr.stopTime(roomId);
			userMgr.broacastInRoom('dispress_push',{},userId,true);
			userMgr.kickAllInRoom(roomId);
			roomMgr.destroy(roomId);
			socket.disconnect();
		});

		//解散房间
		socket.on('dissolve_request',function(data){
			var userId = socket.userId;
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
				userMgr.broacastInRoom('dissolve_notice_push',data,userId,true);
			}
			console.log(6);
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
				userMgr.broacastInRoom('dissolve_notice_push',data,userId,true);
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
				userMgr.broacastInRoom('dissolve_cancel_push',{},userId,true);
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
			socket.emit('game_pong');
		});
	});

	console.log("game server is listening on " + config.CLIENT_PORT);	
};