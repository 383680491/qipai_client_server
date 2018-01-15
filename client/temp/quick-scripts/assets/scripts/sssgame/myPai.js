(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/scripts/sssgame/myPai.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, '46e5aHbujpCJq2NR6cOpVvh', 'myPai', __filename);
// scripts/sssgame/myPai.js

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
        baiBianPaiAtlas: {
            default: null,
            type: cc.SpriteAtlas
        }
    },

    // use this for initialization
    onLoad: function onLoad() {},
    initDt: function initDt() {
        this.arrPai = [];
        for (var i = 1; i <= 13; i++) {
            var name = 'pai' + i;
            var paiNode = this.node.getChildByName(name);
            this.arrPai.push(paiNode);
        };
    },
    setInfo: function setInfo() {
        console.log('myPai.setInfo');
        if (!cc.vv.sssNetMgr.seats) {
            return;
        }
        var index = cc.vv.sssNetMgr.seatIndex;
        var data = cc.vv.sssNetMgr.seats[index].holds;
        if (data.length < 1) {
            return false;
        }
        var len = this.arrPai.length;

        console.log('data.len: ' + data.length);
        this.sortPai(data);
        this.myPaiData = [];
        for (var i = 0; i < len; i++) {
            var paiCom = this.arrPai[i].getComponent('pai');
            console.log('data' + i + ': ' + data[i]);
            paiCom.setInfo(data[i]);
            this.myPaiData.push(data[i]);
            this.arrPai[i].active = true;
        }
        console.log('myPai.setInfo over');
        return true;
    },

    getMyPaiData: function getMyPaiData() {
        return this.myPaiData;
    },

    setMyPaiData: function setMyPaiData(arrPaiData) {
        this.myPaiData = [];
        for (var i = 0; i < arrPaiData.length; i++) {
            this.myPaiData.push(arrPaiData[i]);
        }
    },

    sortPai: function sortPai(arrPai) {
        if (arrPai) {
            arrPai.sort(function (a, b) {
                return b.value - a.value;
            });
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
        //# sourceMappingURL=myPai.js.map
        