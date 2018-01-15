var roomMgr = require('./roommgr');
var userList = {};
var userOnline = 0;
var userDB = require('../DB/managers/userDBMgr');

exports.bind = function(userId,socket){
    userList[userId] = socket;
    userOnline++;
};

exports.del = function(userId,socket){
    delete userList[userId];
    userOnline--;
};

exports.get = function(userId){
    return userList[userId];
};

exports.isOnline = function(userId){
    var data = userList[userId];
    if(data != null){
        return true;
    }
    return false;
};

exports.getOnlineCount = function(){
    return userOnline;
}

exports.sendMsg = function(userId,event,msgdata){
    console.log(event);
    var userInfo = userList[userId];
    if(userInfo == null){
        return;
    }
    var socket = userInfo;
    if(socket == null){
        return;
    }

    socket.emit(event,msgdata);
};

exports.disconnectSocket = function(userId){
    var socket = userList[userId];
    if (socket) {
        socket.disconnect();
        delete userList[userId];
        userOnline--;
    }
};

exports.kickAllInRoom = function(roomId){
    if(roomId == null){
        return;
    }
    var roomInfo = roomMgr.getRoom(roomId);
    if(roomInfo == null){
        return;
    }
    console.log('kickallinroom');
    for(var i = 0; i < roomInfo.seats.length; ++i){
        var rs = roomInfo.seats[i];

        //如果不需要发给发送方，则跳过
        if(rs.userId > 0){
            var socket = userList[rs.userId];
            if(socket != null){
                exports.del(rs.userId);
                socket.disconnect();
            }
        }
    }
};

exports.kickUserInRoom = function(userId){
    var roomId = roomMgr.getUserRoom(userId);
    if(roomId == null){
        return;
    }
    var roomInfo = roomMgr.getRoom(roomId);
    if(roomInfo == null){
        return;
    }

    for(let i = 0; i < roomInfo.seats.length; i++){
        if(userId === roomInfo.seats[i].userId){
            var rs = roomInfo.seats[i];
            if(rs.userId > 0){
                var socket = userList[rs.userId];
                if(socket != null){
                    exports.del(rs.userId);
                    socket.disconnect();
                    var userLocation = roomMgr.getUserLocations();
                    delete userLocation[userId];
			        userDB.set_room_id_of_user(userId,null);
                    rs.userId = 0;
                }
            }
        } 
    } 
};

exports.broacastInRoom = function(event,data,sender,includingSender){
    var roomId = roomMgr.getUserRoom(sender);
    if(roomId == null){
        return;
    }
    var roomInfo = roomMgr.getRoom(roomId);
    if(roomInfo == null){
        return;
    }

    for(var i = 0; i < roomInfo.seats.length; ++i){
        var rs = roomInfo.seats[i];

        //如果不需要发给发送方，则跳过
        if(rs.userId == sender && includingSender != true){
            continue;
        }
        var socket = userList[rs.userId];
        if(socket != null){
            socket.emit(event,data);
        }
    }
};