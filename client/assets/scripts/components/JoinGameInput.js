cc.Class({
    extends: cc.Component,

    properties: {
        nums:{
            default:[],
            type:cc.Sprite
        },
        _inputIndex:0,
        numAtlas:{
            default:null,
            type:cc.SpriteAtlas
        },
        // foo: {
        //    default: null,
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
    },

    // use this for initialization
    onLoad: function () {
        
    },
    
    onEnable:function(){
        this.onResetClicked();
    },
    
    onInputFinished:function(roomId){
        cc.vv.userMgr.enterRoom(roomId,function(ret){
            console.log("ret:" + ret);
            if(ret.errcode == 0){
                this.node.active = false;
            }
            else{
                var content = "房间["+ roomId +"]不存在，请重新输入!";
                if(ret.errcode == 4){
                    content = "房间["+ roomId + "]已满!";
                }
                if(ret.errcode == 555){
                    content = "该房间房费aa，钻石不足";
                }
                cc.vv.alert.show("提示",content);
                this.onResetClicked();
            }
        }.bind(this)); 
    },
    
    onInput:function(num){
        if(this._inputIndex >= this.nums.length){
            return;
        }
        var spriteFrame = this.numAtlas.getSpriteFrame(num);
        this.nums[this._inputIndex].spriteFrame = spriteFrame;
        this.nums[this._inputIndex].name = num;
        this._inputIndex += 1;
        
        if(this._inputIndex == this.nums.length){
            var roomId = this.parseRoomID();
            console.log("ok:" + roomId);
            this.onInputFinished(roomId);
        }
    },
    
    onN0Clicked:function(){
        this.onInput("0");  
    },
    onN1Clicked:function(){
        this.onInput("1");  
    },
    onN2Clicked:function(){
        this.onInput("2");
    },
    onN3Clicked:function(){
        this.onInput("3");
    },
    onN4Clicked:function(){
        this.onInput("4");
    },
    onN5Clicked:function(){
        this.onInput("5");
    },
    onN6Clicked:function(){
        this.onInput("6");
    },
    onN7Clicked:function(){
        this.onInput("7");
    },
    onN8Clicked:function(){
        this.onInput("8");
    },
    onN9Clicked:function(){
        this.onInput("9");
    },
    onResetClicked:function(){
        for(var i = 0; i < this.nums.length; ++i){
            this.nums[i].spriteFrame = null;
            //this.nums[this._inputIndex].name = null;
        }
        this._inputIndex = 0;
    },
    onDelClicked:function(){
        if(this._inputIndex > 0){
            this._inputIndex -= 1;
            this.nums[this._inputIndex].spriteFrame = null;
            //this.nums[this._inputIndex].name = null;
        }
    },
    onCloseClicked:function(){
        this.node.active = false;
        cc.vv.userMgr.bObserver = false;
    },
    
    parseRoomID:function(){
        var str = "";
        for(var i = 0; i < this.nums.length; ++i){
            str += this.nums[i].name;
        }
        return str;
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
