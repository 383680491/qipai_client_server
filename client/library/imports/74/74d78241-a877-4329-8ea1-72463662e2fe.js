"use strict";
cc._RF.push(module, '74d78JBqHdDKY6hckY2YuL+', 'UserMgr');
// scripts/UserMgr.js

"use strict";

cc.Class({
    extends: cc.Component,
    properties: {
        account: null,
        userId: null,
        userName: null,
        lv: 0,
        exp: 0,
        coins: 0,
        gems: 0,
        sign: 0,
        ip: "",
        sex: 0,
        roomData: null,

        oldRoomId: null,
        bObserver: false
    },

    guestAuth: function guestAuth() {
        var account = cc.args["account"];
        if (account == null) {
            account = cc.sys.localStorage.getItem("account");
        }

        if (account == null) {
            account = Date.now();
            cc.sys.localStorage.setItem("account", account);
        }

        cc.vv.http.sendRequest("/guest", { account: account }, this.onAuth);
    },

    onAuth: function onAuth(ret) {
        var self = cc.vv.userMgr;
        if (ret.errcode !== 0) {
            console.log(ret.errmsg);
        } else {
            self.account = ret.account;
            self.sign = ret.sign;
            cc.vv.http.url = "http://" + cc.vv.SI.hall;
            self.login();
        }
    },

    login: function login() {
        var self = this;
        var onLogin = function onLogin(ret) {
            if (ret.errcode !== 0) {
                console.log(ret.errmsg);
            } else {
                if (!ret.userid) {
                    //jump to register user info.
                    cc.director.loadScene("createrole");
                } else {
                    console.log(ret);
                    self.account = ret.account;
                    self.userId = ret.userid;
                    self.userName = ret.name;
                    self.lv = ret.lv;
                    self.exp = ret.exp;
                    self.coins = ret.coins;
                    self.gems = ret.gems;
                    self.roomData = ret.roomid;
                    self.sex = ret.sex;
                    self.ip = ret.ip;
                    //打开统计
                    if (cc.vv.isAnalytics) {
                        cocosAnalytics.CAAccount.loginStart();
                        cocosAnalytics.CAAccount.loginSuccess(ret.userid);
                        cocosAnalytics.CAAccount.setGender(ret.sex);
                    }
                    cc.director.loadScene("hall");
                }
            }
        };
        cc.vv.wc.show("正在登录游戏");
        cc.vv.http.sendRequest("/login", { account: this.account, sign: this.sign }, onLogin);
    },

    create: function create(name) {
        var self = this;
        var onCreate = function onCreate(ret) {
            console.log('create: ' + ret.errcode);

            if (ret.errcode !== 0) {
                console.log(ret.errmsg);
            } else {
                self.login();
            }
        };

        var data = {
            account: this.account,
            sign: this.sign,
            name: name
        };
        cc.vv.http.sendRequest("/create_user", data, onCreate);
    },

    enterRoom: function enterRoom(roomId, callback) {
        var self = this;
        var serverType = this.getServerTypeByRid(roomId);
        var onEnter = function onEnter(ret) {
            if (ret.errcode !== 0) {
                if (ret.errcode == -1) {
                    setTimeout(function () {
                        self.enterRoom(roomId, callback);
                    }, 5000);
                } else {
                    cc.vv.wc.hide();
                    if (callback != null) {
                        callback(ret);
                    }
                }
            } else {
                cc.vv.wc.hide();
                if (callback != null) {
                    callback(ret);
                }
                if (serverType == 'SSS_SERVER_TYPE') {
                    cc.vv.sssNetMgr.connectGameServer(ret);
                } else if (serverType == 'SSP_SERVER_TYPE') {
                    cc.vv.sspNetMgr.connectGameServer(ret);
                }
            }
        };
        var isObserver = cc.vv.userMgr.bObserver;
        var data = {
            account: cc.vv.userMgr.account,
            sign: cc.vv.userMgr.sign,
            serverType: serverType,
            roomid: roomId,
            isObserver: isObserver
        };
        cc.vv.wc.show("正在进入房间 " + roomId);
        cc.vv.http.sendRequest("/enter_private_room", data, onEnter);
    },
    getHistoryList: function getHistoryList(callback) {
        var self = this;
        var onGet = function onGet(ret) {
            if (ret.errcode !== 0) {
                console.log(ret.errmsg);
            } else {
                console.log(ret.history);
                if (callback != null) {
                    callback(ret.history);
                }
            }
        };

        var data = {
            account: cc.vv.userMgr.account,
            sign: cc.vv.userMgr.sign
        };
        cc.vv.http.sendRequest("/get_history_list", data, onGet);
    },
    getSSPGamesOfRoom: function getSSPGamesOfRoom(uuid, callback) {
        var self = this;
        var onGet = function onGet(ret) {
            if (ret.errcode !== 0) {
                console.log(ret.errmsg);
            } else {
                console.log(ret.data);
                callback(ret.data);
            }
        };

        var data = {
            account: cc.vv.userMgr.account,
            sign: cc.vv.userMgr.sign,
            uuid: uuid
        };
        cc.vv.http.sendRequest("/get_SSPgames_of_room", data, onGet);
    },
    getSSPDetailOfGame: function getSSPDetailOfGame(uuid, index, callback) {
        //四色牌
        var self = this;
        var onGet = function onGet(ret) {
            if (ret.errcode !== 0) {
                console.log(ret.errmsg);
            } else {
                console.log(ret.data);
                callback(ret.data);
            }
        };

        var data = {
            account: cc.vv.userMgr.account,
            sign: cc.vv.userMgr.sign,
            uuid: uuid,
            index: index
        };
        cc.vv.http.sendRequest("/get_detail_of_SSPgame", data, onGet);
    },
    getServerTypeByRid: function getServerTypeByRid(rid) {
        if (rid >= 200000 && rid < 300000) {
            return "SSS_SERVER_TYPE";
        } else if (rid >= 300000 && rid < 400000) {
            return "SSP_SERVER_TYPE";
        } else {
            return "";
        }
    }
});

cc._RF.pop();