var include = {};

var info = {
    roomMgr:'./roommgr',
    userMgr:'./usermgr',
    BaseClass:'../lib/BaseClass',
    Game:'./gameMgr/game/game',
    Seat:'./gameMgr/game/Seat',
    DEFINE:'./Define',
};
include.getModel = function(name){
    console.log(info[name]);
    return require(info[name]);
}

module.exports = include;