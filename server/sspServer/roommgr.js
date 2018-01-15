var sspRoomDB = require('../DB/managers/sspRoomDBMgr');
var userDB = require('../DB/managers/userDBMgr');

var rooms = {};
var creatingRooms = {};
var userLocation = {};
var totalRooms = 0;

var DI_FEN = [1];
var JU_SHU = [10];
var JU_SHU_COST = [4];
var KOU_FEI = [0,1];
var WAN_FA = [0,1,2];

function generateRoomId(){
	var roomId = "3";
	for(var i = 0; i < 5; ++i){
		roomId += Math.floor(Math.random()*10);
	}
	return roomId;
}

function constructRoomFromDb(dbdata){
	var roomInfo = {
		uuid:dbdata.uuid,
		id:dbdata.id,
		numOfGames:dbdata.num_of_turns,
		createTime:dbdata.create_time,
		nextButton: dbdata.next_button,
		seats:new Array(4),
		successive: [],
		conf:JSON.parse(dbdata.base_info)
	};
	roomInfo.gameMgr = require('./GameMgr/GameMgr').getInstance();
	var roomId = roomInfo.id;

	for(var i = 0; i < 4; ++i){
		var s = roomInfo.seats[i] = {};
		s.userId = dbdata["user_id" + i];
		s.score = dbdata["user_score" + i];
		s.name = dbdata["user_name" + i];
		s.ready = false;
		s.seatIndex = i;

		if(s.userId > 0){
			userLocation[s.userId] = {
				roomId:roomId,
				seatIndex:i
			};
		}
	}
	rooms[roomId] = roomInfo;
	totalRooms++;
	return roomInfo;
}

exports.createRoom = function(creator,roomConf,gems,ip,port,callback){
	if(roomConf.difen == null){
		callback(1,null);
		return;
	}

	if(roomConf.difen < 0 || roomConf.difen > DI_FEN.length){
		callback(1,null);
		return;
	}

	if(roomConf.jushuxuanze < 0 || roomConf.jushuxuanze > JU_SHU.length){
		callback(1,null);
		return;
	}

	if(roomConf.koufeixuanze < 0 || roomConf.koufeixuanze > KOU_FEI.length){
		callback(1,null);
		return;
	}

	if(roomConf.wanfa < 0 || roomConf.wanfa > 2){
		callback(1,null);
		return;
	}
	
	//如果是房主自费的话，则需要判断钻石是否足够
	if(roomConf.koufeixuanze == 0){
		var cost = JU_SHU_COST[roomConf.jushuxuanze];
		if(cost > gems){
			callback(2222,null);
			return;
		} 
	}
	

	var fnCreate = function(){
		var roomId = generateRoomId();
		if(rooms[roomId] != null || creatingRooms[roomId] != null){
			fnCreate();
		}
		else{
			creatingRooms[roomId] = true;
			sspRoomDB.is_room_exist(roomId, function(ret) {

				if(ret){
					delete creatingRooms[roomId];
					fnCreate();
				}
				else{
					var createTime = Math.ceil(Date.now()/1000);
					var roomInfo = {
						uuid: "",
                        id: roomId,
                        numOfGames: 0,
                        createTime: createTime,
                        nextButton: 0,
                        seats: [],
                        isStratGame:false,
                        successive: [],
						conf:{
							baseScore:DI_FEN[roomConf.difen],
						    maxGames:JU_SHU[roomConf.jushuxuanze],
						    creator:creator,
							wanfa:roomConf.wanfa,
							koufeixuanze:roomConf.koufeixuanze
						}
					};
					if(1 === roomConf.wanfa){
						roomInfo.conf.ZJUserId = creator;
					}
					roomInfo.gameMgr = require('./GameMgr/GameMgr').getInstance();
					console.log(roomInfo.conf);
					
					for(var i = 0; i < 4; ++i){
						roomInfo.seats.push({
							userId:0,
							score:0,
							name:"",
							ready:false,
							seatIndex:i,
							win:0,
                            lose:0,
                            draw:0,
						});
					}
					
					//写入数据库
					var conf = roomInfo.conf;
					sspRoomDB.create_room(roomInfo.id,roomInfo.conf,ip,port,createTime,function(uuid){
						delete creatingRooms[roomId];
						if(uuid != null){
							roomInfo.uuid = uuid;
                            rooms[roomId] = roomInfo;
                            totalRooms++;
                            var now = Math.ceil(Date.now() / 1000);
                            var daojishi = 1800 - (now - roomInfo.createTime); 
                            callback(0, roomId, daojishi);
                            //发送解散房间倒计时
                            roomInfo.gameMgr.sendTime(roomId);
						}
						else{
							callback(3,null);
						}
					});
				}
			});
		}
	}

	fnCreate();
};

exports.destroy = function(roomId){
	var roomInfo = rooms[roomId];
	if(roomInfo == null){
		return;
	}

	for(var i = 0; i < 4; ++i){
		var userId = roomInfo.seats[i].userId;
		if(userId > 0){
			delete userLocation[userId];
			userDB.set_room_id_of_user(userId,null);
		}
	}
	
	delete rooms[roomId];
	totalRooms--;
	sspRoomDB.delete_room(roomId);
}

//获取当前玩家个数
exports.getUserCount = function(roomId){
	var roomInfo = rooms[roomId];
	if(!roomInfo){
		return 0;
	}
	var len = roomInfo.seats.length;
	var count = 0;
	for(var i = 0; i < len; ++i){
		var seat = roomInfo.seats[i];
		if(seat.userId !== 0){
			count++;
		}
	}
	return count;
}

//判断是否能开始游戏
exports.canStart = function(roomId){
    var roomInfo = rooms[roomId];
    if(!roomInfo){
        return false;
    }
    var count = 0;
    for(var i = 0; i < 4; ++i){
        var seat = roomInfo.seats[i];
        if(seat.userId !== 0){
            if (seat.ready) {
                count++;
            } 
            else {
                return false;
            }
        } 
    }
    return (count > 3);
}

exports.getTotalRooms = function(){
	return totalRooms;
}

exports.getRoom = function(roomId){
	return rooms[roomId];
};

exports.isCreator = function(roomId,userId){
	var roomInfo = rooms[roomId];
	if(roomInfo == null){
		return false;
	}
	return roomInfo.conf.creator == userId;
};

exports.getApplyUserId = function(userId){
    var roomId = exports.getUserRoom(userId);
    var roomInfo = exports.getRoom(roomId);
    if(roomInfo == null){
        return 0;
    }
    return roomInfo.applyUserId;
};

exports.enterRoom = function(params,callback){
	var roomId = params.roomId;
	var userId = params.userId;
	var userName = params.name;
	var fnTakeSeat = function(room){
		if(exports.getUserRoom(userId) == roomId){
			//已存在
			return 0;
		}
		
		for(var i = 0; i < 4; ++i){
			var seat = room.seats[i];
			if(seat.userId <= 0){
				seat.userId = userId;
				seat.name = userName;
				seat.disconnectOutTime = false;
				userLocation[userId] = {
					roomId:roomId,
					seatIndex:i
				};
				sspRoomDB.update_seat_info(roomId,i,seat.userId,"",seat.name);
				//正常
				return 0;
			}
		}

		//房间已满
		return 1;	
	}
	var room = rooms[roomId];
	if(room){
		var ret = fnTakeSeat(room);
		callback(ret);
	}
	else{
		sspRoomDB.get_room_data(roomId,function(dbdata){
			if(dbdata == null){
				//找不到房间
				callback(2);
			}
			else{
				room = constructRoomFromDb(dbdata);
				var ret = fnTakeSeat(room);
				callback(ret);
			}
		});
	}
};

exports.setReady = function(userId,value){
	var roomId = exports.getUserRoom(userId);
	if(roomId == null){
		return;
	}

	var room = exports.getRoom(roomId);
	if(room == null){
		return;
	}

	var seatIndex = exports.getUserSeat(userId);
	if(seatIndex == null){
		return;
	}

	var s = room.seats[seatIndex];
	s.ready = value;
};

exports.isReady = function(userId){
	var roomId = exports.getUserRoom(userId);
	if(roomId == null){
		return;
	}

	var room = exports.getRoom(roomId);
	if(room == null){
		return;
	}

	var seatIndex = exports.getUserSeat(userId);
	if(seatIndex == null){
		return;
	}

	var s = room.seats[seatIndex];
	return s.ready;	
};

exports.clearReady = function(roomId){
	var room = exports.getRoom(roomId);
	if(room == null){
		return;
	}

	var seats = room.seats;
	for(let i = 0; i < seats.length; i++){
		if(seats[i].userId === 0){
			continue;
		}

		seats[i].ready = false;
	}
};

exports.getUserRoom = function(userId){
	var location = userLocation[userId];
	if(location != null){
		return location.roomId;
	}
	return null;
};

exports.getUserSeat = function(userId){
	var location = userLocation[userId];
	if(location != null){
		return location.seatIndex;
	}
	return null;
};

exports.getUserLocations = function(){
	return userLocation;
};

exports.exitRoom = function(userId){
	var location = userLocation[userId];
	if(location == null)
		return;

	var roomId = location.roomId;
	var seatIndex = location.seatIndex;
	var room = rooms[roomId];
	delete userLocation[userId];
	if(room == null || seatIndex == null) {
		return;
	}

	var seat = room.seats[seatIndex];
	seat.userId = 0;
	seat.name = "";

	var numOfPlayers = 0;
	for(var i = 0; i < room.seats.length; ++i){
		if(room.seats[i].userId > 0){
			numOfPlayers++;
		}
	}
	
	sspRoomDB.set_room_id_of_user(userId,null);

	if(numOfPlayers == 0){
		exports.destroy(roomId);
	}
};