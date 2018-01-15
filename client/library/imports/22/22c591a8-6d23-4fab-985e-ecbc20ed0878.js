"use strict";
cc._RF.push(module, '22c59GobSNPq5he7Lwg7Qh4', 'shezhipai');
// scripts/sssgame/shezhipai.js

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
        tdNode: {
            type: cc.Node,
            default: null
        },
        zdNode: {
            type: cc.Node,
            default: null
        },
        wdNode: {
            type: cc.Node,
            default: null
        }
    },

    // use this for initialization
    onLoad: function onLoad() {
        this.emitter = cc.vv.emitter;
        this.paiObjs = {};
        this.tdPai = [];
        this.zdPai = [];
        this.wdPai = [];
        for (var i = 1; i <= 3; i++) {
            var name = 'paiNode' + i;
            var paiNode = this.tdNode.getChildByName(name);
            var pai = paiNode.getChildByName('pai');
            this.tdPai.push(pai);
        }
        for (var i = 1; i <= 5; i++) {
            var name = 'paiNode' + i;
            var paiNode = this.zdNode.getChildByName(name);
            var pai = paiNode.getChildByName('pai');
            this.zdPai.push(pai);
        }
        for (var i = 1; i <= 5; i++) {
            var name = 'paiNode' + i;
            var paiNode = this.wdNode.getChildByName(name);
            var pai = paiNode.getChildByName('pai');
            this.wdPai.push(pai);
        }

        this.Compare = require("Compare");
    },

    reset: function reset() {
        this.node.parent.active = false;
        if (this.wdPai) {
            for (var i = 0; i < this.wdPai.length; i++) {
                var com = this.wdPai[i].getComponent('pai');
                com.setNullInfo();
            }
        }
        if (this.tdPai) {
            for (var _i = 0; _i < this.tdPai.length; _i++) {
                var com = this.tdPai[_i].getComponent('pai');
                com.setNullInfo();
            }
        }
        if (this.zdPai) {
            for (var _i2 = 0; _i2 < this.zdPai.length; _i2++) {
                var com = this.zdPai[_i2].getComponent('pai');
                com.setNullInfo();
            }
        }
        this.hildBtn();
    },

    onBtnOk: function onBtnOk() {
        var data = [];
        var tdArr = [];
        var zdArr = [];
        var wdArr = [];
        for (var i = 0; i < this.tdPai.length; i++) {
            var paiCom = this.tdPai[i].getComponent('pai');
            if (paiCom.getIsSetInfo()) {
                var paiDt = {};
                paiDt.type = paiCom.paiDt.type;
                paiDt.value = paiCom.paiDt.value;
                tdArr.push(paiDt);
            }
        }
        for (var i = 0; i < this.zdPai.length; i++) {
            var paiCom = this.zdPai[i].getComponent('pai');
            if (paiCom.getIsSetInfo()) {
                var paiDt = {};
                paiDt.type = paiCom.paiDt.type;
                paiDt.value = paiCom.paiDt.value;
                zdArr.push(paiDt);
            }
        }
        for (var i = 0; i < this.wdPai.length; i++) {
            var paiCom = this.wdPai[i].getComponent('pai');
            if (paiCom.getIsSetInfo()) {
                var paiDt = {};
                paiDt.type = paiCom.paiDt.type;
                paiDt.value = paiCom.paiDt.value;
                wdArr.push(paiDt);
            }
        }
        if (wdArr.length < 5 || zdArr.length < 5 || tdArr.length < 3) {
            //不可以出牌
            console.log("手牌需要满足13张");
            return;
        }
        //获取牌型
        var arrTDType = this.Compare.getType(tdArr);
        var arrZDType = this.Compare.getType(zdArr);
        var arrWDType = this.Compare.getType(wdArr);

        if (arrTDType[0] > arrZDType[0] || arrZDType[0] > arrWDType[0]) {
            //不可以出牌
            console.log("必须要头道xiao于中道xiao于尾道");
            return;
        }

        //倒水
        if (arrTDType[0] == arrZDType[0]) {
            if (arrTDType[0] == 1) {
                //乌龙单独处理
                var tdMax = this.MaxNum(tdArr);
                var zdMax = this.MaxNum(zdArr);
                if (tdMax.value > zdMax.value) {
                    return;
                }
            }
            var result = this.Compare.compareSameType(tdArr, zdArr, arrTDType[0]);
            if (result > 0) {
                return;
            }
        }
        if (arrZDType[0] == arrWDType[0]) {
            var result = this.Compare.compareSameType(zdArr, wdArr, arrZDType[0]);
            if (result > 0) {
                return;
            }
        }

        data.push(tdArr);
        data.push(zdArr);
        data.push(wdArr);
        cc.vv.sssNet.send('compare', data);

        this.reset();
    },

    MaxNum: function MaxNum(arrPai) {
        var max = arrPai[0];
        for (var i = 1; i < arrPai.length; i++) {
            if (arrPai[i] > max) {
                max = arrPai[i];
            }
        }
        return max;
    },

    onBtnAllCancel: function onBtnAllCancel() {
        this.onBtnCancelTD();
        this.onBtnCancelZD();
        this.onBtnCancelWD();
    },

    onBtnCancelTD: function onBtnCancelTD() {
        cc.vv.audioMgr.playSFX("sssMusic/fangpai.mp3");
        var touchCom = this.node.parent.getComponent("touch");
        touchCom.cancelTD();
        this.hildBtn();
    },

    onBtnCancelZD: function onBtnCancelZD() {
        cc.vv.audioMgr.playSFX("sssMusic/fangpai.mp3");
        var touchCom = this.node.parent.getComponent("touch");
        touchCom.cancelZD();
        this.hildBtn();
    },

    onBtnCancelWD: function onBtnCancelWD() {
        cc.vv.audioMgr.playSFX("sssMusic/fangpai.mp3");
        var touchCom = this.node.parent.getComponent("touch");
        touchCom.cancelWD();
        this.hildBtn();
    },

    //快速摆牌
    onBtnQuickSwing: function onBtnQuickSwing() {
        cc.vv.sssNet.send('quick_swing_request');
    },

    hildBtn: function hildBtn() {
        var btnCancel = this.node.getChildByName("btn_Cancel");
        var btnOk = this.node.getChildByName("btn_Ok");
        btnCancel.active = false;
        btnOk.active = false;
    },

    //同类型比较大小
    compareSameType: function compareSameType(arrPai1, arrPai2, type) {
        if (type === 6) {
            //同花单独处理
            for (var _i3 = 0; _i3 < arrPai1.length; _i3++) {
                if (arrPai1[_i3].value > arrPai2[_i3].value) {
                    return 1;
                } else if (arrPai1[_i3].value < arrPai2[_i3].value) {
                    return -1;
                }
            }
            return 0;
        }
        var analyseData1 = this.analysePai(arrPai1);
        var analyseData2 = this.analysePai(arrPai2);
        var tpInfo1 = analyseData1.tongPai;
        var tpInfo2 = analyseData2.tongPai;
        tpInfo1.sort(function (a, b) {
            return b.count - a.count;
        });
        tpInfo2.sort(function (a, b) {
            return b.count - a.count;
        });
        var sanPai1 = analyseData1.sanPai;
        var sanPai2 = analyseData2.sanPai;
        var resultValue = 0;
        var tpLen1 = tpInfo1.length;
        var tpLen2 = tpInfo2.length;
        if (tpLen1 === tpLen2) {
            for (var i = 0; i < tpLen1; i++) {
                resultValue = this.comparDX(tpInfo1[i].value, tpInfo2[i].value);
                if (0 !== resultValue) {
                    return resultValue;
                }
            }
        }

        var spLen1 = sanPai1.length;
        var spLen2 = sanPai2.length;
        if (spLen1 === spLen2) {
            for (var i = 0; i < spLen1; i++) {
                resultValue = this.comparDX(sanPai1[i].value, sanPai2[i].value);
                if (0 !== resultValue) {
                    return resultValue;
                }
            }
        }
        return 0;
    },

    analysePai: function analysePai(arrPai) {
        var len = arrPai.length;
        var data = {};
        data.sanPai = [];
        data.tongPai = [];
        //同牌信息统计
        var index = 0;
        var count = 1;
        for (var i = 0; i < len; ++i) {
            if (i >= len - 1) {
                if (count > 1) {
                    var tongPaiTmp = {};
                    tongPaiTmp.value = arrPai[index].value;
                    tongPaiTmp.count = count;
                    data.tongPai.push(tongPaiTmp);
                }
                break;
            }
            if (arrPai[index].value === arrPai[i + 1].value) {
                ++count;
            } else {
                if (count > 1) {
                    var tongPaiTmp = {};
                    tongPaiTmp.value = arrPai[index].value;
                    tongPaiTmp.count = count;
                    data.tongPai.push(tongPaiTmp);
                }
                index = i + 1;
                count = 1;
            }
        }
        //散牌
        for (var i = 0; i < len; ++i) {
            var tLen = data.tongPai.length;
            var bTongPai = false;
            for (var j = 0; j < tLen; ++j) {
                if (arrPai[i].value === data.tongPai[j].value) {
                    bTongPai = true;
                    break;
                }
            }
            if (!bTongPai) {
                data.sanPai.push(arrPai[i]);
            }
        }
        return data;
    },

    comparDX: function comparDX(value1, value2) {
        if (value1 > value2) {
            return 1;
        } else if (value1 === value2) {
            return 0;
        } else {
            return -1;
        }
    }
});

cc._RF.pop();