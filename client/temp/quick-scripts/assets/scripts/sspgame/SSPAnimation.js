(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/scripts/sspgame/SSPAnimation.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, '4ee93sBS8tOdoUTCaC/Koha', 'SSPAnimation', __filename);
// scripts/sspgame/SSPAnimation.js

'use strict';

cc.Class({
    extends: cc.Component,

    properties: {},

    onLoad: function onLoad() {
        window.sspAnimation = this;
        this.fapai = [];
        for (var i = 0; i < 4; i++) {
            var fapai = this.node.getChildByName('fapai' + i);
            this.fapai.push(fapai);
        }

        this.xingxing = [];
        for (var i = 0; i < 4; i++) {
            var xingxing = this.node.getChildByName('xingxing' + i);
            this.xingxing.push(xingxing);
        }

        this.mopai = [];
        var sides = ["myself", "right", "up", "left"];
        for (var i = 0; i < sides.length; ++i) {
            var sideName = sides[i];
            var mopai = cc.find("Canvas/game/" + sideName + "/mopai" + i);
            this.mopai.push(mopai);
        }

        this.zhadan = this.node.getChildByName('zhadan');
        this.dangao = this.node.getChildByName('dangao');
        this.dianzan = this.node.getChildByName('dianzan');
        this.feiwen = this.node.getChildByName('feiwen');
        this.songhua = this.node.getChildByName('songhua');
        this.fanqie = this.node.getChildByName('fanqie');
        this.heju = this.node.getChildByName('heju');
        this.tianhu = this.node.getChildByName('tianhu');
        this.hu = this.node.getChildByName('hupai');
        this.chi = this.node.getChildByName('chi');
        this.peng = this.node.getChildByName('peng');
        this.gang = this.node.getChildByName('gang');
        this.jinlong = this.node.getChildByName('jinlong');
        this.yinlong = this.node.getChildByName('yinlong');
        this.dihu = this.node.getChildByName('dihu');
        this.dahu = this.node.getChildByName('dahu');
        this.yifanhu = this.node.getChildByName('yifanhu');
        this.sanliangsheng = this.node.getChildByName('sanliangsheng');
        this.wuliangsheng = this.node.getChildByName('wuliangsheng');
        this.baliangsheng = this.node.getChildByName('baliangsheng');
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
        //# sourceMappingURL=SSPAnimation.js.map
        