(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/scripts/sssgame/pai.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, 'acbeb0sdABJ1KApsBY5sNGe', 'pai', __filename);
// scripts/sssgame/pai.js

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
    },

    // use this for initialization
    onLoad: function onLoad() {
        this.paiDt = this.paiDt || { type: 1, value: 1, isBB: false };
        this.bSetInfo = false;
    },
    setInfo: function setInfo(data) {
        console.log("data:" + data);
        if (typeof data == 'undefined') {
            console.log('setInfo data is undefined');
            return;
        }
        this.paiDt = this.paiDt || { type: 1, value: 1, isBB: false };
        var paiAtlas = window.sssGame.paiAtlas;
        var arrType = ["hua", "tao", "xin", "fangkuai"];
        this.paiDt.type = data.type;
        this.paiDt.value = data.value;
        this.paiDt.isBB = data.isBB;
        var sprite = this.node.getComponent(cc.Sprite);
        var paiName = arrType[data.type] + data.value;
        var spriteFrame = paiAtlas.getSpriteFrame(paiName);
        sprite.spriteFrame = spriteFrame;
        this.bSetInfo = true;
    },

    setNullInfo: function setNullInfo() {
        this.paiDt = { type: 1, value: 1, isBB: false };
        var sprite = this.node.getComponent(cc.Sprite);
        sprite.spriteFrame = null;
        this.bSetInfo = false;
    },

    getData: function getData() {
        return this.paiDt;
    },

    getIsSetInfo: function getIsSetInfo() {
        return this.bSetInfo;
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
        //# sourceMappingURL=pai.js.map
        