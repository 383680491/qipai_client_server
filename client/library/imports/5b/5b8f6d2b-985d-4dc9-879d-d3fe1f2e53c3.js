"use strict";
cc._RF.push(module, '5b8f60rmF1NyYed0/4fLlPD', 'seats');
// scripts/sssgame/seats.js

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
        this.seats = [];
        this.seatComs = [];

        for (var i = 0; i < this.node.children.length; i++) {
            var name = 'seat' + i;
            var seatNode = this.node.getChildByName(name);
            var seatCom = seatNode.getComponent('sss_seat');
            this.seats.push(seatNode);
            this.seatComs.push(seatCom);
        }
    },

    start: function start() {
        this.reset();
    },

    refreshSeats: function refreshSeats() {
        var seatData = cc.vv.sssNetMgr.seats;
        for (var i = 0; i < seatData.length; i++) {
            if (seatData[i].userid <= 0) {
                continue;
            }
            var index = cc.vv.sssNetMgr.getLocalIndex(seatData[i].seatindex);
            this.seatComs[index].setInfo(seatData[i]);
            this.seatComs[index].setReady(seatData[i].ready);
        }
    },

    resetALLSeat: function resetALLSeat() {
        var seatData = cc.vv.sssNetMgr.seats;
        for (var i = 0; i < seatData.length; i++) {
            if (seatData[i].userid <= 0) {
                var indexClear = cc.vv.sssNetMgr.getLocalIndex(seatData[i].seatindex);
                this.seatComs[indexClear].setInfo(seatData[i]);
                this.seatComs[index].setReady(false);
                continue;
            }
            var index = cc.vv.sssNetMgr.getLocalIndex(seatData[i].seatindex);
            this.seatComs[index].setInfo(seatData[i]);
            this.seatComs[index].setReady(seatData[i].ready);
        }
    },

    emptyChatBubble: function emptyChatBubble() {
        //清空聊天
        var seatData = cc.vv.sssNetMgr.seats;
        for (var i = 0; i < this.seatComs.length; i++) {
            this.seatComs[i]._chatBubble.active = false;
            this.seatComs[i]._emoji.active = false;
        }
    },

    setPlayerReady: function setPlayerReady(data) {
        var userid = data;
        var seatData = cc.vv.sssNetMgr.seats;
        for (var i = 0; i < seatData.length; i++) {
            if (seatData[i].userid === userid) {
                var index = cc.vv.sssNetMgr.getLocalIndex(seatData[i].seatindex);
                this.seatComs[index].setReady(seatData[i].ready);
            }
        }
    },

    resetReady: function resetReady() {
        var seatData = cc.vv.sssNetMgr.seats;
        for (var i = 0; i < seatData.length; i++) {
            if (seatData[i].userid <= 0) {
                continue;
            }
            this.seatComs[i].setReady(false);
        }
    },

    setAllScoreResult: function setAllScoreResult(data) {
        var len = data.length;
        for (var i = 0; i < len; i++) {
            var userId = data[i].userId;
            var seatIndex = cc.vv.sssNetMgr.getSeatIndexByID(userId);
            var index = cc.vv.sssNetMgr.getLocalIndex(seatIndex);
            if (!this.seatComs[index]) {
                return;
            }
            this.seatComs[index].setTotalScore(data[i].allScore);
        }
    },

    reset: function reset() {
        for (var i = 0; i < this.seatComs.length; i++) {
            this.seatComs[i].reset();
        }
    },

    setPlayerInfo: function setPlayerInfo(data) {
        var playerData = data;
        for (var i = 0; i < playerData.length; i++) {
            var seatIndex = cc.vv.sssNetMgr.getSeatIndexByID(playerData[i].userId);
            var index = cc.vv.sssNetMgr.getLocalIndex(seatIndex);
            if (!this.seatComs[index]) {
                return;
            }
            this.seatComs[index].showPlayerInfo(playerData[i].isChuPai);
        }
    },

    fapaiAnimate: function fapaiAnimate() {
        var seats = cc.vv.sssNetMgr.seats;
        var self = this;
        for (var i = 0; i < seats.length; i++) {
            if (seats[i].userid > 0) {
                var index = cc.vv.sssNetMgr.getLocalIndex(i);
                self.seatComs[index].fapaiAnimation(index);
            }
        }
        if (cc.vv.sssNetMgr.wanfa === 3) {
            //百变或马牌
            var animation = window.sssGame.Animation;
            var kaipai = animation.kaipai;
            var kaimapai = animation.kaimapai;
            var paiAtlas = window.sssGame.paiAtlas;
            var maPai = kaimapai.getChildByName('paibei').getChildByName('jiedian').getComponent(cc.Sprite);

            var arrType = ["hua", "tao", "xin", "fangkuai"];
            var paiName = arrType[cc.vv.sssNetMgr.maPaiData.type] + cc.vv.sssNetMgr.maPaiData.value;
            var spriteFrame = paiAtlas.getSpriteFrame(paiName);
            maPai.spriteFrame = spriteFrame;
            kaimapai.active = true;
            kaimapai.getComponent(cc.Animation).play('kaimapai');
        }
    }

});

cc._RF.pop();