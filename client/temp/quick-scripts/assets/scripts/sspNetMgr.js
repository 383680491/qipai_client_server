(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/scripts/sspNetMgr.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, '4bcb18gPfVCu4JWV+amgu2W', 'sspNetMgr', __filename);
// scripts/sspNetMgr.js

'use strict';

cc.Class({
    extends: cc.Component,

    properties: {
        emitter: null,
        dataEventHandler: null,
        roomId: null,
        maxNumOfGames: 0,
        numOfGames: 0,
        seatIndex: -1,
        seats: null,
        turn: -1,
        button: -1,
        chupai: -1,
        gamestate: 'prepare',
        isOver: false,
        dissoveData: null,
        wanfa: 0,
        numOfPlayers: 0,
        mopaiIndex: 0,
        chupaiIndex: 0,
        foldIndex: 0,
        chapaiData: null,
        voiceConversion: 1,
        loadFinish: false,
        numOfSSP: 0,
        curaction: null
    },

    // use this for initialization
    onLoad: function onLoad() {},

    clear: function clear() {
        this.dataEventHandler = null;
        this.loadFinish = false;
        if (this.isOver == null) {
            this.seats = null;
            this.roomId = null;
            this.maxNumOfGames = 0;
            this.numOfGames = 0;
        }
    },

    reset: function reset() {
        for (var i = 0; i < this.seats.length; ++i) {
            this.seats[i].ready = false;
        }
        this.gamestate = 'prepare';
        this.turn = -1;
        this.chupai = -1, this.button = -1;
        for (var i = 0; i < this.seats.length; ++i) {
            this.seats[i].holds = [];
            this.seats[i].folds = [];
            this.seats[i].liangPai = [];
            this.seats[i].chupaiNum = 0;
            this.seats[i].suopai = [];
            this.seats[i].star = 0;
            this.seats[i].ready = false;
        }
    },

    dispatchEvent: function dispatchEvent(event, data) {
        if (this.dataEventHandler) {
            this.dataEventHandler.emit(event, data);
        }
    },


    getSeatIndexByID: function getSeatIndexByID(userId) {
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
        if (seatIndex == -1) {
            return null;
        }
        var seat = this.seats[seatIndex];
        return seat;
    },

    getSelfData: function getSelfData() {
        return this.seats[this.seatIndex];
    },

    getLocalIndexByIndex: function getLocalIndexByIndex(index, isSpecial) {
        //正常的索引
        var len = this.numOfPlayers;
        if (isSpecial) {
            len = 4;
        }
        var ret = 0;
        switch (len) {
            case 0:
                console.log('len === 0');
                break;
            case 1:
                ret = (index - this.seatIndex + 1) % 1;
                break;
            case 2:
                ret = (index - this.seatIndex + 2) % 2;
                break;
            case 3:
                ret = (index - this.seatIndex + 3) % 3;
                break;
            default:
                ret = (index - this.seatIndex + 4) % 4;
                break;
        }
        return ret;
    },

    getShowIndexByIndex: function getShowIndexByIndex(index, isLight) {
        //显示的索引
        var ret = index;
        if (this.numOfPlayers === 2 && ret === 1) {
            ret = 2;
        } else if (!isLight && this.numOfPlayers === 3) {
            if (ret === 2) {
                ret = 3;
            }
        } else if (isLight && this.numOfPlayers === 3) {
            if (this.seatIndex === 0 && ret === 2) {
                ret = 3;
            } else if (this.seatIndex === 2 && ret === 1) {
                ret = 2;
            } else if (this.seatIndex === 2 && ret === 2) {
                ret = 3;
            }
        }
        return ret;
    },

    initHandlers: function initHandlers() {
        var self = this;
        console.log("initHandlers");
        cc.vv.sspNet.addHandler("login_result", function (data) {
            console.log("login_result");
            console.log(data);
            if (data.errcode === 0) {
                var data = data.data;
                self.roomId = data.roomid;
                self.conf = data.conf;
                self.maxNumOfGames = data.conf.maxGames;
                self.numOfGames = data.numofgames;
                self.seats = data.seats;
                self.recordNumOfPlayers();
                self.seatIndex = self.getSeatIndexByID(cc.vv.userMgr.userId);
                self.isOver = false;
            } else {
                console.log(data.errmsg);
            }
            self.dispatchEvent('login_result');
        });

        cc.vv.sspNet.addHandler("login_finished", function (data) {
            console.log("login_finished");
            cc.director.loadScene("sspgame", function () {
                self.loaded = true;
                self.dispatchEvent('refresh_seat');
                cc.vv.sspNet.ping();
                cc.vv.wc.hide();
                self.loadFinish = true;

                if (self.dipai) {
                    self.dispatchEvent('game_dipai_notify', self.dipai);
                    if (cc.vv.userMgr.userId === self.seats[self.turn].userid) {
                        self.dispatchEvent('chupai_tishi_notify');
                    }
                    self.dispatchEvent('game_sync');
                }
                if (self.dipais && self.dipais.length > 0) {
                    self.dispatchEvent('5yinlong_dipai_notify', self.dipais);
                }
                if (self.curaction) {
                    self.dispatchEvent('game_action', self.curaction);
                }
            });
            self.dispatchEvent('login_finished');
        });

        cc.vv.sspNet.addHandler("exit_result", function (data) {
            console.log('exit_result');
            self.roomId = null;
            self.turn = -1;
            self.seats = null;
        });

        cc.vv.sspNet.addHandler("exit_notify_push", function (data) {
            console.log('exit_notify_push');
            var userId = data;
            var s = self.getSeatByID(userId);
            if (s != null) {
                s.userid = 0;
                s.name = "";
                self.dispatchEvent("user_state_changed", s);
            }
        });

        cc.vv.sspNet.addHandler("dispress_push", function (data) {
            console.log('dispress_push');
            self.roomId = null;
            self.turn = -1;
            self.seats = null;
        });

        cc.vv.sspNet.addHandler("disconnect", function (data) {
            console.log('disconnect');
            cc.vv.sspNet.isExit = true;
            if (self.roomId == null) {

                cc.vv.wc.show('正在返回游戏大厅');
                cc.director.loadScene("hall");
            } else {
                if (self.isOver == false) {
                    self.dispatchEvent("disconnect");
                } else {
                    self.roomId = null;
                }
            }
        });

        cc.vv.sspNet.addHandler("apply_join", function (data) {
            self.dispatchEvent('apply_join_notify', data);
        });

        cc.vv.sspNet.addHandler("new_user_comes_push", function (data) {
            console.log('new_user_comes_push');
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
            self.recordNumOfPlayers();
            self.dispatchEvent('new_user', self.seats[seatIndex]);

            if (needCheckIp) {
                self.dispatchEvent('check_ip', self.seats[seatIndex]);
            }
        });

        cc.vv.sspNet.addHandler("out_dissolutionTime", function (data) {
            //自动解散房间剩余时间
            var lastTime = data;
            self.dispatchEvent("set_dissolutionTime", lastTime);
        });

        cc.vv.sspNet.addHandler("user_state_push", function (data) {
            console.log("user_state_push");
            var userId = data.userid;
            var seat = self.getSeatByID(userId);
            seat.online = data.online;
            self.dispatchEvent('user_state_changed', seat);
        });

        cc.vv.sspNet.addHandler("user_ready_push", function (data) {
            console.log("user_ready_push");
            var userId = data.userid;
            var seat = self.getSeatByID(userId);
            seat.ready = data.ready;
            self.dispatchEvent('user_ready_changed', userId);
            self.dispatchEvent('user_state_changed', userId);
        });
        cc.vv.sspNet.addHandler("game_waitChi_push", function (data) {
            self.dispatchEvent('hideChi');
        });

        cc.vv.sspNet.addHandler("game_holds_push", function (data) {
            var seat = self.seats[self.seatIndex];
            console.log(data);
            seat.holds = data.holds;
            seat.suopai = data.longPai;

            for (var i = 0; i < self.seats.length; ++i) {
                var s = self.seats[i];
                if (s.folds == null || s.folds) {
                    s.folds = [];
                }
                if (s.pengs == null || s.pengs) {
                    s.pengs = [];
                }
                if (s.liangPai == null || s.liangPai) {
                    s.liangPai = [];
                };
                s.ready = false;
            }

            self.dispatchEvent('game_holds');
        });

        cc.vv.sspNet.addHandler("game_gameState_push", function (data) {
            console.log('game_playing_push');
            self.gamestate = data.gameState;
        });

        cc.vv.sspNet.addHandler("game_begin_push", function (data) {
            console.log('game_begin_push');
            console.log(data);
            self.button = data;
            self.turn = self.button;
            self.chupaiIndex = self.button;
            self.gamestate = "begin";
            self.recordNumOfPlayers();
            self.dispatchEvent('game_begin');

            for (var i = 0; i < self.seats.length; ++i) {
                var s = self.seats[i];
                s.chupaiNum = 0;
                if (s.holds && s.holds.length == 21) {
                    self.dispatchEvent('chupai_tishi_notify');
                }
            }
        });

        cc.vv.sspNet.addHandler("out_card_lastTime", function (data) {
            console.log('out_card_lastTime');
            self.dispatchEvent('out_card_lastTime', data);
        });

        cc.vv.sspNet.addHandler("game_tuoGuan_push", function (data) {
            //改为托管状态
            console.log('game_tuoGuan_push');
            self.dispatchEvent('game_tuoGuan_push');
        });

        cc.vv.sspNet.addHandler("game_playing_push", function (data) {
            console.log('game_playing_push');
            self.dispatchEvent('game_playing');
        });

        cc.vv.sspNet.addHandler("game_sync_push", function (data) {
            console.log("game_sync_push");
            console.log(data);
            self.numOfSSP = data.numofpai;
            self.gamestate = data.state;
            self.curaction = data.Operations;

            self.turn = data.turn;
            self.button = data.button;
            self.chupai = data.chuPai;

            self.dipai = data.dipai;

            self.dipais = data.dipais;

            for (var i = 0; i < data.seats.length; ++i) {
                var seat = self.seats[i];
                var sd = data.seats[i];
                seat.folds = sd.folds;
                seat.star = sd.star;
                seat.liangPai = sd.liangPai;
                if (seat.userid === cc.vv.userMgr.userId) {
                    seat.holds = data.holds.holds;
                    seat.suopai = data.holds.longPai;
                }
            }
            self.recordNumOfPlayers();

            self.isSycn = false;
        });

        cc.vv.sspNet.addHandler("game_begin_chupaiTime_push", function (data) {
            self.chupaiTime = data.chupaiTime;
            self.showChuPaiTime = true;
            if (self.loadFinish) {
                self.doShowChuPaiTime();
            }
        });

        cc.vv.sspNet.addHandler("game_action_push", function (data) {
            console.log('game_action_push');
            self.curaction = data;
            console.log(data);
            if (self.loadFinish) {
                self.dispatchEvent('game_action', data);
            }
        });
        cc.vv.sspNet.addHandler("game_wait_push", function (data) {
            console.log('tishi_notify');
            self.dispatchEvent('tishi_notify');
        });

        cc.vv.sspNet.addHandler("game_num_push", function (data) {
            console.log('game_num_push');
            self.numOfGames = data;
            self.dispatchEvent('game_num', data);
        });

        cc.vv.sspNet.addHandler("game_over_push", function (data) {
            console.log('game_over_push');
            self.dipai = null;
            var results = data.results;
            for (var i = 0; i < results.length; ++i) {
                self.seats[i].score = results.length == 0 ? 0 : results[i].totalScore;
            }
            self.dispatchEvent('game_over', results);
            self.doHu(results);
            for (var i = 0; i < data.results.length; ++i) {
                if (results[i].successive === 8 && results[i].type && results[i].type != 'draw') {
                    self.dispatchEvent('8lianSheng', i);
                } else if (results[i].successive === 5 && results[i].type && results[i].type != 'draw') {
                    self.dispatchEvent('5lianSheng', i);
                } else if (results[i].successive === 3 && results[i].type && results[i].type != 'draw') {
                    self.dispatchEvent('3lianSheng', i);
                }
            }
            if (data.endinfo) {
                self.isOver = true;
                self.dispatchEvent('game_end', data.endinfo);
            }
            self.reset();
            for (var i = 0; i < self.seats.length; ++i) {
                self.dispatchEvent('user_state_changed', self.seats[i]);
            }
        });

        cc.vv.sspNet.addHandler("ssp_count_push", function (data) {
            console.log('ssp_count_push');
            self.numOfSSP = data;
            self.dispatchEvent('ssp_count', data);
        });

        cc.vv.sspNet.addHandler("game_dipai_notify_push", function (data) {
            console.log('game_dipai_notify_push');
            var pai = data.pai;
            self.dispatchEvent('game_dipai_notify', pai);
        });

        cc.vv.sspNet.addHandler("5yinlong_dipai_notify_push", function (data) {
            console.log('5yinlong_dipai_notify_push');
            var pai = data.pai;
            self.dispatchEvent('5yinlong_dipai_notify', pai);
        });

        cc.vv.sspNet.addHandler("game_star_notify_push", function (data) {
            //星星个数
            console.log('game_star_notify_push');
            var star = data.star;
            self.dispatchEvent('game_star_notify', star);
        });

        cc.vv.sspNet.addHandler("game_chupai_notify_push", function (data) {
            console.log('game_chupai_notify_push');
            var userId = data.userId;
            var pai = data.pai;
            var si = self.getSeatIndexByID(userId);
            self.chupaiTime = data.chupaiTime;
            self.foldIndex = si;
            self.doChupai(si, pai);
        });

        cc.vv.sspNet.addHandler("game_mopai_push", function (data) {
            //
            console.log('game_mopai_push');
            var userId = data.userId;
            var si = self.getSeatIndexByID(userId);
            self.mopaiIndex = si;
            self.chupaiIndex = si;
            self.foldIndex = si;
            self.doMopai(si, data);
        });

        cc.vv.sspNet.addHandler("fapai_notify_push", function (data) {
            console.log('fapai_notify_push');
            var userId = data.userId; //进行摸牌动作
            var pai = data.pai;
            var si = self.getSeatIndexByID(userId);

            var seats = cc.vv.sspNetMgr.seats;
            var PlaneLen = 0; //游戏人数
            for (var i = 0; i < seats.length; ++i) {
                if (seats[i].userid > 0) {
                    PlaneLen++;
                }
            }

            var seatIndex = si - 1; //前一个人的
            if (seatIndex < 0) {
                seatIndex = PlaneLen - 1;
            }
            self.doGuo(seatIndex, pai, si);
            self.mopaiIndex = seatIndex;

            var index = si + 1;
            if (index == PlaneLen) {
                index = 0;
            }
            self.doTurnChange(si);
        });

        cc.vv.sspNet.addHandler("guo_notify_push", function (data) {
            console.log('guo_notify_push');
            //隐藏吃碰杠那行
            self.dispatchEvent('hideGuo_notify');
        });

        cc.vv.sspNet.addHandler("guo_result", function (data) {
            console.log('guo_result');
            self.dispatchEvent('guo_result');
        });

        cc.vv.sspNet.addHandler("score_notify_push", function (data) {
            console.log('score_notify_push');
            for (var i = 0; i < self.seats.length; ++i) {
                for (var j = 0; j < data.score.length; j++) {
                    if (self.seats[i].userid === data.score[j].userId) {
                        self.seats[i].score = data.score[j].score;
                    }
                }
            }
            self.dispatchEvent("score_notify", data);
        });

        cc.vv.sspNet.addHandler("peng_notify_push", function (data) {
            console.log('peng_notify_push');
            console.log(data);
            var userId = data.userid;
            var pai = data.pai;
            var si = self.getSeatIndexByID(userId);
            self.doPeng(si, data.pai);
        });

        cc.vv.sspNet.addHandler("gang_notify_push", function (data) {
            console.log('gang_notify_push');
            console.log(data);
            var userId = data.userid;
            var pai = data.pai;
            var si = self.getSeatIndexByID(userId);
            self.doGang(si, pai, data.gangtype);
        });
        cc.vv.sspNet.addHandler("game_selectChiPai_push", function (data) {
            console.log('game_selectChiPai_push');
            self.dispatchEvent('chi_notify', data);
        });
        cc.vv.sspNet.addHandler("game_liangPai_push", function (data) {
            var userId = data.userId;
            var si = self.getSeatIndexByID(userId);
            var redundantPai = null; //多余的牌
            if (data.pai.arr) {
                var pai = data.pai.arr;
                redundantPai = data.pai.pai;
            } else {
                var pai = data.pai;
            }

            self.liangPai(si, pai, data.type, redundantPai);
            if (cc.vv.userMgr.userId === userId) {
                self.dispatchEvent('chupai_tishi_notify');
            }
            self.chupaiIndex = si;
            self.doTurnChange(si);
        });

        cc.vv.sspNet.addHandler("jinlong_notify_push", function (data) {
            var userId = data.userId;
            var si = self.getSeatIndexByID(userId);
            var pai = data.pai;
            for (var i = 0; i < pai.length; i++) {
                self.liangPaiJinlong(si, pai[i], "jinlong", pai.length);
            }
        });

        cc.vv.sspNet.addHandler("chat_push", function (data) {
            console.log("chat_push");
            self.dispatchEvent("chat_push", data);
        });

        cc.vv.sspNet.addHandler("expression_push", function (data) {
            console.log("expression_push");
            self.dispatchEvent("expression_push", data);
        });

        cc.vv.sspNet.addHandler("quick_chat_push", function (data) {
            console.log("quick_chat_push");
            self.dispatchEvent("quick_chat_push", data);
        });

        cc.vv.sspNet.addHandler("emoji_push", function (data) {
            console.log("emoji_push");
            self.dispatchEvent("emoji_push", data);
        });

        cc.vv.sspNet.addHandler("dissolve_notice_push", function (data) {
            console.log("dissolve_notice_push");
            console.log(data);
            self.dissoveData = data;
            self.dispatchEvent("dissolve_notice", data);
        });

        cc.vv.sspNet.addHandler("dissolve_cancel_push", function (data) {
            console.log('dissolve_cancel_push');
            self.dissoveData = null;
            self.dispatchEvent("dissolve_cancel", data);
        });

        cc.vv.sspNet.addHandler("voice_msg_push", function (data) {
            console.log('voice_msg_push');
            self.dispatchEvent("voice_msg", data);
        });

        cc.vv.sspNet.addHandler("out_dissolutionTime", function (data) {
            //自动解散房间剩余时间
            var lastTime = data;
            self.dispatchEvent("set_dissolutionTime", lastTime);
        });

        cc.vv.sspNet.addHandler("limit_login", function (data) {
            self.dispatchEvent("limit_login", data);
        });
    },

    doTurnChange: function doTurnChange(si) {
        var data = {
            last: this.turn,
            turn: si
        };
        this.turn = si;
        this.dispatchEvent('game_chupai', data);
    },

    doDipais: function doDipais(data) {
        //上面那些底牌
        console.log('5yinlong_dipai_notify_push');
        var pai = data.pai;
        this.dispatchEvent('5yinlong_dipai_notify', pai);
    },

    doStar: function doStar(data) {
        //星星
        console.log('game_star_notify_push');
        var star = data.star;
        this.dispatchEvent('game_star_notify', star);
    },

    doScore: function doScore(data) {
        //分数
        console.log('score_notify_push');
        for (var i = 0; i < this.seats.length; ++i) {
            for (var j = 0; j < data.score.length; j++) {
                if (this.seats[i].userid === data.score[j].userId) {
                    this.seats[i].score = data.score[j].score;
                }
            }
        }
        this.dispatchEvent("score_notify", data);
    },

    doHu: function doHu(data) {
        this.dispatchEvent('hupai', data);
    },

    recordNumOfPlayers: function recordNumOfPlayers() {
        this.numOfPlayers = 0;
        for (var i = 0; i < this.seats.length; i++) {
            var seat = this.seats[i];
            if (seat.userid > 0) {
                this.numOfPlayers++;
            }
        }
    },

    doShowChuPaiTime: function doShowChuPaiTime() {
        this.dispatchEvent('game_chupai_countTime');
        this.showChuPaiTime = false;
    },

    doGuo: function doGuo(seatIndex, pai, si) {
        var seatData = this.seats[seatIndex];
        var folds = seatData.folds;
        folds.push(pai);
        this.dispatchEvent('fold_notify', seatData);

        var CurSeatData = this.seats[si]; //当前人的data
        this.dispatchEvent('guo_notify', CurSeatData);
        if (this.chupai) {
            if (pai.type !== this.chupai.type || pai.value !== this.chupai.value) {
                this.dispatchEvent('game_mopai', { seatIndex: seatIndex, pai: pai });
            }
        }
    },

    doMopai: function doMopai(seatIndex, data) {
        var seatData = this.seats[seatIndex];
        var pai = data.pai;
        if (cc.vv.replayMgr.isReplay() == true) {
            pai = data;
        }
        this.dispatchEvent('game_mopai', { seatIndex: seatIndex, pai: pai });
    },

    doChupai: function doChupai(seatIndex, pai) {
        this.chupai = pai;
        var seatData = this.seats[seatIndex];
        if (seatData.holds) {
            var idx = this.getIndexof(seatData.holds, pai);
            seatData.holds.splice(idx, 1);
        }

        this.dispatchEvent('game_chupai_notify', { seatData: seatData, pai: pai, seatIndex: seatIndex });
        this.dispatchEvent('game_chupai_countTime');
    },

    doPeng: function doPeng(seatIndex, pai) {
        var seatData = this.seats[seatIndex];
        //移除手牌
        if (seatData.holds) {
            for (var i = 0; i < 2; ++i) {
                var idx = this.getIndexof(seatData.holds, pai);
                seatData.holds.splice(idx, 1);
            }
        }

        //更新碰牌数据
        var pengs = seatData.pengs;
        pengs.push(pai);

        this.dispatchEvent('peng_notify', seatData);
    },
    liangPai: function liangPai(seatIndex, pai, type, redundantPai) {
        var seatData = this.seats[seatIndex];
        var isDel = false;
        //移除手牌
        if (seatData.holds) {
            for (var i = 0; i < pai.length; i++) {
                if (redundantPai && !isDel && pai[i].type === redundantPai.type && pai[i].value === redundantPai.value) {
                    //多余的牌不用删掉
                    isDel = true;
                    continue;
                }
                if (pai[i]) {
                    var idx = this.getIndexof(seatData.holds, pai[i]);
                    if (idx != -1) {
                        seatData.holds.splice(idx, 1);
                    }
                }
            }
        }

        //更新碰牌数据
        var liangPai = seatData.liangPai;
        var data = [];
        liangPai.push(data);
        var len = liangPai.length - 1;
        for (var i = 0; i < pai.length; i++) {
            liangPai[len].push(pai[i]);
        }

        var Data = [];
        Data.seatData = seatData;
        Data.type = type;
        Data.redundantPai = redundantPai;
        console.log("liangPai:");
        console.log("剩余手牌:", seatData.holds);

        this.dispatchEvent('liangPai_notify', Data);
    },

    liangPaiJinlong: function liangPaiJinlong(seatIndex, pai, type, jinlongLen) {
        var seatData = this.seats[seatIndex];
        //移除手牌
        if (seatData.holds) {
            for (var i = 0; i < pai.length; i++) {
                if (pai[i]) {
                    var idx = this.getIndexof(seatData.holds, pai[i]);
                    if (idx != -1) {
                        seatData.holds.splice(idx, 1);
                    }
                }
            }
        }

        //更新碰牌数据
        var liangPai = seatData.liangPai;
        seatData.jinlongLen = jinlongLen;
        var data = [];
        liangPai.push(data);
        var len = liangPai.length - 1;
        for (var i = 0; i < pai.length; i++) {
            liangPai[len].push(pai[i]);
        }

        var Data = [];
        Data.seatData = seatData;
        Data.type = type;
        console.log("liangPaiJinlong:");
        console.log("剩余手牌:", seatData.holds);
        this.dispatchEvent('liangPaiJinlong_notify', Data);
    },

    getIndexof: function getIndexof(holds, pai1) {
        //返回手牌里面这张牌的索引
        for (var i = 0; i < holds.length; i++) {
            if (holds[i].type === pai1.type && holds[i].value === pai1.value) {
                return i;
            }
        }
        return -1;
    },

    connectGameServer: function connectGameServer(data) {
        this.dissoveData = null;
        cc.vv.sspNet.ip = data.ip + ":" + data.port;
        console.log(cc.vv.sspNet.ip);
        var self = this;
        console.log('connectGameServer');
        var onConnectOK = function onConnectOK() {
            cc.vv.userMgr.serverType = "SSP_SERVER_TYPE";
            console.log("onConnectOK");
            var sd = {
                token: data.token,
                roomid: data.roomid,
                time: data.time,
                sign: data.sign
            };
            self.initHandlers();
            cc.vv.sspNet.send("login", sd);
            console.log("onConnectOK over");
        };

        var onConnectFailed = function onConnectFailed() {
            console.log("failed.");
            cc.vv.wc.hide();
        };
        console.log("正在进入房间");
        cc.vv.wc.show("正在进入房间");
        cc.vv.sspNet.connect(onConnectOK, onConnectFailed);
        console.log("正在进入房间over");
    },

    SSPPaiformat: function SSPPaiformat(Data) {
        //四色牌牌格式转换
        var arrPai = [];
        for (var i = 0; i < Data.length; i++) {
            var pai = [];
            pai.type = Data[i][0]; //型号
            pai.value = Data[i][1]; //值
            arrPai.push(pai);
        }

        return arrPai;
    },

    prepareReplay: function prepareReplay(roomInfo, detailOfGame) {
        console.log("sspprepareReplay");
        this.roomId = roomInfo.id;
        this.seats = roomInfo.seats;
        this.turn = detailOfGame.base_info.button;
        var baseInfo = detailOfGame.base_info;
        for (var i = 0; i < this.seats.length; ++i) {
            if (!baseInfo.game_seats[i]) {
                this.seats[i].userid = 0;
            }
            var s = this.seats[i];
            s.seatindex = i;
            s.score = null;
            if (baseInfo.game_seats[i]) {
                var arrpai = this.SSPPaiformat(baseInfo.game_seats[i]);
            } else {
                var arrpai = [];
            }

            s.holds = arrpai;
            if (s.holds.length === 21) {
                this.button = i;
                this.chupaiIndex = this.button;
            }
            s.pengs = [];
            s.chis = [];
            s.huas = [];
            s.liangPai = [];
            s.suopai = [];
            s.star = [];
            s.folds = [];
            s.chupaiNum = 0;
            console.log(s);
            if (cc.vv.userMgr.userId == s.userid) {
                this.seatIndex = i;
            }
        }
        this.recordNumOfPlayers();
        this.conf = {
            type: baseInfo.type
        };
        if (this.conf.type == null) {
            this.conf.type == "xzdd";
        }
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
        //# sourceMappingURL=sspNetMgr.js.map
        