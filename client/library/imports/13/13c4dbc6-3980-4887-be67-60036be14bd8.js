"use strict";
cc._RF.push(module, '13c4dvGOYBIh75nYANr4UvY', 'sssGameResult');
// scripts/sssgame/sssGameResult.js

"use strict";

cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //    default: null,      // The default value will be used only when the component attaching
        //                           to a node for the first time
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
    },

    // use this for initialization
    onLoad: function onLoad() {
        this._seats = [];
        for (var i = 1; i <= 6; ++i) {
            var s = "s" + i;
            var sn = this.node.getChildByName(s);
            sn.active = false;
            var viewdata = {};
            viewdata.username = sn.getChildByName('userName').getComponent(cc.Label);
            viewdata.imgLoader = sn.getChildByName("headBox").getComponent("ImageLoader");
            viewdata.ID = sn.getChildByName('ID').getComponent(cc.Label);
            viewdata.score = sn.getChildByName('score').getComponent(cc.Label);
            viewdata.win = sn.getChildByName('win').getComponent(cc.Label);
            viewdata.lose = sn.getChildByName('lose').getComponent(cc.Label);
            viewdata.pingju = sn.getChildByName('pingju').getComponent(cc.Label);

            var btnWechat = cc.find("Canvas/game_result/btn_wxfx");
            if (btnWechat) {
                if (cc.vv.userMgr.control.value == 0) {
                    btnWechat.active = false;
                }
                cc.vv.utils.addClickEvent(btnWechat, this.node, "sssGameResult", "onBtnWeichatClicked");
            }

            this._seats.push(viewdata);
        }
    },

    reset: function reset() {
        this.node.active = false;
        for (var i = 1; i <= 6; ++i) {
            var s = "s" + i;
            var sn = this.node.getChildByName(s);
            sn.active = false;
        }
    },

    showResult: function showResult(data) {
        var len = data.length;
        for (var i = 1; i <= len; ++i) {
            var s = "s" + i;
            var sn = this.node.getChildByName(s);
            sn.active = true;
        }
        for (var _i = 0; _i < data.length; _i++) {
            var name = data[_i].userName;
            var len = name.length;
            if (len > 4) {
                var str = name.substring(0, 4);
                this._seats[_i].username.string = str + '...';
            } else {
                this._seats[_i].username.string = name;
            }
            this._seats[_i].ID.string = data[_i].userId;
            if (this._seats[_i].imgLoader && data[_i].userId) {
                this._seats[_i].imgLoader.setUserID(data[_i].userId);
            }
            this._seats[_i].score.string = data[_i].score;
            this._seats[_i].win.string = data[_i].win;
            this._seats[_i].lose.string = data[_i].lose;
            this._seats[_i].pingju.string = data[_i].flat;
        }
        //删除SSS房间信息
        cc.sys.localStorage.setItem("SSS_wanfa", null);
        cc.sys.localStorage.setItem("SSS_roomId", null);
    },

    onBtnWeichatClicked: function onBtnWeichatClicked() {
        //微信分享监听
        var share = cc.find("Canvas/share");
        share.active = true;
    },
    onBtnShareCloseClicked: function onBtnShareCloseClicked() {
        var share = cc.find("Canvas/share");
        share.active = false;
    },
    onBtnShareHaoyou: function onBtnShareHaoyou() {
        var share = cc.find("Canvas/share");
        share.active = false;

        //微信浏览器----公众号登录 
        if (cc.sys.browserType == "mqqbrowser" || "wechat" == cc.sys.browserType) {
            console.log("H5分享好友");
            cc.find("Canvas/WebShare").active = true;
            cc.vv.anysdkMgr.getAccess_token('好玩的棋牌游戏');
        } else if (cc.sys.os == cc.sys.OS_ANDROID || cc.sys.os == cc.sys.OS_IOS) {
            cc.vv.anysdkMgr.shareResult('0');
        }
        //其它浏览器----二维码扫码登录 
        else {
                console.log("H5分享好友");
                cc.find("Canvas/WebShare").active = true;
                cc.vv.anysdkMgr.getAccess_token('好玩的棋牌游戏');
            }
    },
    onBtnSharePengyouquan: function onBtnSharePengyouquan() {
        var share = cc.find("Canvas/share");
        share.active = false;

        //微信浏览器----公众号登录 
        if (cc.sys.browserType == "mqqbrowser" || "wechat" == cc.sys.browserType) {
            console.log("H5分享好友");
            cc.find("Canvas/WebShare").active = true;
            cc.vv.anysdkMgr.getAccess_token('好玩的棋牌游戏');
        } else if (cc.sys.os == cc.sys.OS_ANDROID || cc.sys.os == cc.sys.OS_IOS) {
            cc.vv.anysdkMgr.shareResult('1');
        }
        //其它浏览器----二维码扫码登录 
        else {
                console.log("H5分享好友");
                cc.find("Canvas/WebShare").active = true;
                cc.vv.anysdkMgr.getAccess_token('好玩的棋牌游戏');
            }
    },

    btnClick: function btnClick(event) {
        if (event.target.name === "btn_close") {
            this.reset();
            //返回大厅
            cc.vv.sssNet.send('exit_disconnect');
        }
    }
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});

cc._RF.pop();