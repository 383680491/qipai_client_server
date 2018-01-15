(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/scripts/components/Status.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, 'fd3edE3qshGh6sGwORSirVf', 'Status', __filename);
// scripts/components/Status.js

'use strict';

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
        _status: null
    },

    // use this for initialization
    start: function start() {
        this._status = cc.find('Canvas/status');

        this.red = new cc.Color(205, 0, 0);
        this.green = new cc.Color(0, 205, 0);
        this.yellow = new cc.Color(255, 200, 0);
    },

    // called every frame, uncomment this function to activate update callback
    update: function update(dt) {
        var delay = this._status.getChildByName('delay');
        if (cc.vv.sssNet.delayMS != null) {
            delay.getComponent(cc.Label).string = cc.vv.sssNet.delayMS + 'ms';
            if (cc.vv.sssNet.delayMS > 800) {
                delay.color = this.red;
            } else if (cc.vv.sssNet.delayMS > 300) {
                delay.color = this.yellow;
            } else {
                delay.color = this.green;
            }
        } else if (cc.vv.sspNet.delayMS != null) {
            delay.getComponent(cc.Label).string = cc.vv.sspNet.delayMS + 'ms';
            if (cc.vv.sspNet.delayMS > 800) {
                delay.color = this.red;
            } else if (cc.vv.sspNet.delayMS > 300) {
                delay.color = this.yellow;
            } else {
                delay.color = this.green;
            }
        } else {
            delay.getComponent(cc.Label).string = 'N/A';
            delay.color = this.red;
        }

        var power = this._status.getChildByName('power');
        power.scaleX = cc.vv.anysdkMgr.getBatteryPercent();
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
        //# sourceMappingURL=Status.js.map
        