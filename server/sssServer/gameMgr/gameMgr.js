var include = require('../include');
var BaseClass = include.getModel('BaseClass');
var GAME_TYPE = include.getModel('DEFINE').GAME_TYPE;
var roomMgr = include.getModel('roomMgr');
var userMgr = include.getModel('userMgr');

var GameMgr = BaseClass.extend({
	Init:function(){
		this.JS_Name = "GameMgr";
		this._games = {};
		this._dissolvingList = [];
		this.dissolutionTime = [];

		var self = this;
		setInterval(function(){
			self.update();
		},1000);
	},
	userCome:function(userId){
		var roomId = roomMgr.getUserRoom(userId);
		var game = this._games[roomId];
		if(!game){
			return;
			//game.playerComeBack(userId);
		}
		game.playerComeBack(userId);
	},
	isDissolve:function(userId){
		var roomId = roomMgr.getUserRoom(userId);
	    if(roomId == null){
	        return;
	    }
	    var roomInfo = roomMgr.getRoom(roomId);
	    if(roomInfo == null){
	        return;
	    }
		if(roomInfo.endTime != null){
			var dr = roomInfo.dr;
			var ramaingTime = (roomInfo.endTime - Date.now()) / 1000;
			var data = {
				time:ramaingTime,
				states:dr.states
			}
			userMgr.sendMsg(userId,'dissolve_notice_push',data);
		}
	},

	doDissolve:function(roomId){
		var roomInfo = roomMgr.getRoom(roomId);
		if(roomInfo == null){
			return null;
		}

		var game = this._games[roomId];
		//如果房间存在则doGameOver
		if(game){
			game.doGameOver();
			//game.allExitRoom(roomId);
		}
		
	},

	exitGame:function(userId){
		var roomId = roomMgr.getUserRoom(userId);
		var roomInfo = roomMgr.getRoom(roomId);
		if(roomInfo == null){
			return null;
		}

		var game = this._games[roomId];
		game.exitRoom(userId);
	},

	hasBegan:function(roomId){
		var game = this._games[roomId];
		if(game != null){
			return true;
		}
		var roomInfo = roomMgr.getRoom(roomId);
		if(roomInfo != null){
			return roomInfo.numOfGames > 0;
		}
		return false;
	},

	quickSwingRequest:function(roomId,userId){
		if(roomId == null){
	        return;
	    }
		var game = this._games[roomId];
		game.quickSwing(userId);
	},

	setReady:function(userId){
		var roomId = roomMgr.getUserRoom(userId);
	    if(roomId == null){
	        return;
	    }
	    var roomInfo = roomMgr.getRoom(roomId);
	    if(roomInfo == null){
	        return;
	    }
	    roomMgr.setReady(userId,true);
	    userMgr.broacastInRoom('user_ready_push',{userid:userId,ready:true},userId,true);
	    var game = this._games[roomId];
	    if(!game){
			if(roomMgr.canStart(roomId)&&this.isRoomAllOnline(roomId)){
				this.startGame(roomId);
			}
	    }
		else{
			if(roomMgr.canStart(roomId)&&this.isRoomAllOnline(roomId)){
				game.startAgain();
			}
		}
	},

	//发送解散房间剩余时间
	sendTime:function(userId,roomId){
		
		var data = {};
		data.roomId = roomId;
		data.disTime =600000;//600秒解散房间时间

		data.dispressRoomTimeId = setInterval(function(self){
			for(var i = 0;i < self.dissolutionTime.length;i++){
				if(!self.dissolutionTime[i]){
					continue;
				}
				if(self.dissolutionTime[i].roomId === roomId){
					self.dissolutionTime[i].disTime -= 1000;
					userMgr.broacastInRoom('out_dissolutionTime',self.dissolutionTime[i].disTime,userId,true,false);
				}
			}
		},1000,this);

		this.dissolutionTime.push(data);
	},

	//把解散房间的定时器关掉
	stopTime:function(roomId){
		for(var i = 0;i < this.dissolutionTime.length;i++){
			if(!this.dissolutionTime[i]){
				continue;
			}
			if(this.dissolutionTime[i].roomId === roomId){
				clearInterval(this.dissolutionTime[i].dispressRoomTimeId);
				this.dissolutionTime[i] = null;
			}
		}
	},

	//掉线60秒后，其它玩家可以开始游戏
	disconnectOutTime:function(userId,isOpen){
		var roomId = roomMgr.getUserRoom(userId);
	    if(roomId == null){
	        return;
	    }
	    var roomInfo = roomMgr.getRoom(roomId);
	    if(roomInfo == null){
	        return;
	    }
		var seats = roomInfo.seats;
		for(let i = 0;i<seats.length;i++){
			if(userId === seats[i].userId){
				if(isOpen){
					//倒计时出牌
					this.lixianTime = 99000;//99秒离线时间
					this.disconnectOutTimeId = setTimeout(function(self){
						seats[i].disconnectOutTime = true;
						self.isRoomAllOnline(roomId);

						var game = self._games[roomId];
						if(!game){
							if(roomMgr.canStart(roomId)&&self.isRoomAllOnline(roomId)){
								self.startGame(roomId);
							}
						}
						else{
							if(roomMgr.canStart(roomId)&&self.isRoomAllOnline(roomId)){
								game.startAgain();
							}
						}

					},99000,this);

					var data = {};
					data.Time = this.lixianTime;
					data.userId = seats[i].userId;
					userMgr.broacastInRoom('out_lixianTime',data,data.userId,true,false);
				}
				else{
					seats[i].disconnectOutTime = false;
					clearTimeout(this.disconnectOutTimeId);
				}
			}
		}
	},

	isRoomAllOnline:function(roomId){
	    var roomInfo = roomMgr.getRoom(roomId);
	    if(roomInfo == null){
	        return false;
	    }
		var seats = roomInfo.seats;
		for(let i = 0; i < seats.length; ++i){
			let userId = seats[i].userId;
			if(userId <= 0){
				continue;
			}
			let isOnline = userMgr.isOnline(userId);
			let isOutTime = seats[i].disconnectOutTime;
			if(!isOnline && !isOutTime){
				return false;
			}
		}
		return true;
	},
	setSpecialCard:function(userId){
		var roomId = roomMgr.getUserRoom(userId);
	    if(roomId == null){
	        return;
	    }
	    var roomInfo = roomMgr.getRoom(roomId);
	    if(roomInfo == null){
	        return;
	    }
		var game = this._games[roomId];
	    if(game){
			game.setSpecialCard(userId);
	    }
	},
	startGame:function(roomid){
		this.stopTime(roomid);//把解散房间的定时器关掉
		var roomInfo = roomMgr.getRoom(roomid);
	    if(roomInfo == null){
	        return;
	    }
		var wanfa = roomInfo.conf.wanfa;
		var GameClass = null;
		GameClass = include.getModel('GameNormal');
		//game.initInfo(roomInfo);
		roomInfo.isStratGame = true;
		this._games[roomid] = new GameClass(roomInfo);
		roomInfo.numOfGames++;
	},

	getGameState:function(userId){
		var roomid = roomMgr.getUserRoom(userId);
		var roomInfo = roomMgr.getRoom(roomid);
		 if(roomInfo == null){
	        return;
	    }
		return roomInfo.state;
	},

	setGameState:function(roomid,state){
		var roomInfo = roomMgr.getRoom(roomid);
		 if(roomInfo == null){
	        return;
	    }
		roomInfo.state = state;
	},

	isBegan:function(roomId){
		var game = _games[roomId];
		if(game != null){
			return true;
		}
		var roomInfo = roomMgr.getRoom(roomId);
		if(roomInfo != null){
			return roomInfo.numOfGames > 0;
		}
		return false;
	},
	getGame:function(roomid){
		return (this._games[roomid]? this._games[roomid]:null);
	},
	compare:function(data){
		var userId = data.userId;
		var roomId = roomMgr.getUserRoom(userId);
	    if(roomId == null){
	        return;
	    }
	    var roomInfo = roomMgr.getRoom(roomId);
	    if(roomInfo == null){
	        return;
	    }
	    var game = this._games[roomId];
	    if(game == null){
	    	return;
	    }
	    game.setCompareData(data);
	},
	
	//申请解散房间
	dissolveRequest:function(roomId,userId){
		var roomInfo = roomMgr.getRoom(roomId);
		if(roomInfo == null){
			return null;
		}

		if(roomInfo.dr != null){
			return roomInfo;
		}

		var seatIndex = roomMgr.getUserSeat(userId);
		if(seatIndex == null){
			return null;
		}

		roomInfo.dr = {
			endTime:Date.now() + 10000,
			states:[false,false,false,false,false,false]
		};
		roomInfo.dr.states[seatIndex] = true;

		for(var k = 0;k < roomInfo.seats.length;k++){
			if(roomInfo.seats[k].disconnectOutTime && 
				roomInfo.seats[k].disconnectOutTime === true){
				roomInfo.dr.states[k] = true;
			}
		}

		this._dissolvingList.push(roomId);

		return roomInfo;
	},

	//解散房间是否同意
	dissolveAgree:function(roomId,userId,agree){
		var roomInfo = roomMgr.getRoom(roomId);
		if(roomInfo == null){
			return null;
		}

		if(roomInfo.dr == null){
			return null;
		}

		var seatIndex = roomMgr.getUserSeat(userId);
		if(seatIndex == null){
			return null;
		}
		var idx = this._dissolvingList.indexOf(roomId);
		if(agree){
			roomInfo.dr.states[seatIndex] = true;
			var playerCount = 0;
			var agreeCount = 0;
			
			
			for(let i = 0;i<roomInfo.seats.length;i++){
				if(roomInfo.seats[i].userId > 0){
					playerCount++;
				}
			}
			for(let i = 0;i<roomInfo.dr.states.length;i++){
				if(roomInfo.dr.states[i] === true){
					agreeCount++;
				}
			}
			if(playerCount === 2 && agreeCount >= 2){
				this.doDissolve(roomId);
				this._dissolvingList.splice(idx,1); 
			}
			else if(playerCount > 2 && agreeCount >= playerCount/2){
				this.doDissolve(roomId);
				this._dissolvingList.splice(idx,1); 
			}
		}
		else{
			roomInfo.dr = null;
			if(idx != -1){
				this._dissolvingList.splice(idx,1);           
			}
			userMgr.broacastInRoom('stopEndTime','0',userId,true,true);
		}
		return roomInfo;
	},

	update:function () {
		if(this._dissolvingList){
			for(var i = this._dissolvingList.length - 1; i >= 0; --i){
				var roomId = this._dissolvingList[i];
				
				var roomInfo = roomMgr.getRoom(roomId);
				if(roomInfo != null && roomInfo.dr != null){
					if(Date.now() > roomInfo.dr.endTime){

						console.log("delete room and games");
						this.doDissolve(roomId);
						this._dissolvingList.splice(i,1); 
					}
				}
				else{
					this._dissolvingList.splice(i,1);
				}
			}
		}
	},

	
});

var gameMgrObj = null;

module.exports.getInstance = function(){
	if (!gameMgrObj) {
		gameMgrObj = new GameMgr();
	}
	return gameMgrObj;
}
