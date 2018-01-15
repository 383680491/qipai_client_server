var include = {};

var info = {
    roomMgr:'./roommgr',
    userMgr:'./usermgr',
    BaseClass:'../lib/BaseClass',
    Game:'./gameMgr/game/game',
    GameNormal:'./gameMgr/game/game_normal',
    GameBwz:'./gameMgr/game/game_bwz',
    Player:'./gameMgr/game/Player',
    DEFINE:'./Define',
};
include.getModel = function(name){
    console.log(info[name]);
    return require(info[name]);
}

module.exports = include;