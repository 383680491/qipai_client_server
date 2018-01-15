var numSprites = [];
cc.Class({
    extends: cc.Component,

    properties: {
        _arrow:null,
        _pointer:null,
        //_timeLabel:null,
        //_time:null,
        _alertTime:-1,
        _timeChild:null,
        _gewei:null,
        _shiwei:null,
        _atlas:null,
        _guang:null,
        _curTurn:null,
        _countTime:null,
        numAtlas:{
            default:null,
            type:cc.SpriteAtlas
        },

    },

    // use this for initialization
    onLoad: function () {
        var gameChild = this.node.getChildByName("game");
        this._arrow = gameChild.getChildByName("arrow");
        this._timeChild = gameChild.getChildByName("time");
        this._shiwei = this._timeChild.getChildByName("shiwei");
        this._gewei = this._timeChild.getChildByName("gewei");
        this.initPointer();
        
        var self = this;
        
        this.node.on('game_begin',function(data){
            self.initPointer();
        });

        this.node.on('out_card_lastTime',function(data){
            var data = data.detail;
            data = data/1000;
            var gewei = null;
            var shiwei = null;
            var t = Math.ceil(data);
            if (t >= 10) {
                shiwei = Math.floor(t / 10);
                gewei = t % 10;
            }
            else{
                shiwei = 0;
                gewei = t % 10;
            }
            var spriteS = self._shiwei.getComponent(cc.Sprite);
            var spriteG = self._gewei.getComponent(cc.Sprite);
            var spriteFrameS = self.numAtlas.getSpriteFrame(self.getNumSpriteByNum(shiwei));
            var spriteFrameG = self.numAtlas.getSpriteFrame(self.getNumSpriteByNum(gewei));
            spriteS.spriteFrame = spriteFrameS;
            spriteG.spriteFrame = spriteFrameG;
        });

        console.log("timePoint");
        numSprites.push("mjks-0");
        numSprites.push("mjks-1");
        numSprites.push("mjks-2");
        numSprites.push("mjks-3");
        numSprites.push("mjks-4");
        numSprites.push("mjks-5");
        numSprites.push("mjks-6");
        numSprites.push("mjks-7");
        numSprites.push("mjks-8");
        numSprites.push("mjks-9");
    }, 
    
    initPointer:function(){
        if(cc.vv == null){
            return;
        }
        if (cc.vv.sspNetMgr.gamestate == "playing" || cc.vv.sspNetMgr.gamestate == "begin") {
            this._arrow.active = true;
            this._timeChild.active = true;
        }
        var turn = cc.vv.sspNetMgr.button;
        var tempIndex = cc.vv.sspNetMgr.getLocalIndexByIndex(turn);
        var arrowIndex = cc.vv.sspNetMgr.getShowIndexByIndex(tempIndex,false);
        if (arrowIndex == 0) {
            this._arrow.rotation = 0;
        }
        else if (arrowIndex == 1) {
            this._arrow.rotation = 270;

        }
        else if (arrowIndex == 2) {
            this._arrow.rotation = 180;

        }
        else if (arrowIndex == 3) {
            this._arrow.rotation = 90;

        }
        if(!this._arrow.active){
            return;
        }
        var nowTurn = cc.vv.sspNetMgr.turn;
        if (nowTurn === -1) {
            nowTurn = 0;
        }
    },
    
    setMJCountdown:function(data) {
        
    },
    
    update: function (dt) {
        var turn = cc.vv.sspNetMgr.turn;
        if (turn === -1) {
            turn = 0;
        }
        var tempIndex = cc.vv.sspNetMgr.getLocalIndexByIndex(turn);
        var arrowIndex = cc.vv.sspNetMgr.getShowIndexByIndex(tempIndex,false);

        var mySch =function(){ 
            if (arrowIndex == 0) {
                this._arrow.rotation = 0;
            }
            else if (arrowIndex == 1) {
                this._arrow.rotation = 270;

            }
            else if (arrowIndex == 2) {
                this._arrow.rotation = 180;

            }
            else if (arrowIndex == 3) {
                this._arrow.rotation = 90;

            }
        }
        this.scheduleOnce(mySch,1.0);

        if(!this._arrow.active){
            return;
        }
    },

    getNumSpriteByNum:function(data){
        for (var i = 0; i < 10; i++) {
            if (data === i) {
                return numSprites[i];
                break;
            }
        }
    },

});
