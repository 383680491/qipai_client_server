"use strict";
cc._RF.push(module, '7f553G0boRH6KrTE7wACaXx', 'ReConnect');
// scripts/components/ReConnect.js

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
        _reconnect: null,
        _lblTip: null,
        _loading_image: null,
        _lastPing: 0
    },

    // use this for initialization
    onLoad: function onLoad() {
        this._reconnect = cc.find("Canvas/reconnect");
        this._loading_image = this._reconnect.getChildByName("loading_image");
        var self = this;

        var fnTestServerOn = function fnTestServerOn() {
            var netObjs = {
                SSS_SERVER_TYPE: cc.vv.sssNet,
                SSP_SERVER_TYPE: cc.vv.sspNet
            };
            var netMgrObjs = {
                SSS_SERVER_TYPE: cc.vv.sssNetMgr,
                SSP_SERVER_TYPE: cc.vv.sspNetMgr
            };
            var gameType = cc.vv.userMgr.serverType;
            var net = netObjs[gameType];
            var netMgr = netMgrObjs[gameType];

            net.test(function (ret) {
                if (ret) {
                    var roomId = netMgr.roomId;
                    if (roomId != null) {
                        cc.vv.userMgr.oldRoomId = null;
                        cc.vv.userMgr.enterRoom(roomId, function (ret) {
                            if (ret.errcode != 0) {
                                netMgr.roomId = null;
                                cc.vv.emitter.emit('remove_handler');
                                cc.director.loadScene('hall');
                            }
                        });
                    }
                } else {
                    setTimeout(fnTestServerOn, 3000);
                }
            });
        };

        var fn = function fn(data) {
            self.node.off('disconnect', fn);
            self._reconnect.active = true;

            fnTestServerOn();
        };

        var loginFinished = function loginFinished(data) {
            if (self._reconnect) {
                self._reconnect.active = false;
                self.node.on('disconnect', fn);
            }
        };

        var removeHandler = function removeHandler(data) {
            cc.vv.emitter.off('login_finished');
            cc.vv.emitter.off('remove_handler');
            cc.vv.emitter.off('disconnect');
        };

        this.node.on('login_finished', function () {
            //没有进来
            self._reconnect.active = false;
            self.node.on('disconnect', fn);
        });
        this.node.on('disconnect', fn);

        var gameType = cc.vv.userMgr.serverType;
        if ('SSS_SERVER_TYPE' === gameType) {
            cc.vv.emitter.on('login_finished', loginFinished);
            cc.vv.emitter.on('remove_handler', removeHandler);
            cc.vv.emitter.on('disconnect', fn);
        }
    },

    // called every frame, uncomment this function to activate update callback
    update: function update(dt) {
        if (this._reconnect.active) {
            this._loading_image.rotation = this._loading_image.rotation - dt * 45;
        }
    }
});

cc._RF.pop();