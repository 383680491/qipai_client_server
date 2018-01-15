"use strict";
cc._RF.push(module, '350d3Ry9aVIqJR27fP2H/z1', 'LoadingLogic');
// scripts/components/LoadingLogic.js

"use strict";

cc.Class({
    extends: cc.Component,

    properties: {
        tipLabel: cc.Label,
        _stateStr: '',
        _progress: 0.0,
        _splash: null,
        _isLoading: false
    },

    // use this for initialization
    onLoad: function onLoad() {
        if (!cc.sys.isNative && cc.sys.isMobile) {
            var cvs = this.node.getComponent(cc.Canvas);
            cvs.fitHeight = true;
            cvs.fitWidth = true;
        }
        this.tipLabel.string = this._stateStr;
        this.startPreloading();
    },

    startPreloading: function startPreloading() {
        this._stateStr = "正在加载资源，请稍候";
        this._isLoading = true;
        var self = this;

        cc.loader.onProgress = function (completedCount, totalCount, item) {
            //console.log("completedCount:" + completedCount + ",totalCount:" + totalCount );
            if (self._isLoading) {
                self._progress = completedCount / totalCount;
            }
        };
        cc.loader.loadResDir("textures", function (err, assets) {
            self.onLoadComplete();
        });
    },

    onLoadComplete: function onLoadComplete() {
        this._isLoading = false;
        this._stateStr = "准备登陆";
        cc.director.loadScene("login");
        cc.loader.onComplete = null;
    },

    // called every frame, uncomment this function to activate update callback
    update: function update(dt) {
        if (this._stateStr.length == 0) {
            return;
        }
        this.tipLabel.string = this._stateStr + ' ';
        if (this._isLoading) {
            this.tipLabel.string += Math.floor(this._progress * 100) + "%";
        } else {
            var t = Math.floor(Date.now() / 1000) % 4;
            for (var i = 0; i < t; ++i) {
                this.tipLabel.string += '.';
            }
        }
    }
});

cc._RF.pop();