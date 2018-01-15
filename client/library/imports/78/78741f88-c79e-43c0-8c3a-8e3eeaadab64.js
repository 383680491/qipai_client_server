"use strict";
cc._RF.push(module, '78741+Ix55DwIw6jj7qratk', 'SSPReplayCtrl');
// scripts/sspgame/SSPReplayCtrl.js

"use strict";

cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //    default: null,
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
        _nextPlayTime: 1,
        _replay: null
        //_SSPisPlaying:true,
    },

    // use this for initialization
    onLoad: function onLoad() {
        if (cc.vv == null) {
            return;
        }

        this._replay = cc.find("Canvas/replay");
        this._replay.active = cc.vv.replayMgr.isReplay();
        this._SSPisPlaying = true;

        var btn_pause = cc.find("Canvas/replay/btn_pause");
        if (btn_pause) {
            cc.vv.utils.addClickEvent(btn_pause, this.node, "SSPReplayCtrl", "onBtnPauseClicked");
        }
        var btn_play = cc.find("Canvas/replay/btn_play");
        if (btn_play) {
            cc.vv.utils.addClickEvent(btn_play, this.node, "SSPReplayCtrl", "onBtnPlayClicked");
        }
        var btn_back = cc.find("Canvas/replay/btn_back");
        if (btn_back) {
            cc.vv.utils.addClickEvent(btn_back, this.node, "SSPReplayCtrl", "onBtnBackClicked");
        }
    },

    onBtnPauseClicked: function onBtnPauseClicked() {
        this._SSPisPlaying = false;
    },

    onBtnPlayClicked: function onBtnPlayClicked() {
        this._SSPisPlaying = true;
    },

    onBtnBackClicked: function onBtnBackClicked() {
        cc.vv.replayMgr.clear();
        cc.vv.sspNetMgr.reset();
        cc.vv.sssNetMgr.roomId = null;
        cc.vv.sspNetMgr.roomId = null;
        cc.vv.wc.show('正在返回游戏大厅');
        cc.director.loadScene("hall");
    },

    // called every frame, uncomment this function to activate update callback
    update: function update(dt) {
        if (cc.vv) {
            if (this._SSPisPlaying && cc.vv.replayMgr.isReplay() == true && this._nextPlayTime > 0) {
                this._nextPlayTime -= dt;
                if (this._nextPlayTime < 0) {
                    this._nextPlayTime = cc.vv.replayMgr.SSPtakeAction();
                }
            }
        }
    }
});

cc._RF.pop();