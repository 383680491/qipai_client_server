(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/scripts/sssgame/Animation.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, '12748lZn19A8IPO+1gEQQUe', 'Animation', __filename);
// scripts/sssgame/Animation.js

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
        window.sssAnimation = this;
        this.fapai = [];
        for (var i = 0; i < 6; i++) {
            var fapai = this.node.getChildByName('fapai' + i);
            this.fapai.push(fapai);
        }
        this.daqiang = this.node.getChildByName('daqiang');
        this.dankeng = this.node.getChildByName('dankeng');
        this.wutong = this.node.getChildByName('wutong');
        this.long = this.node.getChildByName('long');
        this.liuduiban = this.node.getChildByName('liuduiban');
        this.santonghuashun = this.node.getChildByName('santonghuashun');
        this.sanfentianxia = this.node.getChildByName('sanfentianxia');
        this.zzlong = this.node.getChildByName('zzlong');
        this.cuoyise = this.node.getChildByName('cuoyise');
        this.quanleida = this.node.getChildByName('quanleida');
        this.quanxiao = this.node.getChildByName('quanxiao');
        this.quanda = this.node.getChildByName('quanda');
        this.tezhi = this.node.getChildByName('tezhi');
        this.sitaosantiao = this.node.getChildByName('sitaosantiao');
        this.kaishi = this.node.getChildByName('kaishi');
        this.sanshunzi = this.node.getChildByName('sanshunzi');
        this.tonghuashun = this.node.getChildByName('tonghuashun');
        this.santonghua = this.node.getChildByName('santonghua');
        this.paiguangS = this.node.getChildByName('paiguangS');
        this.paiguangM = this.node.getChildByName('paiguangM');
        this.paiguangL = this.node.getChildByName('paiguangL');
        this.kaipai = this.node.getChildByName('kaipai');
        this.kaimapai = this.node.getChildByName('kaimapai');

        this.zhadan = this.node.getChildByName('zhadan');
        this.dangao = this.node.getChildByName('dangao');
        this.dianzan = this.node.getChildByName('dianzan');
        this.feiwen = this.node.getChildByName('feiwen');
        this.songhua = this.node.getChildByName('songhua');
        this.fanqie = this.node.getChildByName('fanqie');
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
        //# sourceMappingURL=Animation.js.map
        