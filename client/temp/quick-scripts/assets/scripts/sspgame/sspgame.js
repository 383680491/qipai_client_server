(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/scripts/sspgame/sspgame.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, 'c92ccrYTiVEPKKfe7yRQ3Jc', 'sspgame', __filename);
// scripts/sspgame/sspgame.js

"use strict";

cc.Class({
    extends: cc.Component,

    properties: {
        gameRoot: {
            default: null,
            type: cc.Node
        },

        prepareRoot: {
            default: null,
            type: cc.Node
        },
        SSPgameAtlas: {
            default: null,
            type: cc.SpriteAtlas
        },
        SSPTeXiaoAtlas: {
            default: null,
            type: cc.SpriteAtlas
        },
        AnimationNode: {
            default: null,
            type: cc.Node
        },
        _mySSPArr: [],
        _selectedSSP: null,
        _playEFX: null,
        paiData: null
    },

    onLoad: function onLoad() {
        console.log("sspGame onLoad begin");
        window.sspGame = this;

        this.addComponent("sspRoom");
        this.addComponent("Chat");
        this.addComponent("sspFolds");
        this.addComponent("SSPReplayCtrl");
        this.addComponent("ReConnect");
        this.addComponent("Voice");
        this.addComponent("UserInfoShow");
        this.addComponent("PopupMgr");
        this.addComponent("SSPPengGangs");
        this.addComponent("SSPGameOver");
        this.addComponent("SSPGameResult");

        this.initView();
        this.initEventHandlers();

        this.gameRoot.active = false;
        this.prepareRoot.active = true;

        this.gameSeatsCom.onGameBeign(this._mySSPArr);

        //初始化吃的数组 by xsz
        this.chiTargetPai;
        cc.vv.audioMgr.playBGM("bgFight.mp3");
        cc.vv.utils.addEscEvent(this.node);
        cc.vv.sspNetMgr.voiceConversion = 1;
    },

    initView: function initView() {
        //搜索需要的子节点
        this.node.active = true;
        var gameChild = this.node.getChildByName("game");

        this.gameSeatsCom = gameChild.getComponent('sspGameSeats');
        this.gameSeatsCom.start();
        this.Animation = this.AnimationNode.getComponent('SSPAnimation');

        this._sspcount = gameChild.getChildByName('sspcount').getComponent(cc.Label);
        this._sspcount.string = cc.vv.sspNetMgr.numOfSSP;
        this._gamecount = gameChild.getChildByName('gamecount').getComponent(cc.Label);
        this._gamecount.string = "" + cc.vv.sspNetMgr.numOfGames + "/" + cc.vv.sspNetMgr.maxNumOfGames;

        var myselfChild = gameChild.getChildByName("myself");
        var myholds = myselfChild.getChildByName("holds");

        this._chupaidrag = gameChild.getChildByName('chupaidrag');
        this._chupaidrag.active = false;
        this._playEFX = this.node.getChildByName("Animation");
        this._tishi = cc.find("Canvas/game/myself/tishi");
        this.hidden_tishi();
        this._tuoguan = cc.find("Canvas/game/myself/tuoguan");
        this.hidden_tuoguan();

        var realwidth = cc.director.getVisibleSize().width;
        for (var i = 0; i < myholds.children.length; ++i) {
            var sprite = myholds.children[i].getComponent(cc.Sprite);
            this._mySSPArr.push(sprite);
            sprite.spriteFrame = null;
            this.initDragStuffs(sprite.node);
        }
        myholds.scaleX *= realwidth / 1280;
        myholds.scaleY *= realwidth / 1280;

        var opts = gameChild.getChildByName("ops");
        this._options = opts;

        this._setting = this.node.getChildByName("setting");
        this._btnMianban = this._setting.getChildByName("btn_mianban");
        var newNode = this._setting.getChildByName("New Node");
        this._btnHelp = newNode.getChildByName("public-bangzhu");
        this._btnBack = newNode.getChildByName("btnBack");
        this.addBtnHandler(this._btnMianban);
        this.addBtnHandler(this._btnBack);
        this.addBtnHandler(this._btnHelp);
        for (var i = 0; i < this._setting.children.length; i++) {
            if (i != 1) {
                this._setting.children[i].active = false;
            }
        }
    },

    initEventHandlers: function initEventHandlers() {
        cc.vv.sspNetMgr.dataEventHandler = this.node;

        //初始化事件监听器
        var self = this;

        this.node.on('expression_push', function (data) {
            //发表情
            self.expression(data);
        });
        this.node.on('game_holds', function (data) {
            self.gameSeatsCom.onGameHolds(self._mySSPArr, self.Animation);
        });
        this.node.on('ssp_count', function (data) {
            self._sspcount.string = cc.vv.sspNetMgr.numOfSSP;
        });
        this.node.on('game_num', function (data) {
            self._gamecount.string = "" + cc.vv.sspNetMgr.numOfGames + "/" + cc.vv.sspNetMgr.maxNumOfGames;
        });
        this.node.on('game_begin', function (data) {
            self.gameSeatsCom.onGameBeign(self._mySSPArr);
        });
        this.node.on('apply_join_notify', function (data) {
            self.applyJoin(data.detail);
        });
        this.node.on('game_action', function (data) {
            var data = data.detail;
            console.log('game_action');
            self.paiData = data.pai;
            self.gameSeatsCom.showAction(data);
        });
        this.node.on('tishi_notify', function () {
            console.log('tishi_notify');
            self.tishi();
        });
        this.node.on('chupai_tishi_notify', function () {
            console.log('chupai_tishi_notify');
            self.chupaiTishi(); //出牌提示
        });
        this.node.on('game_mopai', function (data) {
            self.gameSeatsCom.hideChupai();
            var data = data.detail;
            self.gameSeatsCom.showMopai(data);
        });
        this.node.on('game_chupai_notify', function (data) {
            self.hidden_tishi();
            var seatData = data.detail.seatData;
            var seatIndex = data.detail.seatIndex;
            var pai = data.detail.pai;

            var sex = "nan";
            if (cc.vv.userMgr.sex == 1) {
                //男
                sex = "nan";
            } else if (cc.vv.userMgr.sex == 2) {
                //女
                sex = "nv";
            }
            var voiceConversion = "PTH";
            if (cc.vv.sspNetMgr.voiceConversion == 0) {
                //福州话
                voiceConversion = "FZH";
            } else if (cc.vv.sspNetMgr.voiceConversion == 1) {
                //普通话
                voiceConversion = "PTH";
            }
            var voice = pai.value;

            if (pai.type === 0 || pai.type === 3) {
                //红色黄色为帅 兵
                if (pai.value === 1) {
                    voice = "1shuai";
                } else if (pai.value === 7) {
                    voice = "7bin";
                }
            }
            if (pai.type === 1 || pai.type === 2) {
                //绿色白色为将 卒
                if (pai.value === 1) {
                    voice = "1jiang";
                } else if (pai.value === 7) {
                    voice = "7zu";
                }
            }
            cc.vv.audioMgr.playSFX("sspMusic/" + voiceConversion + "/" + sex + "/" + voice + ".mp3");

            //如果是自己，则刷新手牌
            if (seatData.seatindex == cc.vv.sspNetMgr.seatIndex) {
                self.gameSeatsCom.initSSP(self._mySSPArr);
            } else {
                seatData.chupaiNum++;
                self.gameSeatsCom.initOtherSSP(seatData);
            }

            self.gameSeatsCom.showChupai();
        });
        this.node.on('guo_notify', function (data) {
            self.gameSeatsCom.hideOptions();
            var data = data.detail;
            self.mopai(data);
            cc.vv.audioMgr.playSFX("give.mp3");
        });
        this.node.on('hideGuo_notify', function (data) {
            self.gameSeatsCom.hideOptions();;
        });
        this.node.on('peng_notify', function (data) {
            self.gameSeatsCom.hideChupai();

            var seatData = data.detail;
            if (seatData.seatindex == cc.vv.sspNetMgr.seatIndex) {
                self.gameSeatsCom.initSSP(self._mySSPArr);
            } else {
                self.gameSeatsCom.initOtherSSP(seatData);
            }
            var localIndex = cc.vv.sspNetMgr.getLocalIndexByIndex(seatData.seatindex);
            var showIndex = cc.vv.sspNetMgr.getShowIndexByIndex(localIndex);
            self.playAnimation("peng", showIndex, "peng");
            cc.vv.audioMgr.playSFX("nv/peng.mp3");
            self.gameSeatsCom.hideOptions();
        });

        this.node.on('liangPai_notify', function (data) {
            self.showChi(false);
            var data = data.detail;
            if (data.type != "dan") {
                self.gameSeatsCom.hideChupai();
            } else {
                var mySch = function mySch() {
                    self.gameSeatsCom.hideChupai();
                };
                self.scheduleOnce(mySch, 1.0);
            }
            var seatData = data.seatData;
            if (seatData.seatindex == cc.vv.sspNetMgr.seatIndex) {
                self.gameSeatsCom.initSSP(self._mySSPArr);
            } else {
                self.gameSeatsCom.initOtherSSP(seatData);
            }
            var localIndex = cc.vv.sspNetMgr.getLocalIndexByIndex(seatData.seatindex);
            var showIndex = cc.vv.sspNetMgr.getShowIndexByIndex(localIndex);

            var sex = "nan";
            if (cc.vv.userMgr.sex == 1) {
                //男
                sex = "nan";
            } else if (cc.vv.userMgr.sex == 2) {
                //女
                sex = "nv";
            }
            var voiceConversion = "PTH";
            if (cc.vv.sspNetMgr.voiceConversion == 0) {
                //福州话
                voiceConversion = "FZH";
            } else if (cc.vv.sspNetMgr.voiceConversion == 1) {
                //普通话
                voiceConversion = "PTH";
            }

            if (data.type === "chi") {
                self.playAnimation("chi", showIndex, "chi");
                cc.vv.audioMgr.playSFX("sspMusic/" + voiceConversion + "/" + sex + "/chi.mp3");
            } else if (data.type === "peng") {
                self.playAnimation("peng", showIndex, "peng");
                cc.vv.audioMgr.playSFX("sspMusic/" + voiceConversion + "/" + sex + "/peng.mp3");
            } else if (data.type === "gang") {
                self.playAnimation("yinlong", showIndex, "jinlong");
                cc.vv.audioMgr.playSFX("sspMusic/" + voiceConversion + "/" + sex + "/gang.mp3");
            }

            self.gameSeatsCom.hideOptions();
            self.hidden_tishi();
        });
        this.node.on('game_sync', function (data) {
            self.gameRoot.active = true;
            self.prepareRoot.active = false;
            self.hidden_tuoguan();
            self.gameSeatsCom.onGameBeign(self._mySSPArr);
        });
        this.node.on('liangPaiJinlong_notify', function (data) {
            var data = data.detail;
            var seatData = data.seatData;
            if (seatData.seatindex == cc.vv.sspNetMgr.seatIndex) {
                self.gameSeatsCom.initSSP(self._mySSPArr);
            } else {
                self.gameSeatsCom.initOtherSSP(seatData);
            }
            var localIndex = cc.vv.sspNetMgr.getLocalIndexByIndex(seatData.seatindex);
            var showIndex = cc.vv.sspNetMgr.getShowIndexByIndex(localIndex);

            self.playAnimation("jinlong", showIndex, "jinlong");
            cc.vv.audioMgr.playSFX("nv/gang.mp3");
        });
        this.node.on('chi_notify', function (data) {
            var data = data.detail;
            //判断手牌是否能左吃中吃右吃
            self.gameSeatsCom.CheckCanChi(data);
            self.chiData = data;
            self.showChi(true);
        });
        this.node.on('game_tuoGuan_push', function (data) {
            self._tuoguan.active = true;
        });
        this.node.on('3lianSheng', function (data) {
            var data = data.detail;
            var localIndex = cc.vv.sspNetMgr.getLocalIndexByIndex(data);
            var showIndex = cc.vv.sspNetMgr.getShowIndexByIndex(localIndex);
            var mySch = function mySch() {
                self.playAnimation("sanliangsheng", showIndex, "liangsheng");
            };
            self.scheduleOnce(mySch, 1.0);
        });
        this.node.on('5lianSheng', function (data) {
            var data = data.detail;
            var localIndex = cc.vv.sspNetMgr.getLocalIndexByIndex(data);
            var showIndex = cc.vv.sspNetMgr.getShowIndexByIndex(localIndex);
            var mySch = function mySch() {
                self.playAnimation("wuliangsheng", showIndex, "liangsheng");
            };
            self.scheduleOnce(mySch, 1.0);
        });
        this.node.on('8lianSheng', function (data) {
            var data = data.detail;
            var localIndex = cc.vv.sspNetMgr.getLocalIndexByIndex(data);
            var showIndex = cc.vv.sspNetMgr.getShowIndexByIndex(localIndex);
            var mySch = function mySch() {
                self.playAnimation("baliangsheng", showIndex, "liangsheng");
            };
            self.scheduleOnce(mySch, 1.0);
        });
        this.node.on('hideChi', function (data) {
            self.gameSeatsCom.hideChi(); //隐藏吃按钮
        });
        this.node.on('gang_notify', function (data) {
            self.gameSeatsCom.hideChupai();
            var data = data.detail;
            var seatData = data.seatData;
            var gangtype = data.gangtype;
            if (seatData.seatindex == cc.vv.sspNetMgr.seatIndex) {
                self.gameSeatsCom.initSSP(self._mySSPArr);
            } else {
                self.gameSeatsCom.initOtherSSP(seatData);
            }
        });

        this.node.on('game_chupai', function (data) {
            data = data.detail;
        });

        this.node.on('fold_notify', function (data) {
            var mySch = function mySch() {
                self.gameSeatsCom.hideChupai();
            };
            self.scheduleOnce(mySch, 0.8);
        });

        this.node.on('limit_login', function (data) {
            cc.vv.sspNetMgr.roomId = null;
            cc.vv.alert.show("返回大厅", "您的账号在异地登录！", function () {
                cc.vv.wc.show('正在返回游戏大厅');
                cc.director.loadScene("hall");
            }, false);
        });

        this.node.on('game_over', function (data) {
            var mySch = function mySch() {
                self.gameRoot.active = false;
                self.prepareRoot.active = true;
                var notice = self.prepareRoot.getChildByName('notice');
                var yaoqing = self.prepareRoot.getChildByName('yaoqing');
                var btnReady = self.prepareRoot.getChildByName('btnReady');
                notice.active = false;
                yaoqing.active = false;
                btnReady.active = true;
            };
            self.scheduleOnce(mySch, 2);
        });
        this.node.on('hupai', function (data) {
            var data = data.detail;
            var seats = cc.vv.sspNetMgr.seats;
            var huIndex = null;
            var huType = null;
            for (var i = 0; i < seats.length; ++i) {
                if (seats[i].userid === 0) {
                    continue;
                }
                var userData = data[i];
                if (userData && userData.type) {
                    huIndex = i;
                    huType = userData.type;
                }
            }
            if (!huIndex && huIndex !== 0) {
                huIndex = data.seatindex;
            }
            var localIndex = cc.vv.sspNetMgr.getLocalIndexByIndex(huIndex);
            var showIndex = cc.vv.sspNetMgr.getShowIndexByIndex(localIndex);
            var animation = self.node.getChildByName("Animation");

            var sex = "nan";
            if (cc.vv.userMgr.sex == 1) {
                //男
                sex = "nan";
            } else if (cc.vv.userMgr.sex == 2) {
                //女
                sex = "nv";
            }
            var voiceConversion = "PTH";
            if (cc.vv.sspNetMgr.voiceConversion == 0) {
                //福州话
                voiceConversion = "FZH";
            } else if (cc.vv.sspNetMgr.voiceConversion == 1) {
                //普通话
                voiceConversion = "PTH";
            }

            if (huType === 'daHu') {
                self.playAnimation("dahu", showIndex, "dahu");
                cc.vv.audioMgr.playSFX("sspMusic/" + voiceConversion + "/" + sex + "/dahu.mp3");
            } else if (huType === 'diHu') {
                self.playAnimation("dihu", showIndex, "dihu");
                cc.vv.audioMgr.playSFX("sspMusic/" + voiceConversion + "/" + sex + "/dihu.mp3");
            } else if (huType === 'tianHu') {
                self.playAnimation("tianhu", showIndex, "tianhu");
                cc.vv.audioMgr.playSFX("sspMusic/" + voiceConversion + "/" + sex + "/tianhu.mp3");
            } else if (huType === 'yifanHu') {
                self.playAnimation("yifanhu", showIndex, "yifanhu");
                cc.vv.audioMgr.playSFX("sspMusic/" + voiceConversion + "/" + sex + "/yifanhu.mp3");
            } else if (huType !== 'draw') {
                cc.vv.audioMgr.playSFX("nv/hu.mp3");
                //self.playEFX("hu",showIndex);
                self.playAnimation("hu", showIndex, "hupai");
            }
        });
    },
    tishi: function tishi() {
        this._tishi.active = true;
        this._tishi.getComponent(cc.Sprite).spriteFrame = this.SSPgameAtlas.getSpriteFrame("tishi1"); //等待其他玩家出牌
    },
    hidden_tishi: function hidden_tishi() {
        this._tishi.active = false;
    },
    hidden_tuoguan: function hidden_tuoguan() {
        this._tuoguan.active = false;
    },
    chupaiTishi: function chupaiTishi() {
        this._tishi.active = true;
        this._tishi.getComponent(cc.Sprite).spriteFrame = this.SSPgameAtlas.getSpriteFrame("tishi2"); //请出牌
    },
    playEFX: function playEFX(name, seatIndex) {
        this._playEFX.active = true;
        var eff = this._playEFX.getChildByName(name);
        if (seatIndex === 0) {
            eff.setPosition(0, -200);
        } else if (seatIndex === 1) {
            eff.setPosition(350, 0);
        } else if (seatIndex === 2) {
            eff.setPosition(0, 200);
        } else if (seatIndex === 3) {
            eff.setPosition(-350, 0);
        }
        eff.active = true;
        eff.getComponent(cc.Animation).play();
    },
    playAnimation: function playAnimation(name, seatIndex, playName) {
        var animation = this.node.getChildByName("Animation");
        var animate = animation.getChildByName(name);
        if (seatIndex === 0) {
            animation.setPosition(0, -200);
        } else if (seatIndex === 1) {
            animation.setPosition(350, 0);
        } else if (seatIndex === 2) {
            animation.setPosition(0, 200);
        } else if (seatIndex === 3) {
            animation.setPosition(-350, 0);
        }
        animate.active = true;
        animate.getComponent(cc.Animation).play(playName);
    },
    initDragStuffs: function initDragStuffs(node) {
        node.on(cc.Node.EventType.TOUCH_START, function (event) {
            console.log("cc.Node.EventType.TOUCH_START");
            if (!cc.vv.sspNetMgr.canTouch) {
                return;
            };
            if (cc.vv.sspNetMgr.turn != cc.vv.sspNetMgr.seatIndex) {
                return;
            }
            node.interactable = node.getComponent(cc.Button).interactable;
            if (!node.interactable) {
                return;
            }
            node.opacity = 255;
            this._chupaidrag.active = false;
            this._chupaidrag.getComponent(cc.Sprite).spriteFrame = node.getComponent(cc.Sprite).spriteFrame;
            this._chupaidrag.x = event.getLocationX() - cc.director.getVisibleSize().width / 2;
            this._chupaidrag.y = event.getLocationY() - cc.director.getVisibleSize().height / 2;
        }.bind(this));

        node.on(cc.Node.EventType.TOUCH_MOVE, function (event) {
            console.log("cc.Node.EventType.TOUCH_MOVE");
            if (cc.vv.sspNetMgr.turn != cc.vv.sspNetMgr.seatIndex) {
                return;
            }
            if (!node.interactable) {
                return;
            }
            if (Math.abs(event.getDeltaX()) + Math.abs(event.getDeltaY()) < 0.5) {
                return;
            }
            this._chupaidrag.active = true;
            node.opacity = 200;
            this._chupaidrag.opacity = 255;
            this._chupaidrag.scaleX = 1;
            this._chupaidrag.scaleY = 1;
            this._chupaidrag.x = event.getLocationX() - cc.director.getVisibleSize().width / 2;
            this._chupaidrag.y = event.getLocationY() - cc.director.getVisibleSize().height / 2;
            node.y = 0;
        }.bind(this));

        node.on(cc.Node.EventType.TOUCH_END, function (event) {
            if (cc.vv.sspNetMgr.turn != cc.vv.sspNetMgr.seatIndex) {
                return;
            }
            if (!node.interactable) {
                return;
            }
            console.log("cc.Node.EventType.TOUCH_END");
            this._chupaidrag.active = false;
            node.opacity = 255;
            if (event.getLocationY() >= 200) {
                this.shoot(node.sspId);
            }
        }.bind(this));

        node.on(cc.Node.EventType.TOUCH_CANCEL, function (event) {
            if (cc.vv.sspNetMgr.turn != cc.vv.sspNetMgr.seatIndex) {
                return;
            }
            if (!node.interactable) {
                return;
            }
            console.log("cc.Node.EventType.TOUCH_CANCEL");
            this._chupaidrag.active = false;
            node.opacity = 255;
            if (event.getLocationY() >= 200) {
                this.shoot(node.sspId);
            } else if (event.getLocationY() >= 150) {}
        }.bind(this));
    },
    onSSPClicked: function onSSPClicked(event) {
        if (cc.vv.sspNetMgr.isHuanSanZhang) {
            this.node.emit("mj_clicked", event.target);
            return;
        }

        //如果不是自己的轮子，则忽略
        if (cc.vv.sspNetMgr.turn != cc.vv.sspNetMgr.seatIndex) {
            console.log("not your turn." + cc.vv.sspNetMgr.turn);
            return;
        }

        for (var i = 0; i < this._mySSPArr.length; ++i) {
            if (event.target == this._mySSPArr[i].node) {
                //如果是再次点击，则出牌
                if (event.target == this._selectedSSP) {
                    this.shoot(this._selectedSSP.sspId);
                    this._selectedSSP.y = 0;
                    this._selectedSSP = null;
                    return;
                }
                if (this._selectedSSP != null) {
                    this._selectedSSP.y = 0;
                }
                event.target.y = 15;
                this._selectedSSP = event.target;
                return;
            }
        }
    },
    //出牌
    shoot: function shoot(pai) {
        if (pai == null) {
            return;
        }
        cc.vv.sspNet.send('chupai', pai);
    },
    onBtnSettingsClicked: function onBtnSettingsClicked() {
        cc.vv.popupMgr.showSettings();
    },

    //添加按钮事件
    addBtnHandler: function addBtnHandler(btn) {
        this.addClickEvent(btn, this.node, "sspgame", "onBtnClicked");
    },
    addClickEvent: function addClickEvent(node, target, component, handler) {
        var eventHandler = new cc.Component.EventHandler();
        eventHandler.target = target;
        eventHandler.component = component;
        eventHandler.handler = handler;

        var clickEvents = node.getComponent(cc.Button).clickEvents;
        clickEvents.push(eventHandler);
    },
    onBtnClicked: function onBtnClicked(event) {
        var gameChild = this.node.getChildByName("game");
        if (event.target.name == "btn_mianban") {
            for (var i = 0; i < this._setting.children.length; i++) {
                if (i != 1) {
                    this._setting.children[i].active = !this._setting.children[i].active;
                }
            }
        } else if (event.target.name == "New_Node") {
            for (var i = 0; i < this._setting.children.length; i++) {
                if (i != 1) {
                    this._setting.children[i].active = false;
                }
            }
        } else if (event.target.name == "btnDissolve") {
            var string = "解散房间不扣房卡，是否确定解散？";
            if (cc.vv.userMgr.control.value != 1 && cc.sys.os == cc.sys.OS_IOS) {
                //苹果隐藏
                string = "是否确定解散？";
            }
            cc.vv.alert.show("解散房间", string, function () {
                cc.vv.sspNet.send("dispress");
            }, true);
        } else if (event.target.name == "btnBack" && !gameChild.active) {
            cc.vv.alert.show("返回大厅", "返回大厅房间仍会保留，快去邀请大伙来玩吧！", function () {
                cc.vv.sspNet.send('backToHall');
                cc.vv.wc.show('正在返回游戏大厅');
                cc.director.loadScene("hall");
            }, true);
        } else if (event.target.name == "btn_settings") {
            cc.vv.popupMgr.showSettings();
        } else if (event.target.name == "public-bangzhu") {
            var wanfa = this.node.getChildByName("wanfa");
            wanfa.active = true;
        } else if (event.target.name == "btnReady") {
            console.log("onBtnReady");
            cc.vv.sspNet.send('ready');
        } else if (event.target.name == "quxiaotuoguan") {
            //取消托管
            this.hidden_tuoguan();
            cc.vv.sspNet.send("closeTuoGuan");
        }
    },
    onBtnExpression: function onBtnExpression(event) {
        //表情事件
        var _userId = cc.vv.userinfoShow._userId;
        var data = {};
        data.receiveId = _userId;
        if (event.target.name == "zhadan") {
            data.type = 0;
        } else if (event.target.name == "dangao") {
            data.type = 1;
        } else if (event.target.name == "dianzan") {
            data.type = 2;
        } else if (event.target.name == "feiwen") {
            data.type = 3;
        } else if (event.target.name == "songhua") {
            data.type = 4;
        } else if (event.target.name == "fanqie") {
            data.type = 5;
        }
        var userinfo = cc.find("Canvas/userinfo");
        userinfo.active = false;
        cc.vv.sspNet.send("expression", data);
    },
    expression: function expression(data) {
        //表情
        var self = this;
        var data = data.detail;

        for (var i = 0; i < cc.vv.sspNetMgr.seats.length; ++i) {
            if (cc.vv.sspNetMgr.seats[i].userid === data.sendId) {
                var sendIdindex = cc.vv.sspNetMgr.getLocalIndexByIndex(i); //发送人的位置
                if (this.gameRoot.active === true) {
                    //游戏已开始
                    sendIdindex = cc.vv.sspNetMgr.getShowIndexByIndex(sendIdindex);
                }
            }
            if (cc.vv.sspNetMgr.seats[i].userid === data.receiveId) {
                var receiveIdindex = cc.vv.sspNetMgr.getLocalIndexByIndex(i); //发送人的位置
                if (this.gameRoot.active === true) {
                    //游戏已开始
                    receiveIdindex = cc.vv.sspNetMgr.getShowIndexByIndex(receiveIdindex);
                }
            }
        }
        var type = data.type;

        var LiWu = cc.find("Canvas/liwu" + sendIdindex + "/liwu" + type);
        var LiWu0 = cc.find("Canvas/liwu/liwu");
        LiWu.active = true;

        var startPoint = this.setBiaoqingPosition(sendIdindex, type); //出发点
        var endPoint = this.setBiaoqingPosition(receiveIdindex, type); //结束点
        LiWu.setPosition(startPoint.Row, startPoint.Col);
        var time = 0;
        if (this.gameRoot.active === false) {
            //游戏未开始
            time = 0.5;
        } else if (this.gameRoot.active === true) {
            //游戏已开始
            if (sendIdindex === 0 && receiveIdindex === 3) {
                time = 0.2;
            } else if (sendIdindex === 3 && receiveIdindex === 0) {
                time = 0.2;
            } else {
                time = 0.5;
            }
        }
        var actionBy = cc.moveTo(time, cc.p(endPoint.Row, endPoint.Col));
        LiWu.runAction(actionBy);

        var mySch = function mySch() {
            LiWu.active = false;
            var animation = this.node.getChildByName("Animation");
            var sex = "M";
            if (cc.vv.userMgr.sex == 1) {
                //男
                sex = "M";
            } else if (cc.vv.userMgr.sex == 2) {
                //女
                sex = "F";
            }

            if (type === 0) {
                var zhadan = animation.getChildByName('zhadan' + sendIdindex);
                zhadan.active = true;
                zhadan.setPosition(endPoint.Row, endPoint.Col);
                zhadan.getComponent(cc.Animation).play('zhadan');
                cc.vv.audioMgr.playSFX("liwu/" + sex + "_zhadan.mp3");

                var aud = function aud() {
                    cc.vv.audioMgr.playSFX("liwu/zhadan.mp3");
                };
                self.scheduleOnce(aud, 1.0);
            } else if (type === 1) {
                var dangao = animation.getChildByName('dangao' + sendIdindex);
                dangao.active = true;
                dangao.setPosition(endPoint.Row, endPoint.Col);
                dangao.getComponent(cc.Animation).play('dangao');
                cc.vv.audioMgr.playSFX("liwu/" + sex + "_xianhua.mp3");

                var aud = function aud() {
                    cc.vv.audioMgr.playSFX("liwu/kiss_dangao.mp3");
                };
                self.scheduleOnce(aud, 1.0);
            } else if (type === 2) {
                var dianzan = animation.getChildByName('dianzan' + sendIdindex);
                dianzan.active = true;
                dianzan.setPosition(endPoint.Row, endPoint.Col);
                dianzan.getComponent(cc.Animation).play('dianzan');
                cc.vv.audioMgr.playSFX("liwu/" + sex + "_dianzan.mp3");

                var aud = function aud() {
                    cc.vv.audioMgr.playSFX("liwu/hua_dianzan.mp3");
                };
                self.scheduleOnce(aud, 1.0);
            } else if (type === 3) {
                var feiwen = animation.getChildByName('feiwen' + sendIdindex);
                feiwen.active = true;
                feiwen.setPosition(endPoint.Row, endPoint.Col);
                feiwen.getComponent(cc.Animation).play('feiwen');
                cc.vv.audioMgr.playSFX("liwu/" + sex + "_kiss.mp3");

                var aud = function aud() {
                    cc.vv.audioMgr.playSFX("liwu/kiss_dangao.mp3");
                };
                self.scheduleOnce(aud, 1.0);
            } else if (type === 4) {
                var songhua = animation.getChildByName('songhua' + sendIdindex);
                songhua.active = true;
                songhua.setPosition(endPoint.Row, endPoint.Col);
                songhua.getComponent(cc.Animation).play('songhua');
                cc.vv.audioMgr.playSFX("liwu/" + sex + "_xianhua.mp3");
                var aud = function aud() {
                    cc.vv.audioMgr.playSFX("liwu/hua_dianzan.mp3");
                };
                self.scheduleOnce(aud, 1.0);
            } else if (type === 5) {
                var fanqie = animation.getChildByName('fanqie' + sendIdindex);
                fanqie.active = true;
                fanqie.setPosition(endPoint.Row, endPoint.Col);
                fanqie.getComponent(cc.Animation).play('fanqie');
                cc.vv.audioMgr.playSFX("liwu/" + sex + "_fanqie.mp3");
                var aud = function aud() {
                    cc.vv.audioMgr.playSFX("liwu/fanqie.mp3");
                };
                self.scheduleOnce(aud, 1.0);
            }
        };
        this.scheduleOnce(mySch, time);
    },

    //改变表情位置
    setBiaoqingPosition: function setBiaoqingPosition(index, type) {
        var data = {};
        this.Animation.node.setPosition(0, 0);
        if (this.gameRoot.active === false) {
            //游戏未开始
            if (index === 0) {
                data.Row = -340;
                data.Col = 28;
            } else if (index === 1) {
                data.Row = -92;
                data.Col = 30;
            } else if (index === 2) {
                data.Row = 161;
                data.Col = 24;
            } else if (index === 3) {
                data.Row = 390;
                data.Col = 22;
            }
        } else if (this.gameRoot.active === true) {
            //游戏已开始
            if (index === 0) {
                data.Row = -552;
                data.Col = -119;
            } else if (index === 1) {
                data.Row = 537;
                data.Col = 50;
            } else if (index === 2) {
                data.Row = -322;
                data.Col = 217;
            } else if (index === 3) {
                data.Row = -560;
                data.Col = 30;
            }
        }
        return data;
    },

    onOptionClicked: function onOptionClicked(event) {
        var self = this;
        console.log(event.target.pai);
        var _userId = cc.vv.userinfoShow._userId;
        var data = {};
        data.receiveId = _userId;
        if (event.target.name == "btnPeng") {
            cc.vv.sspNet.send("peng", self.paiData);
        } else if (event.target.name == "btnGang") {
            cc.vv.sspNet.send("gang", self.paiData);
        } else if (event.target.name == "btnHu") {
            cc.vv.sspNet.send("hu", self.paiData);
        } else if (event.target.name == "btnChi") {
            cc.vv.sspNet.send("chi", self.paiData);
        } else if (event.target.name == "btnGuo") {
            cc.vv.sspNet.send("guo", self.paiData);
        }
    },
    mopai: function mopai(data) {
        var Mopai = function Mopai() {
            var index = cc.vv.sspNetMgr.turn;
            var seats = cc.vv.sspNetMgr.seats;
            var tempIndex = cc.vv.sspNetMgr.getLocalIndexByIndex(index);
            var arrowIndex = cc.vv.sspNetMgr.getShowIndexByIndex(tempIndex, false);
            var mopai = this.Animation.mopai[arrowIndex];
            mopai.active = true;
            mopai.getComponent(cc.Animation).play('mopai');
        };
        this.scheduleOnce(Mopai, 1.0);

        var mySch = function mySch() {
            if (cc.vv.userMgr.userId === data.userid) {
                cc.vv.sspNet.send("noticeMopai");
            }
        };
        this.scheduleOnce(mySch, 2.0);
    },

    onBtnHideWebShare: function onBtnHideWebShare() {
        cc.find("Canvas/WebShare").active = false;
    },
    ClickBtnChiEvent: function ClickBtnChiEvent(event) {
        var Data = null;
        if (event.target.name == "New Layout") {
            //隐藏吃的界面
            this.showChi(false);
            return;
        } else if (event.target.name == "leftBtn_dikuang") {
            if (this.chiData.arr[0].length === 2) {
                Data = this.chiData.arr[0];
            } else {
                Data = this.chiData.arr[1];
            }
        } else if (event.target.name == "midBtn_dikuang") {
            if (this.chiData.arr[0].length === 3) {
                Data = this.chiData.arr[0];
            } else {
                Data = this.chiData.arr[1];
            }
        } else if (event.target.name == "dikuang0") {
            Data = this.chiData.arr[0];
        } else if (event.target.name == "dikuang1") {
            Data = this.chiData.arr[1];
        } else if (event.target.name == "dikuang2") {
            Data = this.chiData.arr[2];
        } else if (event.target.name == "dikuang3") {
            Data = this.chiData.arr[3];
        } else if (event.target.name == "dikuang4") {
            Data = this.chiData.arr[4];
        }

        var data = {
            pai: this.chiData.pai,
            arr: Data
        };
        cc.vv.sspNet.send("confirmChi", data);
        console.log("ClickBtnChiEvent:");
        this.showChi(false);
    },

    //吃的节点是否显示
    showChi: function showChi(bShow) {
        var gameChild = this.node.getChildByName("game");
        gameChild.getChildByName("ChiNode").active = bShow;
    },

    onBtnCloseWanfa: function onBtnCloseWanfa() {
        var wanfa = this.node.getChildByName("wanfa");
        wanfa.active = false;
    },

    onBtnUserinfo: function onBtnUserinfo() {
        var userinfo = this.node.getChildByName('userinfo');
        userinfo.active = false;
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
        //# sourceMappingURL=sspgame.js.map
        