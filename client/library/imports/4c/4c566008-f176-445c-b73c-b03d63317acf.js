"use strict";
cc._RF.push(module, '4c566AI8XZEXLc8sD1jMXrP', 'setType');
// scripts/sssgame/setType.js

"use strict";

var PaiType = require("define").PaiType;
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
        var children = this.node.children;
        var posX = -520;
        for (var i = 0; i < children.length; i++) {
            var node = this.node.getChildByName("type" + i);
            node.tag = i + 2;
        }
        this.preBtnTag = 0;
        this.thisBtnTag = 0;
        this.Compare = require("Compare");
    },

    //获取到百变或者普通
    getType: function getType() {
        var touchCom = this.node.parent.getComponent("touch");
        var myPaiCom = touchCom.myPai.getComponent("myPai");
        var arrPai = myPaiCom.getMyPaiData();
        var arrType = [];

        arrType = this.Compare.getType(arrPai);

        console.log('arrType: ' + arrType);
        //把牌型对应的按钮显示
        for (var i = 0; i < this.node.children.length; i++) {
            var children = this.node.getChildByName("type" + i);
            var bActive = false;
            if (arrType) {
                for (var j = 0; j < arrType.length; j++) {
                    if (children.tag === arrType[j]) {
                        bActive = true;
                        break;
                    }
                }
            }
            children.active = bActive;
        }

        //如果是特殊牌，则显示报道
        if (cc.vv.sssNetMgr.specialType > PaiType.THS) {
            var children = this.node.getChildByName("type9");
            children.active = true;
        }
    },

    onBtnClicked: function onBtnClicked(event) {
        var touchCom = this.node.parent.getComponent("touch");
        var myPaiCom = touchCom.myPai.getComponent("myPai");
        var arrPai = myPaiCom.getMyPaiData();
        cc.vv.audioMgr.playSFX("sssMusic/fangpai.mp3");

        //特殊牌处理
        if (event.target.tag > PaiType.WT) {
            var touchCom = this.node.parent.getComponent("touch");
            var shezhipaiCom = touchCom.shezhiPai.getComponent("shezhipai");
            shezhipaiCom.reset();
            cc.vv.sssNet.send('special_card');
            return;
        }

        switch (event.target.tag) {
            case PaiType.YD:
                console.log("onBtnClicked type0");
                var bSame = false;
                this.thisBtnTag = PaiType.YD;
                bSame = this.thisBtnTag === this.preBtnTag;
                if (!bSame) {
                    this.Compare.b_obtainType = true;
                }
                var Duizi = this.Compare.getDuiZi(arrPai, bSame);
                touchCom.setUp(Duizi);
                this.preBtnTag = PaiType.YD;
                break;
            case PaiType.ED:
                console.log("onBtnClicked type1");
                var bSame = false;
                this.thisBtnTag = PaiType.ED;
                bSame = this.thisBtnTag === this.preBtnTag;
                if (!bSame) {
                    this.Compare.b_obtainType = true;
                }
                var Duizi0 = this.Compare.getLiangDui(arrPai, bSame);
                var Duizi1 = this.Compare.getLiangDui(arrPai, true);
                for (var i = 0; i < Duizi0.length; i++) {
                    Duizi1.push(Duizi0[i]);
                }
                touchCom.setUp(Duizi1);
                this.preBtnTag = PaiType.ED;
                break;
            case PaiType.ST:
                console.log("onBtnClicked type2");
                var bSame = false;
                this.thisBtnTag = PaiType.ST;
                bSame = this.thisBtnTag === this.preBtnTag;
                if (!bSame) {
                    this.Compare.b_obtainType = true;
                }
                var sanTiao = this.Compare.getSanTiao(arrPai, bSame);
                touchCom.setUp(sanTiao);
                this.preBtnTag = PaiType.ST;
                break;
            case PaiType.SZ:
                console.log("onBtnClicked type3");
                var bSame = false;
                this.thisBtnTag = PaiType.SZ;
                bSame = this.thisBtnTag === this.preBtnTag;
                if (!bSame) {
                    this.Compare.b_obtainType = true;
                }
                var shunZi = this.Compare.getShunZi(arrPai, bSame, false);
                touchCom.setUp(shunZi);
                this.preBtnTag = PaiType.SZ;
                break;
            case PaiType.TH:
                console.log("onBtnClicked type4");
                var bSame = false;
                this.thisBtnTag = PaiType.TH;
                bSame = this.thisBtnTag === this.preBtnTag;
                if (!bSame) {
                    this.Compare.b_obtainType = true;
                }
                var tongHua = this.Compare.getTongHua(arrPai, bSame);
                touchCom.setUp(tongHua);

                this.preBtnTag = PaiType.TH;
                break;
            case PaiType.HL:
                console.log("onBtnClicked type5");
                var bSame = false;
                this.thisBtnTag = PaiType.HL;
                bSame = this.thisBtnTag === this.preBtnTag;
                if (!bSame) {
                    this.Compare.b_obtainType = true;
                }
                var huLu = this.Compare.getHuLu(arrPai, bSame);
                touchCom.setUp(huLu);

                this.preBtnTag = PaiType.HL;
                break;
            case PaiType.TZ:
                console.log("onBtnClicked type6");
                var bSame = false;
                this.thisBtnTag = PaiType.TZ;
                bSame = this.thisBtnTag === this.preBtnTag;
                if (!bSame) {
                    this.Compare.b_obtainType = true;
                }
                var tieZhi = this.Compare.getTieZhi(arrPai, bSame);
                touchCom.setUp(tieZhi);

                this.preBtnTag = PaiType.TZ;
                break;
            case PaiType.THS:
                console.log("onBtnClicked type7");
                var bSame = false;
                this.thisBtnTag = PaiType.THS;
                bSame = this.thisBtnTag === this.preBtnTag;
                if (!bSame) {
                    this.Compare.b_obtainType = true;
                }
                var tongHuaShun = this.Compare.getShunZi(arrPai, bSame, true);
                touchCom.setUp(tongHuaShun);

                this.preBtnTag = PaiType.THS;
                break;
            case PaiType.WT:
                console.log("onBtnClicked type8");
                var bSame = false;
                this.thisBtnTag = PaiType.WT;
                bSame = this.thisBtnTag === this.preBtnTag;
                if (!bSame) {
                    this.Compare.b_obtainType = true;
                }
                var wutong = this.Compare.getWuTong(arrPai, bSame);
                touchCom.setUp(wutong);

                this.preBtnTag = PaiType.WT;
                break;
            default:
                break;
        }
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});

cc._RF.pop();