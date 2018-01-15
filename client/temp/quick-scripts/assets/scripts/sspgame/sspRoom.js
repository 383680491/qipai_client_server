(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/scripts/sspgame/sspRoom.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, '2bfeevT2p9KBLes7lQVBU/g', 'sspRoom', __filename);
// scripts/sspgame/sspRoom.js

"use strict";

cc.Class({
    extends: cc.Component,

    properties: {
        lblRoomNo: {
            default: null,
            type: cc.Label
        },
        _seats: [],
        _seats2: [],
        _timeLabel: null,
        _voiceMsgQueue: [],
        _lastPlayingSeat: null,
        _playingSeat: null,
        _lastPlayTime: null,
        _yaoqingma: null,
        _time: null,
        _min: null,
        _second: null,
        _isExit: null
    },

    onLoad: function onLoad() {
        if (cc.vv == null) {
            return;
        }

        this.initView();
        this.initSeats();
        this.initEventHandlers();
    },

    initView: function initView() {
        this.prepare = this.node.getChildByName("prepare");
        var seats = this.prepare.getChildByName("seats");
        for (var i = 0; i < seats.children.length; ++i) {
            this._seats.push(seats.children[i].getComponent("sspSeat"));
        }
        this.initBtnMgr();
        this.refreshBtns();

        this._time = 60;
        this._isExit = 0;
        this._min = cc.find("Canvas/prepare/notice/minute").getComponent(cc.Label);
        this._second = cc.find("Canvas/prepare/notice/second").getComponent(cc.Label);
        this.lblRoomNo = cc.find("Canvas/infobar/Z_room_txt/New Label").getComponent(cc.Label);
        this._yaoqingma = cc.find("Canvas/prepare/yaoqing/New Label").getComponent(cc.Label);
        this._timeLabel = cc.find("Canvas/infobar/time").getComponent(cc.Label);
        this.lblRoomNo.string = cc.vv.sspNetMgr.roomId;
        this._yaoqingma.string = "邀请码：" + cc.vv.sspNetMgr.roomId;
        var gameChild = this.node.getChildByName("game");
        var sides = ["myself", "right", "up", "left"];
        for (var i = 0; i < sides.length; ++i) {
            var sideNode = gameChild.getChildByName(sides[i]);
            var seat = sideNode.getChildByName("seat");
            this._seats2.push(seat.getComponent("sspGameSeat"));
        }

        if (cc.vv.sspNetMgr.conf) {
            var type = cc.vv.sspNetMgr.conf.type;
            if (type == null || type == "") {
                type = "xzdd";
            }
        }

        var seatIndex = cc.vv.sspNetMgr.seatIndex;

        //隐藏邀请码
        if (cc.vv.sspNetMgr.numOfGames > 0) {
            var yaoqing = cc.find("Canvas/prepare/yaoqing");
            var notice = cc.find("Canvas/prepare/notice");
            yaoqing.active = false;
            notice.active = false;
        }
        var seatIndex = cc.vv.sspNetMgr.seatIndex;
        var btnWechat = cc.find("Canvas/prepare/btnWeichat");
        if (cc.vv.userMgr.control.value != 1 && cc.sys.os == cc.sys.OS_IOS) {
            //苹果隐藏
            btnWechat.active = false;
            cc.find("Canvas/game_result/btnShare").active = false;
            cc.find("Canvas/userinfo/diamond").active = false;
            cc.find("Canvas/userinfo/money").active = false;
        }
    },

    //初始化按钮
    initBtnMgr: function initBtnMgr() {
        this.btnReady = this.prepare.getChildByName("btnReady");
        this.btnWeichat = this.prepare.getChildByName("btnWeichat");
        if (this.btnWeichat) {
            if (cc.vv.userMgr.control.value == 0) {
                this.btnWeichat.active = false;
            }
            cc.vv.utils.addClickEvent(this.btnWeichat, this.node, "sspRoom", "onBtnWeichatClicked");
        }
        this.btnDissolve = this.prepare.getChildByName("btnDissolve");
    },

    refreshBtns: function refreshBtns() {
        this.btnReady = this.prepare.getChildByName("btnReady");
        this.btnDissolve = this.prepare.getChildByName("btnDissolve");
        this.btnWeichat = this.prepare.getChildByName("btnWeichat");
        var isIdle = cc.vv.sspNetMgr.numOfGames <= cc.vv.sspNetMgr.maxNumOfGames;
        var isPlaying = cc.vv.sspNetMgr.numOfGames > 0;

        this.btnDissolve.active = cc.vv.sspNetMgr.isOwner() && !isPlaying;
        this.btnWeichat.active = isIdle;
        this.btnReady.active = isIdle;
        if (cc.vv.userMgr.control.value == 0) {
            this.btnWeichat.active = false;
        }
    },

    //准备界面邀请、准备等按钮显示
    setBtnReadyActive: function setBtnReadyActive(bActive) {
        this.btnReady.active = bActive;
        this.btnWeichat.active = bActive;
        if (cc.vv.userMgr.control.value == 0) {
            this.btnWeichat.active = false;
        }
    },

    initEventHandlers: function initEventHandlers() {
        var self = this;
        this.node.on('new_user', function (data) {
            var seats = cc.vv.sspNetMgr.seats;
            for (var i = 0; i < seats.length; ++i) {
                if (seats[i].userid > 0) {
                    self.initSingleSeat(seats[i]);
                }
            }
        });

        this.node.on('user_state_changed', function (data) {
            var seats = cc.vv.sspNetMgr.seats;
            for (var i = 0; i < seats.length; ++i) {
                if (seats[i].userid > 0) {
                    self.initSingleSeat(seats[i]);
                }
            }
        });

        this.node.on('game_begin', function (data) {
            self.refreshBtns();
            self.initSeats();
        });

        this.node.on('resetSeats', function (data) {
            self.refreshBtns();
            self.resetSeats();
        });

        this.node.on('game_num', function (data) {
            self.refreshBtns();
        });

        this.node.on('game_huanpai', function (data) {
            for (var i in self._seats2) {
                self._seats2[i].refreshXuanPaiState();
            }
        });

        this.node.on('game_huanpai_over', function (data) {
            for (var i in self._seats2) {
                self._seats2[i].refreshXuanPaiState();
            }
        });

        this.node.on('voice_msg', function (data) {
            var data = data.detail;
            self._voiceMsgQueue.push(data);
            self.playVoice();
        });

        this.node.on('chat_push', function (data) {
            var data = data.detail;
            var idx = cc.vv.sspNetMgr.getSeatIndexByID(data.sender);
            var tempIdx = cc.vv.sspNetMgr.getLocalIndexByIndex(idx);
            var localIdx = cc.vv.sspNetMgr.getShowIndexByIndex(tempIdx);
            if (self.node.getChildByName("game").active === false) {
                //游戏未开始
                var index = tempIdx;
                self._seats[index].chat(data.content);
            } else {
                var index = localIdx;
                self._seats2[index].chat(data.content);
            }
        });

        this.node.on('quick_chat_push', function (data) {
            var data = data.detail;
            var idx = cc.vv.sspNetMgr.getSeatIndexByID(data.sender);
            var tempIdx = cc.vv.sspNetMgr.getLocalIndexByIndex(idx);
            var localIdx = cc.vv.sspNetMgr.getShowIndexByIndex(tempIdx);

            var index = data.content;
            var info = cc.vv.chat.getQuickChatInfo(index);
            if (self.node.getChildByName("game").active === false) {
                //游戏未开始
                var index1 = tempIdx;
                self._seats[index1].chat(info.content);
            } else {
                var index1 = localIdx;
                self._seats2[index1].chat(info.content);
            }

            cc.vv.audioMgr.playSFX(info.sound);
        });

        this.node.on('game_dipai_notify', function (pai) {
            var pai = pai.detail;
            self.setDipai(pai);
        });

        this.node.on('5yinlong_dipai_notify', function (pai) {
            var pai = pai.detail;
            self.yinlong_dipai(pai);
        });

        this.node.on('game_star_notify', function (star) {
            //星星个数
            var star = star.detail;
            var mySch = function mySch() {
                var Animation = window.sspGame.Animation;
                Animation.node.setPosition(0, 0);
                for (var j = 0; j < star.length; j++) {
                    if (star[j].star > 0) {
                        var idx = cc.vv.sspNetMgr.getSeatIndexByID(star[j].userId);
                        var tempIdx = cc.vv.sspNetMgr.getLocalIndexByIndex(idx);
                        var localIdx = cc.vv.sspNetMgr.getShowIndexByIndex(tempIdx);
                        var xingxing = Animation.xingxing[localIdx];
                        xingxing.active = true;
                        xingxing.getComponent(cc.Animation).play('xingxing');
                        self._seats2[localIdx].setStar(star[j].star);
                    }
                }
            };
            self.scheduleOnce(mySch, 1.0);
        });

        this.node.on('score_notify', function (data) {
            //分数
            var score = data.detail.score;
            for (var i in self._seats2) {
                for (var j = 0; j < score.length; j++) {
                    if (self._seats2[i]._userId === score[j].userId) {
                        self._seats2[i].setScore(score[j].score);
                    }
                }
            }
        });

        this.node.on('emoji_push', function (data) {
            var data = data.detail;
            var idx = cc.vv.sspNetMgr.getSeatIndexByID(data.sender);
            var tempIdx = cc.vv.sspNetMgr.getLocalIndexByIndex(idx);
            var localIdx = cc.vv.sspNetMgr.getShowIndexByIndex(tempIdx);
            if (self.node.getChildByName("game").active === false) {
                //游戏未开始
                var index = tempIdx;
                self._seats[index].emoji(data.content);
            } else {
                var index = localIdx;
                self._seats2[index].emoji(data.content);
            }
            console.log(data);
        });

        this.node.on('set_dissolutionTime', function (data) {
            //设置剩余 自动解散房间 的时间
            var data = data.detail;
            self._time = data / 1000;
            if (self._time > 0) {
                var min = null;
                var sec = null;
                var t = Math.ceil(self._time);
                min = Math.floor(t / 60);
                sec = Math.floor(t % 60);
                self._min.string = min;
                self._second.string = sec;
            } else if (self._time <= 0) {
                self._isExit++;
                if (self._isExit === 1) {
                    cc.vv.sspNet.send("dispress");
                }
            }
        });
        this.node.on('user_state_changed', function (data) {
            var userid = data.detail.userid;
            if (cc.vv.userMgr.userId === userid) {
                self.setBtnReadyActive(false);
            }
        });

        this.node.on('user_ready_changed', function (data) {
            var userid = data.detail;
            if (cc.vv.userMgr.userId === userid) {
                self.setBtnReadyActive(false);
            }
        });
    },

    initSeats: function initSeats() {
        var seats = cc.vv.sspNetMgr.seats;
        var len = 0;
        for (var j = 0; j < seats.length; ++j) {
            if (seats[j].userid > 0) {
                len++;
            }
        }
        for (var i = 0; i < len; ++i) {
            this.initSingleSeat(seats[i]);
        }
    },

    setDipai: function setDipai(pai) {
        var dipai = cc.find("Canvas/game/dipai");
        dipai.active = false;
        var sprite = cc.find("Canvas/game/arrow/pai").getComponent(cc.Sprite);
        sprite.spriteFrame = cc.vv.SSPMgr.getSpriteFrameByPai("M_", pai);
    },

    yinlong_dipai: function yinlong_dipai(pai) {
        var dipai = cc.find("Canvas/game/dipai");
        dipai.active = true;

        for (var i = 0; i < dipai.children.length; i++) {
            var sprite = dipai.children[i].getComponent(cc.Sprite);
            sprite.spriteFrame = cc.vv.SSPMgr.getSpriteFrameByPai("M_", pai[i]);
        }
    },

    initSingleSeat: function initSingleSeat(seat) {
        var index = cc.vv.sspNetMgr.getLocalIndexByIndex(seat.seatindex, false);
        if (index === null) {
            return;
        }
        var isOffline = !seat.online;
        var isZhuang = seat.seatindex == cc.vv.sspNetMgr.button;

        console.log("isOffline:" + isOffline);
        this._seats[index].active = true;
        this._seats[index].setInfo(seat.name, seat.score);
        this._seats[index].setReady(seat.ready);
        this._seats[index].setOffline(isOffline);
        this._seats[index].setID(seat.userid);
        this._seats[index].voiceMsg(false);

        if (!cc.vv.sspNetMgr.gamestate) {
            return;
        }
        var tempIndex = cc.vv.sspNetMgr.getLocalIndexByIndex(seat.seatindex);
        var showIndex = cc.vv.sspNetMgr.getShowIndexByIndex(tempIndex);
        var isIndex = isNaN(showIndex);

        if (seat.star) {
            this._seats2[showIndex].setStar(seat.star);
        }

        this._seats2[showIndex].setInfo(seat.name, seat.score);
        this._seats2[showIndex].setZhuang(isZhuang);
        this._seats2[showIndex].setOffline(isOffline);
        this._seats2[showIndex].setID(seat.userid);
        this._seats2[showIndex].voiceMsg(false);
        this._seats2[showIndex].refreshXuanPaiState();
    },

    onBtnSettingsClicked: function onBtnSettingsClicked() {
        cc.vv.popupMgr.showSettings();
    },

    onBtnDissolveClicked: function onBtnDissolveClicked() {
        cc.vv.alert.show("解散房间", "解散房间不扣房卡，是否确定解散？", function () {
            cc.vv.sspNet.send("dispress");
        }, true);
    },

    onBtnWeichatClicked: function onBtnWeichatClicked() {
        //微信分享监听
        console.log('分享房间号至微信: ');
        //微信浏览器----公众号登录 
        if (cc.sys.browserType == "mqqbrowser" || "wechat" == cc.sys.browserType) {
            console.log("H5分享好友");
            cc.find("Canvas/WebShare").active = true;
            cc.vv.anysdkMgr.getAccess_token("小伙子，我在四色牌【" + cc.vv.sspNetMgr.roomId + "】开好了房间，快来大战三百回合", cc.vv.sspNetMgr.roomId);
        } else if (cc.sys.os == cc.sys.OS_ANDROID || cc.sys.os == cc.sys.OS_IOS) {
            var agent = anysdk.agentManager;
            this.share_plugin = agent.getSharePlugin();
            this.share_plugin.setListener(this.onShareResult, this);
            this.shareUrl("斗斗福建十三水", "小伙子，我在四色牌【" + cc.vv.sspNetMgr.roomId + "】开好了房间，快来大战三百回合", "http://game.doudouyule.wang/?roomId=" + cc.vv.sspNetMgr.roomId, "http://game.doudouyule.wang/icon.png", "0"); //标题 内容 URL 图片路径 发送至
        }
        //其它浏览器----二维码扫码登录 
        else {
                console.log("H5分享好友");
                cc.find("Canvas/WebShare").active = true;
                cc.vv.anysdkMgr.getAccess_token("小伙子，我在四色牌【" + cc.vv.sspNetMgr.roomId + "】开好了房间，快来大战三百回合", cc.vv.sspNetMgr.roomId);
            }
    },

    onBtnExit: function onBtnExit() {
        cc.vv.sspNet.send("exit");
    },

    playVoice: function playVoice() {
        if (this._playingSeat == null && this._voiceMsgQueue.length) {
            console.log("playVoice2");
            var data = this._voiceMsgQueue.shift();
            var idx = cc.vv.sspNetMgr.getSeatIndexByID(data.sender);
            var localIndex = cc.vv.sspNetMgr.getShowIndexByIndex(idx);
            this._playingSeat = localIndex;
            this._seats[localIndex].voiceMsg(true);
            this._seats2[localIndex].voiceMsg(true);

            var msgInfo = JSON.parse(data.content);
            var msgfile = "voicemsg" + String(this.dataIndex) + ".amr";
            console.log(msgInfo.msg.length);
            cc.vv.voiceMgr.writeVoice(msgfile, msgInfo.msg);
            cc.vv.voiceMgr.play(msgfile);
            this._lastPlayTime = Date.now() + msgInfo.time;
        }
    },

    update: function update(dt) {
        var minutes = Math.floor(Date.now() / 1000 / 60);
        if (this._lastMinute != minutes) {
            this._lastMinute = minutes;
            var date = new Date();
            var h = date.getHours();
            h = h < 10 ? "0" + h : h;

            var m = date.getMinutes();
            m = m < 10 ? "0" + m : m;
            this._timeLabel.string = "" + h + ":" + m;
        }

        if (this._lastPlayTime != null) {
            if (Date.now() > this._lastPlayTime + 200) {
                this.onPlayerOver();
                this._lastPlayTime = null;
            }
        } else {
            this.playVoice();
        }
    },

    onPlayerOver: function onPlayerOver() {
        cc.vv.audioMgr.resume();
        console.log("onPlayCallback:" + this._playingSeat);
        var localIndex = this._playingSeat;
        this._playingSeat = null;
        this._seats[localIndex].voiceMsg(false);
        this._seats2[localIndex].voiceMsg(false);
    },

    //分享事件
    onShareResult: function onShareResult(code, msg) {
        console.log('111111111111111111111111111111111111');
        console.log("share result, resultcode:" + code + ", msg: " + msg);
        switch (code) {
            case anysdk.ShareResultCode.kShareSuccess:
                console.log('分享成功');
                break;
            case anysdk.ShareResultCode.kShareFail:
                console.log('分享失败');
                break;
            case anysdk.ShareResultCode.kShareCancel:
                console.log('分享取消');
                break;
            case anysdk.ShareResultCode.kShareNetworkError:
                console.log('分享错误');
                break;
        }
    },
    //分享URL
    shareUrl: function shareUrl(title, text, url, imagePath, to) {
        console.log('分享URL: ');
        console.log('title: ' + title);
        console.log('text: ' + text);
        console.log('url: ' + url);
        console.log('imagePath: ' + imagePath);
        console.log('to: ' + to);
        var map = {
            title: title, //标题
            text: text, //文本
            url: url, //链接
            mediaType: '2', //分享类型
            shareTo: to, //分享至 0 聊天 1 朋友圈 2 收藏
            imagePath: imagePath, //图片路径
            thumbSize: '64'
        };
        this.share_plugin.share(map);
    },

    resetSeats: function resetSeats() {
        var seats = cc.vv.sspNetMgr.seats;
        for (var i = 0; i < seats.length; ++i) {
            this._seats[i].reset();
            this._seats2[i].reset();
        }
        this.initSeats();
    },

    onDestroy: function onDestroy() {
        cc.vv.voiceMgr.stop();
        if (cc.vv) {
            cc.vv.sspNetMgr.clear();
        }
    }
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
        //# sourceMappingURL=sspRoom.js.map
        