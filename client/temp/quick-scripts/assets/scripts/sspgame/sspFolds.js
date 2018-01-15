(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/scripts/sspgame/sspFolds.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, 'eace8PdqX5NvIN2/aH3WKus', 'sspFolds', __filename);
// scripts/sspgame/sspFolds.js

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
        _folds: null,
        _anims: null
    },

    // use this for initialization
    onLoad: function onLoad() {
        if (cc.vv == null) {
            return;
        }

        this.initView();
        this.initEventHandler();
        this.initAllFolds();
    },

    initView: function initView() {
        this._folds = {};
        var game = this.node.getChildByName("game");
        var sides = ["myself", "right", "up", "left"];
        for (var i = 0; i < sides.length; ++i) {
            var sideName = sides[i];
            var sideRoot = game.getChildByName(sideName);
            var folds = [];
            var foldRoot = sideRoot.getChildByName("folds");
            for (var j = 0; j < foldRoot.children.length; ++j) {
                var n = foldRoot.children[j];
                n.active = false;
                var sprite = n.getComponent(cc.Sprite);
                if (j != foldRoot.children.length - 1) {
                    sprite.spriteFrame = null;
                } else {
                    sprite.node.active = true;
                    var moveUp = cc.moveBy(1, cc.p(0, 10));
                    var moveDown = cc.moveBy(1, cc.p(0, -10));
                    var seq = cc.sequence(moveUp, moveDown);
                    sprite.node.runAction(cc.repeatForever(seq));
                }
                folds.push(sprite);
            }
            this._folds[sideName] = folds;
        }

        this.hideAllFolds();
        var prompts = ["promptM", "promptR", "promptU", "promptL"];
        for (var j = 0; j < 4; j++) {
            var promptName = prompts[j];
            var n = cc.find("Canvas/game/" + promptName);
            n.active = false;
            var sprite = n.getComponent(cc.Sprite);
            sprite.node.active = true;
            var moveUp = cc.moveBy(1, cc.p(0, 10));
            var moveDown = cc.moveBy(1, cc.p(0, -10));
            var seq = cc.sequence(moveUp, moveDown);
            sprite.node.runAction(cc.repeatForever(seq));

            if (j == 0) {
                this.promptM = sprite;
            } else if (j == 1) {
                this.promptR = sprite;
            } else if (j == 2) {
                this.promptU = sprite;
            } else if (j == 3) {
                this.promptL = sprite;
            }
        }
    },

    hideAllFolds: function hideAllFolds() {
        for (var k in this._folds) {
            var f = this._folds[i];
            for (var i in f) {
                f[i].node.active = false;
            }
        }
    },

    initEventHandler: function initEventHandler() {
        var self = this;
        this.node.on('game_begin', function (data) {
            self.reset();
            self.initAllFolds();
        });

        this.node.on('game_sync', function (data) {
            self.initAllFolds();
        });

        this.node.on('game_chupai_notify', function (data) {
            self.initFolds(data.detail);
        });

        this.node.on('fold_notify', function (data) {
            self.initFolds(data.detail);
        });
    },

    initAllFolds: function initAllFolds() {
        var seats = cc.vv.sspNetMgr.seats;
        for (var i in seats) {
            this.initFolds(seats[i]);
        }
    },

    reset: function reset() {
        var sides = ["myself", "right", "up", "left"];
        for (var i = 0; i < sides.length; ++i) {
            var sideName = sides[i];
            var game = this.node.getChildByName("game");
            var sideRoot = game.getChildByName(sideName);
            var foldRoot = sideRoot.getChildByName("folds");
            for (var j = 0; j < foldRoot.childrenCount; j++) {
                var n = foldRoot.children[j];
                n.active = false;
            }
        }
    },

    initFolds: function initFolds(seatData) {
        var folds = seatData.folds;
        if (folds == null) {
            return;
        }

        var sides = ["myself", "right", "up", "left"];
        for (var i = 0; i < sides.length; ++i) {
            var sideName = sides[i];
            var game = this.node.getChildByName("game");
            var sideRoot = game.getChildByName(sideName);
            var foldRoot = sideRoot.getChildByName("folds");
            var n = foldRoot.getChildByName("prompt");
            n.active = false;
        }

        var prompts = ["promptM", "promptR", "promptU", "promptL"];
        for (var j = 0; j < 4; j++) {
            var promptName = prompts[j];
            cc.find("Canvas/game/" + promptName).active = false;
        }

        var tempIndex = cc.vv.sspNetMgr.getLocalIndexByIndex(seatData.seatindex);
        var localIndex = cc.vv.sspNetMgr.getShowIndexByIndex(tempIndex);
        var pre = cc.vv.SSPMgr.getFoldPre(localIndex);
        var side = cc.vv.SSPMgr.getSide(localIndex);

        var foldsSprites = this._folds[side];
        for (var i = 0; i < foldsSprites.length - 1; ++i) {
            var index = i;
            if (side == "right") {
                index = foldsSprites.length - i - 2;
            }
            var sprite = foldsSprites[index];
            sprite.node.active = true;
            if (!folds[i]) {
                continue;
            }
            this.setSpriteFrameByPai(pre, sprite, folds[i]);
        }

        if (folds.length > 0) {
            var index = folds.length - 1;
            if (side == "right") {
                index = foldsSprites.length - folds.length - 1;
            }
            var lastSprite = foldsSprites[index];
            var prompt = foldsSprites[foldsSprites.length - 1];
            prompt.node.active = true;
            var x = lastSprite.node.x;
            if (side === 'right' || side === 'left') {
                var y = lastSprite.node.y;
            } else {
                var y = lastSprite.node.y;
            }
            prompt.node.setPosition(x, y);
        }

        for (var i = folds.length; i < foldsSprites.length - 1; ++i) {
            var index = i;
            if (side == "right") {
                index = foldsSprites.length - i - 2;
            }
            var sprite = foldsSprites[index];

            sprite.spriteFrame = null;
            sprite.node.active = false;
        }
    },

    setSpriteFrameByPai: function setSpriteFrameByPai(pre, sprite, pai) {
        sprite.spriteFrame = cc.vv.SSPMgr.getSpriteFrameByPai(pre, pai);
        sprite.node.active = true;
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
        //# sourceMappingURL=sspFolds.js.map
        