(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/scripts/components/sssCreateRoom.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, '530a73PwDtKJZhsWot1MyJe', 'sssCreateRoom', __filename);
// scripts/components/sssCreateRoom.js

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

    createRoom: function createRoom() {
        var self = this;
        var onCreate = function onCreate(ret) {
            if (ret.errcode !== 0) {
                cc.vv.wc.hide();
                //console.log(ret.errmsg);
                if (ret.errcode == 2222) {
                    cc.vv.alert.show("提示", "钻石不足，创建房间失败!");
                } else {
                    cc.vv.alert.show("提示", "创建房间失败,错误码:" + ret.errcode);
                }
            } else {
                cc.vv.sssNetMgr.connectGameServer(ret);
                // var isConnected = cc.vv.net.isConnected();
                // if (isConnected) {
                //     cc.vv.net.isReonnect = false;
                //     cc.vv.net.close();
                //     cc.vv.emitter.on('disconnect', function(){
                //         cc.vv.sssNetMgr.connectGameServer(ret);
                //         cc.vv.net.isReonnect = true;
                //     });
                // } 
                // else {
                //     cc.vv.sssNetMgr.connectGameServer(ret);
                //     cc.vv.net.isReonnect = true;
                // }
            }
        };

        var conf = null;
        conf = this.constructSCMJConf();

        var data = {
            account: cc.vv.userMgr.account,
            sign: cc.vv.userMgr.sign,
            serverType: "SSS_SERVER_TYPE",
            conf: JSON.stringify(conf)
        };
        console.log(data);
        cc.vv.wc.show("正在创建房间");
        cc.vv.http.sendRequest("/create_private_room", data, onCreate);
    },
    constructSCMJConf: function constructSCMJConf() {
        var game_list = this.node.getChildByName("game_list");

        var difen = this.getSelectedOfRadioGroup('difenxuanze');
        var koufeixuanze = this.getSelectedOfRadioGroup('koufeixuanze');
        //霸王庄
        var wanfaxuanze = this.getSelectedOfRadioGroup('wanfaxuanze');
        //底分和局数默认为0
        difen = 0;
        var jushuxuanze = 0;
        var conf = {
            difen: difen,
            jushuxuanze: jushuxuanze,
            wanfa: wanfaxuanze,
            koufeixuanze: koufeixuanze
        };
        return conf;
    },

    onBtnCloseClicked: function onBtnCloseClicked() {
        this.node.active = false;
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
        //# sourceMappingURL=sssCreateRoom.js.map
        