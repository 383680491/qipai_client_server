var numSprites = [];
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
        _sprIcon:null,
        _zhuang:null,
        _ready:null,
        _offline:null,
        _lblName:null,
        _lblScore:null,
        _scoreBg:null,
        _nddayingjia:null,
        _voicemsg:null,
        _timeChild:null,
        
        _chatBubble:null,
        _emoji:null,
        _lastChatTime:-1,
        
        _userName:"",
        _score:0,
        _dayingjia:false,
        _isOffline:false,
        _isReady:false,
        _isZhuang:false,
        _userId:null,
        _ready:null,
        _headBox:null,
        touxiangkuang:null,
        numAtlas:{
            default:null,
            type:cc.SpriteAtlas
        },
    },

    // use this for initialization
    onLoad: function () {
        this._lblName = this.node.getChildByName("lbUserName").getComponent(cc.Label);
        this._lblScore = this.node.getChildByName("score").getComponent(cc.Label);
        this.imgLoader = this.node.getChildByName("headBox").getComponent("ImageLoader");
        this.zhuang = this.node.getChildByName("zhuang");
        this.paiBeiNode = this.node.getChildByName("paiBei");
        this.liPaiNode = this.node.getChildByName("lipai");
        this._voicemsg = this.node.getChildByName("voicemsg");
        this._ready = this.node.getChildByName('ready');
        this._headBox = this.node.getChildByName('headBox');
        this.touxiangkuang = this.node.getChildByName('touxiangkuang');
        this._offline = this.node.getChildByName("offline");

        this._timeChild = this._offline.getChildByName('time');//离线闹钟
        this._shiwei = this._timeChild.getChildByName("shiwei");
        this._gewei = this._timeChild.getChildByName("gewei");

        if(this._voicemsg){
            this._voicemsg.active = false;
        }
        this._chatBubble = this.node.getChildByName("ChatBubble");
        if(this._chatBubble != null){
            this._chatBubble.active = false;            
        }
        
        this._emoji = this.node.getChildByName("emoji");
        if(this._emoji != null){
            this._emoji.active = false;
        }

        if(this.imgLoader && this.imgLoader.getComponent(cc.Button)){
            cc.vv.utils.addClickEvent(this.imgLoader,this.node,"seat","onIconClicked");    
        }

        this.paiBeiNode.active = false;
        this.liPaiNode.active = false;
        this._ready.active = false;
        this._offline.active = false;
        this._headBox.active = false;
        this.touxiangkuang.active = false;
        if(this.zhuang){
            this.zhuang.active = false;
        }
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

    onIconClicked:function(){
        var iconSprite = this.imgLoader.node.getComponent(cc.Sprite);
        if(this._userId != null && this._userId > 0){
           var seat = cc.vv.sssNetMgr.getSeatByID(this._userId);
            var sex = 0;
            if(cc.vv.baseInfoMap){
                var info = cc.vv.baseInfoMap[this._userId];
                if(info){
                    sex = info.sex;
                }                
            }
            cc.vv.userinfoShow.show(seat.name,seat.userid,iconSprite,sex,seat.ip);         
        }
    },

    //设置倒计时
    setCountdown:function(data){
        this.lixianTime = data;
        var gewei = null;
        var shiwei = null;
        var t = Math.ceil(this.lixianTime);
        if (t >= 10) {
            shiwei = Math.floor(t / 10);
            gewei = t % 10;
        }
        else{
            shiwei = 0;
            gewei = t % 10;
        }

        if(this._shiwei && this._gewei){
            var spriteS = this._shiwei.getComponent(cc.Sprite);
            var spriteG = this._gewei.getComponent(cc.Sprite);
            var spriteFrameS = this.numAtlas.getSpriteFrame(this.getNumSpriteByNum(shiwei));
            var spriteFrameG = this.numAtlas.getSpriteFrame(this.getNumSpriteByNum(gewei));
            spriteS.spriteFrame = spriteFrameS;
            spriteG.spriteFrame = spriteFrameG;
        }
    },

    getNumSpriteByNum:function(data){
        for (var i = 0; i < 10; i++) {
            if (data === i) {
                return numSprites[i];
            }
        }
    },

    setInfo:function(data){
        var name = data.name;
        if (name) {
            var len = name.length;
            if (len > 4) {
                var str = name.substring(0,4);
                this._userName = str + '...';
            }
            else {
                this._userName = name;
            }
        }
        this._lblName.string = this._userName;
        this._userId = data.userid;
        this._headBox.active = true;
        this.touxiangkuang.active = true;
        if(this.imgLoader && data.userid){
            this.imgLoader.setUserID(data.userid);
        }
    },

    setTotalScore:function(data) {
        this._lblScore.string = data;
    },

    reset:function(){
        this.paiBeiNode.active = false;
        this.liPaiNode.active = false;
        this._ready.active = false;
        this._headBox.active = false;
        this.touxiangkuang.active = false;
        this._chatBubble.active = false;
        this._chatBubble.getComponent(cc.Label).string = '';
        this._chatBubble.getChildByName("New Label").getComponent(cc.Label).string = '';
        var animation = window.sssGame.Animation;
        var fapai = animation.fapai;
        for(var i = 0 ;i < 6;i++){
            fapai[i].active = false;
        }
        if(this.zhuang){
            this.zhuang.active = false;
        }
        if(this._offline){
            this._offline.active = this._isOffline && this._userName != "";
        }
    },

    setReady:function(isReady){
        this._isReady = isReady;
        if(this._ready){
            this._ready.active = this._isReady && (cc.vv.sssNetMgr.numOfGames >= 0); 
        }
    },

    showPlayerInfo:function(isShowPaibei){
        this.paiBeiNode.active = isShowPaibei;
        this.liPaiNode.active = !isShowPaibei;
    },

    //发牌动画
    fapaiAnimation:function(index){
        var animation = window.sssGame.Animation;
        var fapai = animation.fapai[index];
        fapai.active = true;
        this.setfapaiPosition(fapai,index);
        fapai.getComponent(cc.Animation).play('fapai');
    },

    //改变发牌动画位置
    setfapaiPosition:function(eff,index){
        if (cc.vv.sssNetMgr.wanfa === 1) {
            if(index == 0){
                eff.setPosition(-50,-250);
            }
            else if(index == 1){
                eff.setPosition(450,-100);
            }
            else if(index == 2){
                eff.setPosition(100,250);
            }
            else if(index == 3){
                eff.setPosition(-450,-100);
            }
        }
        else {
            if(index == 0){
                eff.setPosition(-33,-141);                
            }
            else if(index == 5){   
                eff.setPosition(375,-141);                
            }
            else if(index == 3){
                eff.setPosition(375,190);               
            }
            else if(index == 1){
                eff.setPosition(-33,190);        
            }
            else if(index == 2){
                eff.setPosition(-487,190);             
            }
            else if(index == 4){
                eff.setPosition(-487,-141);       
            }
        }  
    },

    setOffline:function(isOffline){
        this._isOffline = isOffline;
        if(this._offline){
            this._offline.active = this._isOffline && this._userName != "";
        }
    },

    chat:function(content){
        if(this._chatBubble == null || this._emoji == null){
            return;
        }
        this._emoji.active = false;
        this._chatBubble.active = true;
        this._chatBubble.getComponent(cc.Label).string = content;
        this._chatBubble.getChildByName("New Label").getComponent(cc.Label).string = content;
        this._lastChatTime = 3;
    },
    
    emoji:function(emoji){
        if(this._emoji == null || this._emoji == null){
            return;
        }
        console.log(emoji);
        this._chatBubble.active = false;
        this._emoji.active = true;
        this._emoji.getComponent(cc.Animation).play(emoji);
        this._lastChatTime = 3;
    },
    
    voiceMsg:function(show){
        if(this._voicemsg){
            this._voicemsg.active = show;
        }
    },

    update: function (dt) {
        if(this._lastChatTime > 0){
            this._lastChatTime -= dt;
            if(this._lastChatTime < 0){
                this._chatBubble.active = false;
                this._emoji.active = false;
                this._emoji.getComponent(cc.Animation).stop();
            }
        }

        if(this.lixianTime && this.lixianTime > 0){
            this.lixianTime -= dt;
            this.setCountdown(this.lixianTime);
        }
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
