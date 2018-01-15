"use strict";
cc._RF.push(module, 'f5037IUSXxNe5JLv2gclkjb', 'sspCreateRoom');
// scripts/components/sspCreateRoom.js

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
    onLoad: function onLoad() {},
    onBtnCreateClicked: function onBtnCreateClicked() {
        this.node.active = false;
        this.createRoom();
    },
    createRoom: function createRoom() {
        var self = this;
        var onCreate = function onCreate(ret) {
            if (ret.errcode !== 0) {
                cc.vv.wc.hide();
                //console.log(ret.errmsg);
                if (ret.errcode == 2222) {
                    cc.vv.alert.show("提示", "钻石不足，创建房间失败!");
                } else if (ret.errcode == 555) {
                    cc.vv.alert.show("提示", "钻石不足，创建房间失败!");
                } else {
                    cc.vv.alert.show("提示", "创建房间失败,错误码:" + ret.errcode);
                }
            } else {
                cc.vv.sspNetMgr.connectGameServer(ret);
            }
        };

        var conf = null;
        conf = this.constructSCMJConf();

        var data = {
            account: cc.vv.userMgr.account,
            sign: cc.vv.userMgr.sign,
            serverType: "SSP_SERVER_TYPE",
            conf: JSON.stringify(conf)
        };
        console.log(data);
        cc.vv.wc.show("正在创建房间");
        cc.vv.http.sendRequest("/create_private_room", data, onCreate);
    },

    constructSCMJConf: function constructSCMJConf() {
        var game_list = this.node.getChildByName("game_list");

        var difen = 0;
        var koufeixuanze = this.getSelectedOfRadioGroup('koufeixuanze');
        var wanfaxuanze = 0;
        var playerCount = 0; //玩家数量

        var jushuxuanze = 0;
        var conf = {
            difen: difen,
            jushuxuanze: jushuxuanze,
            wanfa: wanfaxuanze,
            koufeixuanze: koufeixuanze,
            playerCount: playerCount
        };
        return conf;
    },

    getSelectedOfRadioGroup: function getSelectedOfRadioGroup(groupRoot) {
        console.log(groupRoot);
        var game_list = this.node.getChildByName("game_list");
        var t = game_list.getChildByName(groupRoot);

        var arr = [];
        for (var i = 0; i < t.children.length; ++i) {
            var n = t.children[i].getComponent("RadioButton");
            if (n != null) {
                arr.push(n);
            }
        }
        var selected = 0;
        for (var i = 0; i < arr.length; ++i) {
            if (arr[i].checked) {
                selected = i;
                break;
            }
        }
        return selected;
    },


    onBtnCloseClicked: function onBtnCloseClicked() {
        this.node.active = false;
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});

cc._RF.pop();