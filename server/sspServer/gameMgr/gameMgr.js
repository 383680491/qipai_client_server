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
		setInterval(this.update,1000,this);
	},
	userCome:function(userId){
		var roomId = roomMgr.getUserRoom(userId);
		var roomInfo = roomMgr.getRoom(roomId);
		var game = this._games[roomId];
		if(!game){
			return;
		}
		if(!roomInfo.isStratGame){
			return;
		}
		game.playerComeBack(userId);
	},

	chupai:function(userId, pai){
		let roomId = roomMgr.getUserRoom(userId);
		var game = this._games[roomId];
		if(game){
			game.chupai(userId, pai);
		}	
	},

	isGameBegin:function(userId) {
		var roomId = roomMgr.getUserRoom(userId);
		var roomInfo = roomMgr.getRoom(roomId);
		if(roomInfo == null){
	        return;
	    }
		var game = this._games[roomId];
		if (game) {
			var bGameBegin = game.getGameState();
			return bGameBegin;
		}
		return false;
	},

	chi:function(userId, pai){
		let roomId = roomMgr.getUserRoom(userId);
		var game = this._games[roomId];
		if(game){
			game.chi(userId, pai);
		}
	},

	peng:function(userId, pai){
		let roomId = roomMgr.getUserRoom(userId);
		var game = this._games[roomId];
		if(game){
			game.peng(userId, pai);
		}	
	},

	gang:function(userId, pai){
		let roomId = roomMgr.getUserRoom(userId);
		var game = this._games[roomId];
		if(game){
			game.gang(userId, pai);
		}
	},

	guo:function(userId, pai){
		let roomId = roomMgr.getUserRoom(userId);
		var game = this._games[roomId];
		if(game){
			game.guo(userId, pai);
		}
	},

	deleteGame:function(roomId){
		delete this._games[roomId];
	},

	confirmChi:function(userId, data){
		let roomId = roomMgr.getUserRoom(userId);
		var game = this._games[roomId];
		if(game){
			game.confirmChi(userId, data);
		}
	},

	hu:function(userId, pai){
		let roomId = roomMgr.getUserRoom(userId);
		var game = this._games[roomId];
		if(game){
			game.hu(userId, pai);
		}
	},

	closeTuoGuan:function(userId){
		let roomId = roomMgr.getUserRoom(userId);
		var game = this._games[roomId];
		if(game){
			game.closeTuoGuan(userId);
		}
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
		if(game){
			game.draw(true);
		}
	},

	hasBegan:function(roomId){
		var roomInfo = roomMgr.getRoom(roomId);
		if(roomInfo.isStratGame){
			return;
		}
		if(roomInfo != null){
			return roomInfo.numOfGames > 0;
		}
		return false;
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

	    if(roomMgr.canStart(roomId)&&this.isRoomAllOnline(roomId)){
	    	this.stopTime(roomId);
			this.startGame(roomId);
			roomMgr.clearReady(roomId);
		}
	},

	//发送解散房间剩余时间
	sendTime:function(roomId){
		var roomInfo = roomMgr.getRoom(roomId);
	    if(roomInfo == null){
	        return null;
	    }

	    var game = this._games[roomId];
		if(game){
			game.sendTime();
		}
		else{
			var GameClass = include.getModel('Game');
			var game = new GameClass(roomInfo);
			this._games[roomId] = game;
			game.sendTime();
		}
	},

	//把解散房间的定时器关掉
	stopTime:function(roomId){
		var roomInfo = roomMgr.getRoom(roomId);
	    if(roomInfo == null){
	        return null;
	    }

	    var game = this._games[roomId];
		if(game){
			game.stopTime();
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
			if(!isOnline){
				return false;
			}
		}
		return true;
	},

	startGame:function(roomid){
		var roomInfo = roomMgr.getRoom(roomid);
	    if(roomInfo == null){
	        return;
	    }
	    roomInfo.isStratGame = true;
	    if(this._games[roomid]){
			delete this._games[roomid];
		}
		var GameClass = include.getModel('Game');
		var game = new GameClass(roomInfo);
		this._games[roomid] = game;
		game.begin();
	},

	getGameState:function(userId){
		var roomid = roomMgr.getUserRoom(userId);
		var roomInfo = roomMgr.getRoom(roomid);
		 if(roomInfo == null){
	        return;
	    }
		return roomInfo.state;
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
			endTime:Date.now() + 30000,
			states:[false,false,false,false]
		};
		roomInfo.dr.states[seatIndex] = true;

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
		}
		return roomInfo;
	},

	update:function (self) {
		if(self._dissolvingList){
			for(var i = self._dissolvingList.length - 1; i >= 0; --i){
				var roomId = self._dissolvingList[i];
				
				var roomInfo = roomMgr.getRoom(roomId);
				if(roomInfo != null && roomInfo.dr != null){
					if(Date.now() > roomInfo.dr.endTime){

						console.log("delete room and games");
						self.doDissolve(roomId);
						self._dissolvingList.splice(i,1); 
					}
				}
				else{
					self._dissolvingList.splice(i,1);
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
