(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/scripts/sssNetMgr.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, 'e2d8bPzi3BMT6IfwQJJ4K5p', 'sssNetMgr', __filename);
// scripts/sssNetMgr.js

"use strict";

cc.Class({
    extends: cc.Component,

    properties: {
        emitter: null,
        dataEventHandler: null,
        roomId: null,
        maxNumOfGames: 0,
        numOfGames: 0,
        numOfMJ: 0,
        seatIndex: -1,
        seats: null,
        turn: -1,
        button: -1,
        chupai: -1,
        gamestate: "",
        isOver: false,
        dissoveData: null,
        maPaiData: null,
        specialType: 0,
        wanfa: 0,
        isBiPai: false,
        chupaidata: null
        // foo: {
        //    default: null,
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
    },

    singleReset: function singleReset() {
        for (var i = 0; i < this.seats.length; ++i) {
            this.seats[i].holds = [];
            this.seats[i].ready = false;
            this.seats[i].score = 0;
        }
    },

    reset: function reset() {
        this.turn = -1;
        this.chupai = -1, this.button = -1;
        this.gamestate = "";
        this.curaction = null;
        for (var i = 0; i < this.seats.length; ++i) {
            this.seats[i].holds = [];
            this.seats[i].folds = [];
            this.seats[i].ready = false;
            this.seats[i].hued = false;
            this.seats[i].huanpais = null;
            this.seats[i].score = 0;
        }
        this.maPaiData = null;
    },

    clear: function clear() {
        this.dataEventHandler = null;
        this.maPaiData = null;
        if (this.isOver == null) {
            this.seats = null;
            this.roomId = null;
            this.maxNumOfGames = 0;
            this.numOfGames = 0;
        }
    },

    dispatchEvent: function dispatchEvent(event, data) {
        if (this.dataEventHandler) {
            this.dataEventHandler.emit(event, data);
        }
    },


    getSeatIndexByID: function getSeatIndexByID(userId) {
        if (!this.seats) {
            return -1;
        }
        for (var i = 0; i < this.seats.length; ++i) {
            var s = this.seats[i];
            if (s.userid == userId) {
                return i;
            }
        }
        return -1;
    },

    isOwner: function isOwner() {
        return this.seatIndex == 0;
    },

    getSeatByID: function getSeatByID(userId) {
        var seatIndex = this.getSeatIndexByID(userId);
        if (seatIndex === -1) {
            return;
        }
        var seat = this.seats[seatIndex];
        return seat;
    },

    getSelfData: function getSelfData() {
        return this.seats[this.seatIndex];
    },

    getLocalIndex: function getLocalIndex(index) {
        if (!this.seats) {
            return;
        }
        var len = 0;
        var leGGn = this.seatIndex;
        for (var i = 0; i < this.seats.length; i++) {
            if (this.seats[i].userid > 0) {
                len++;
            }
        }

        switch (len) {
            case 0:
                console.log('len === 0');
                break;
            case 1:
                var ret = (index - this.seatIndex + 1) % 1;
                break;
            case 2:
                var ret = (index - this.seatIndex + 2) % 2;
                break;
            case 3:
                var ret = (index - this.seatIndex + 3) % 3;
                break;
            case 4:
                var ret = (index - this.seatIndex + 4) % 4;
                break;
            case 5:
                var ret = (index - this.seatIndex + 5) % 5;
                break;
            case 6:
                var ret = (index - this.seatIndex + 6) % 6;
                break;
            default:
                var ret = (index - this.seatIndex + 6) % 6;
                break;
        }
        return ret;
    },

    prepareReplay: function prepareReplay(roomInfo, detailOfGame) {
        this.roomId = roomInfo.id;
        this.seats = roomInfo.seats;
        this.turn = detailOfGame.base_info.button;
        var baseInfo = detailOfGame.base_info;
        for (var i = 0; i < this.seats.length; ++i) {
            var s = this.seats[i];
            s.seatindex = i;
            s.score = null;
            s.holds = baseInfo.game_seats[i];
            s.folds = [];
            console.log(s);
            if (cc.vv.userMgr.userId == s.userid) {
                this.seatIndex = i;
            }
        }
        this.conf = {
            type: baseInfo.type
        };
    },
    initHandlers: function initHandlers() {
        var self = this;
        this.loaded = false;
        this.emitter = cc.vv.emitter;
        cc.vv.sssNet.addHandler("login_result", function (data) {
            console.log(data);
            if (data.errcode === 0) {
                var data = data.data;

                self.roomId = data.roomid;
                self.conf = data.conf;
                self.maxNumOfGames = data.conf.maxGames;
                self.numOfGames = data.numofgames;
                self.seats = data.seats;
                self.wanfa = data.wanfa;
                self.maPaiData = null;
                self.seatIndex = self.getSeatIndexByID(cc.vv.userMgr.userId);
                self.isOver = false;

                self.emitter.emit('login_result');
            } else {
                console.log(data.errmsg);
            }
        });

        cc.vv.sssNet.addHandler("login_finished", function (data) {
            console.log("login_finished");
            self.emitter.off();
            cc.director.loadScene("sssgame", function () {
                self.loaded = true;
                var index = self.seatIndex;
                var holds = self.seats[index].holds;
                var result = self.seats[index].result;
                var shootInfo = self.seats[index].shootInfo;
                var singleResult = self.seats[index].singleResult;
                var totalResult = self.seats[index].totalResult;
                var specialResult = self.seats[index].specialResult;

                if (holds && holds.length > 0) {
                    self.emitter.emit('game_holds');
                    self.emitter.emit('show_shezhipai');
                }
                if (self.wanfa !== 3) {
                    self.maPaiData = null;
                }
                if (result) {
                    console.log('login_finished have result');
                    self.emitter.emit('compare_result', result);
                }

                if (singleResult) {
                    self.emitter.emit('game_over_Notify', singleResult);
                }
                if (totalResult) {
                    self.emitter.emit('game_result_Notify', totalResult);
                }
                if (self.isBiPai) {
                    self.emitter.emit('player_outCard_notify', self.chupaidata);
                }
                self.emitter.emit('refresh_seat');
                cc.vv.sssNet.ping();
                cc.vv.wc.hide();
            });
            self.emitter.emit('login_finished');
        });

        cc.vv.sssNet.addHandler("exit_result", function (data) {
            self.roomId = null;
            self.turn = -1;
            self.seats = null;
        });

        cc.vv.sssNet.addHandler("exit_notify_push", function (data) {
            var userId = data;
            var s = self.getSeatByID(userId);
            if (s != null) {
                s.userid = 0;
                s.name = "";
                self.dispatchEvent("user_state_changed", s);
            }
        });

        cc.vv.sssNet.addHandler("dispress_push", function (data) {
            console.log('dispress_push');
            self.roomId = null;
            self.turn = -1;
            self.seats = null;
        });

        cc.vv.sssNet.addHandler("out_card_lastTime", function (data) {
            var lastTime = data;
            cc.vv.emitter.emit("set_lastTime", lastTime);
        });

        cc.vv.sssNet.addHandler("out_lixianTime", function (data) {
            var lastTime = data;
            cc.vv.emitter.emit("set_lixianTime", lastTime);
        });

        cc.vv.sssNet.addHandler("out_dissolutionTime", function (data) {
            //自动解散房间剩余时间
            var lastTime = data;
            cc.vv.emitter.emit("set_dissolutionTime", lastTime);
        });

        cc.vv.sssNet.addHandler("expression_push", function (data) {
            //发表情
            cc.vv.emitter.emit("expression_notify", data);
        });

        cc.vv.sssNet.addHandler("disconnect", function (data) {
            cc.vv.sssNet.isExit = true;
            if (self.roomId == null) {

                cc.vv.emitter.emit('remove_handler');
                cc.vv.wc.show('正在返回游戏大厅');
                cc.director.loadScene("hall");
            } else {
                if (self.isOver == false) {
                    cc.vv.emitter.emit('disconnect');
                } else {
                    self.roomId = null;
                }
            }
        });

        cc.vv.sssNet.addHandler("new_user_comes_push", function (data) {
            console.log("new_user_comes_push");
            var seatIndex = data.seatindex;
            var needCheckIp = false;
            if (self.seats[seatIndex].userid > 0) {
                self.seats[seatIndex].online = true;
                if (self.seats[seatIndex].ip != data.ip) {
                    self.seats[seatIndex].ip = data.ip;
                    needCheckIp = true;
                }
            } else {
                data.online = true;
                self.seats[seatIndex] = data;
                needCheckIp = true;
            }
            self.emitter.emit('refresh_seat', self.seats[seatIndex]);
            self.emitter.emit('user_state_offline', self.seats[seatIndex]);

            if (needCheckIp) {
                self.dispatchEvent('check_ip', self.seats[seatIndex]);
            }
        });

        cc.vv.sssNet.addHandler("apply_join", function (data) {
            self.emitter.emit('apply_join_notify', data);
        });

        cc.vv.sssNet.addHandler("user_state_push", function (data) {
            console.log(data);
            var userId = data.userid;
            var seat = self.getSeatByID(userId);
            seat.online = data.online;
            self.emitter.emit('user_state_offline', seat);
        });

        cc.vv.sssNet.addHandler("is_assign_zj", function (data) {
            console.log(data);
            self.emitter.emit('setZhuangNotify_push');
        });

        cc.vv.sssNet.addHandler("user_ready_push", function (data) {
            console.log("user_ready_push");
            console.log(data);
            var userId = data.userid;
            var seat = self.getSeatByID(userId);
            var index = self.getSeatIndexByID(userId);
            seat.ready = data.ready;
            if (index === self.seatIndex) {
                console.log("index === self.seatIndex");
                self.emitter.emit('self_ready', data);
            } else {
                self.emitter.emit('other_ready', data);
            }

            self.dispatchEvent('user_state_changed', seat);
        });

        cc.vv.sssNet.addHandler("game_mapai_push", function (data) {
            console.log("game_mapai_push");
            console.log(data);
            self.maPaiData = data;
            self.dispatchEvent('game_mapai', data);
        });

        cc.vv.sssNet.addHandler("game_num_push", function (data) {
            console.log("game_num_push");
            console.log(data);
            self.numOfGames = data;
            self.emitter.emit('game_num_notify', data);
        });

        cc.vv.sssNet.addHandler("game_holds_push", function (data) {
            console.log('game_holds_push');
            console.log(data);
            var seat = self.seats[self.seatIndex];
            console.log(data);

            seat.holds = data.holds;
            self.specialType = data.type;

            for (var i = 0; i < self.seats.length; ++i) {
                var s = self.seats[i];
                if (s.folds == null) {
                    s.folds = [];
                }
                s.ready = false;
            }
            if (self.loaded) {
                self.emitter.emit('game_holds', data.holds);
                self.emitter.emit('show_shezhipai');
            }
        });

        //普通和百变玩法的比牌结果
        cc.vv.sssNet.addHandler("compare_result_push", function (data) {
            console.log('compare_result_push');
            console.log(data);

            self.emitter.emit('compare_result', data);
            //重置单局结算数据
            self.singleReset();
        });

        //断线超时自动出最大牌
        cc.vv.sssNet.addHandler("out_maxPai_push", function (data) {
            console.log('out_maxPai_push');
            console.log(data);

            self.emitter.emit('out_maxPai_Notify');
        });

        cc.vv.sssNet.addHandler("game_start", function (data) {
            console.log('game_start');
            console.log(data);
        });

        cc.vv.sssNet.addHandler("player_outCard", function (data) {
            console.log('player_outCard');
            console.log(data);
            self.emitter.emit('player_outCard_notify', data);
        });

        cc.vv.sssNet.addHandler("quick_swing_push", function (data) {
            console.log('quick_swing_push');
            console.log(data);
            self.emitter.emit('quick_swing_notify', data);
        });

        cc.vv.sssNet.addHandler("assignZJ_push", function (data) {
            console.log('assignZJ_push');
            console.log(data);
            self.emitter.emit('assignZJ_push', data);
        });

        cc.vv.sssNet.addHandler("ZJUserId_push", function (data) {
            console.log('ZJUserId_push');
            console.log(data);
            self.emitter.emit('ZJUserId', data);
        });

        cc.vv.sssNet.addHandler("game_begin_push", function (data) {
            console.log('game_begin_push');
            console.log(data);
            self.gamestate = "begin";
            self.emitter.emit('game_begin');
        });

        cc.vv.sssNet.addHandler("game_playing_push", function (data) {
            console.log('game_playing_push');
            self.gamestate = "playing";
            self.dispatchEvent('game_playing');
        });

        cc.vv.sssNet.addHandler("game_sync_push", function (data) {
            console.log('game_sync_push');
            var seat = self.seats[self.seatIndex];
            console.log(data);
            seat.holds = data.holds;
            self.wanfa = data.wanfa;
            self.maxNumOfGames = data.maxGames;
            self.numOfGames = data.numOfGames;
            if (data.zjID) {
                self.zjID = data.zjID;
            }
            if (self.wanfa === 3 && data.mapaiData.value > 0) {
                self.maPaiData = data.mapaiData;
            } else {
                self.maPaiData = null;
            }
            if (data.state === 3) {
                //游戏为比牌界面
                self.isBiPai = true;
                self.chupaidata = data.chupaidata;
            }
            if (data.result) {
                console.log('game_sync_push have result');
                seat.result = data.result;
                self.emitter.emit('compare_result', data.result);
            }
            if (data.singleResult) {
                seat.singleResult = data.singleResult;
                if (self.loaded) {
                    self.emitter.emit('game_over_Notify', data.singleResult);
                }
            }
            if (data.totalResult) {
                seat.totalResult = data.totalResult;
                if (self.loaded) {
                    self.emitter.emit('game_result_Notify', data.totalResult);
                }
            }

            for (var i = 0; i < self.seats.length; ++i) {
                var s = self.seats[i];
                if (s.folds == null) {
                    s.folds = [];
                }
                s.ready = false;
            }
            if (self.loaded && seat.holds && seat.holds.length > 0) {
                self.emitter.emit('game_holds');
                self.emitter.emit('show_shezhipai');
            }
        });

        cc.vv.sssNet.addHandler("game_action_push", function (data) {
            self.curaction = data;
            console.log(data);
            self.dispatchEvent('game_action', data);
        });

        cc.vv.sssNet.addHandler("game_chupai_push", function (data) {
            console.log('game_chupai_push');
            var turnUserID = data;
            var si = self.getSeatIndexByID(turnUserID);
            self.doTurnChange(si);
        });

        //单局结算
        cc.vv.sssNet.addHandler("game_over_push", function (data) {
            console.log('game_over_push');
            self.reset();
            self.emitter.emit('game_over_Notify', data);
        });

        //大局结算
        cc.vv.sssNet.addHandler("game_result", function (data) {
            console.log('game_result');
            self.reset();
            self.emitter.emit('game_result_Notify', data);
        });

        cc.vv.sssNet.addHandler("game_chupai_notify_push", function (data) {
            var userId = data.userId;
            var pai = data.pai;
            var si = self.getSeatIndexByID(userId);
            self.doChupai(si, pai);
        });

        cc.vv.sssNet.addHandler("chat_push", function (data) {
            self.emitter.emit("chat_push", data);
        });

        cc.vv.sssNet.addHandler("quick_chat_push", function (data) {
            self.emitter.emit("quick_chat_push", data);
        });

        cc.vv.sssNet.addHandler("emoji_push", function (data) {
            self.emitter.emit("emoji_push", data);
        });

        cc.vv.sssNet.addHandler("dissolve_notice_push", function (data) {
            console.log("dissolve_notice_push");
            console.log(data);
            self.dissoveData = data;
            self.emitter.emit('dissolve_notice', data);
        });

        cc.vv.sssNet.addHandler("stopEndTime", function (data) {
            console.log("stopEndTime");
            self.emitter.emit('stopEndTime');
        });

        cc.vv.sssNet.addHandler("dissolve_cancel_push", function (data) {
            self.dissoveData = null;
            self.emitter.emit('dissolve_cancel', data);
        });

        cc.vv.sssNet.addHandler("voice_msg_push", function (data) {
            self.emitter.emit("voice_msg", data);
        });

        cc.vv.sssNet.addHandler("limit_login", function (data) {
            self.emitter.emit("limit_login", data);
        });
    },

    doChupai: function doChupai(seatIndex, pai) {
        this.chupai = pai;
        var seatData = this.seats[seatIndex];
        if (seatData.holds) {
            var idx = seatData.holds.indexOf(pai);
            seatData.holds.splice(idx, 1);
        }
        this.dispatchEvent('game_chupai_notify', { seatData: seatData, pai: pai });
    },

    doTurnChange: function doTurnChange(si) {
        var data = {
            last: this.turn,
            turn: si
        };
        this.turn = si;
        this.dispatchEvent('game_chupai', data);
    },

    connectGameServer: function connectGameServer(data) {
        this.dissoveData = null;
        cc.vv.sssNet.ip = data.ip + ":" + data.port;
        console.log(cc.vv.sssNet.ip);
        var self = this;

        var onConnectOK = function onConnectOK() {
            cc.vv.userMgr.serverType = "SSS_SERVER_TYPE";
            console.log("onConnectOK");
            var sd = {
                token: data.token,
                roomid: data.roomid,
                time: data.time,
                sign: data.sign
            };
            self.initHandlers();
            cc.vv.sssNet.send("login", sd);
        };

        var onConnectFailed = function onConnectFailed() {
            console.log("failed.");
            cc.vv.wc.hide();
        };
        cc.vv.wc.show("正在进入房间");
        cc.vv.sssNet.connect(onConnectOK, onConnectFailed);
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});

cc._RF.pop();
        }
        if (CC_EDITOR) {
            __define(__module.exports, __require, __module);
        }
        else {
            cc.registerModuleFunc(__filename, function () {
                __define(__module.exports, __require, __module);
            });
        }
        })();
        //# sourceMappingURL=sssNetMgr.js.map
        