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
    onLoad: function () {
        this._seats = [];
        for(var i = 1; i <= 6; ++i){
            var s = "s" + i;
            var sn = this.node.getChildByName(s);
            sn.active = false;
            var viewdata = {};
            viewdata.username = sn.getChildByName('userName').getComponent(cc.Label);
            viewdata.imgLoader = sn.getChildByName("headBox").getComponent("ImageLoader");
            viewdata.ID = sn.getChildByName('ID').getComponent(cc.Label);
            viewdata.score = sn.getChildByName('score').getComponent(cc.Label);
            viewdata.win = sn.getChildByName('win').getComponent(cc.Label);
            viewdata.lose = sn.getChildByName('lose').getComponent(cc.Label);
            viewdata.pingju = sn.getChildByName('pingju').getComponent(cc.Label);

            var btnWechat = cc.find("Canvas/game_result/btn_wxfx");
            if(btnWechat){
                if(cc.vv.userMgr.control.value == 0){
                    btnWechat.active = false;
                }
                cc.vv.utils.addClickEvent(btnWechat,this.node,"sssGameResult","onBtnWeichatClicked");
            }

            this._seats.push(viewdata);
        }
    },

    reset:function(){
        this.node.active = false;
        for(var i = 1; i <= 6; ++i){
            var s = "s" + i;
            var sn = this.node.getChildByName(s);
            sn.active = false;
        }
    },

    showResult:function(data){
        var len = data.length;
        for(var i = 1; i <= len; ++i){
            var s = "s" + i;
            var sn = this.node.getChildByName(s);
            sn.active = true;
        }
        for(let i = 0;i < data.length;i++){
            var name = data[i].userName;
            var len = name.length;
            if (len > 4) {
                var str = name.substring(0,4);
                this._seats[i].username.string = str +'...';
            }
            else {
                this._seats[i].username.string = name;
            }
            this._seats[i].ID.string = data[i].userId;
            if(this._seats[i].imgLoader && data[i].userId){
                this._seats[i].imgLoader.setUserID(data[i].userId);
            }
            this._seats[i].score.string = data[i].score;
            this._seats[i].win.string = data[i].win;
            this._seats[i].lose.string = data[i].lose;
            this._seats[i].pingju.string = data[i].flat;
        }
        //删除SSS房间信息
        cc.sys.localStorage.setItem("SSS_wanfa",null);
        cc.sys.localStorage.setItem("SSS_roomId",null);
    },

    onBtnWeichatClicked:function(){
        //微信分享监听
        var share = cc.find("Canvas/share");
        share.active = true;
    },
    onBtnShareCloseClicked:function(){
        var share = cc.find("Canvas/share");
        share.active = false;
    },
    onBtnShareHaoyou:function(){
        var share = cc.find("Canvas/share");
        share.active = false;
        

        //微信浏览器----公众号登录 
        if(cc.sys.browserType == "mqqbrowser" || "wechat" == cc.sys.browserType){
            console.log("H5分享好友");
            cc.find("Canvas/WebShare").active = true;
            cc.vv.anysdkMgr.getAccess_token('好玩的棋牌游戏');
        }
        else if(cc.sys.os == cc.sys.OS_ANDROID || cc.sys.os == cc.sys.OS_IOS){
            cc.vv.anysdkMgr.shareResult('0');
        }
        //其它浏览器----二维码扫码登录 
        else{
            console.log("H5分享好友");
            cc.find("Canvas/WebShare").active = true;
            cc.vv.anysdkMgr.getAccess_token('好玩的棋牌游戏');
        }
    },
    onBtnSharePengyouquan:function(){
        var share = cc.find("Canvas/share");
        share.active = false;
        
        //微信浏览器----公众号登录 
        if(cc.sys.browserType == "mqqbrowser" || "wechat" == cc.sys.browserType){
            console.log("H5分享好友");
            cc.find("Canvas/WebShare").active = true;
            cc.vv.anysdkMgr.getAccess_token('好玩的棋牌游戏');
        }
        else if(cc.sys.os == cc.sys.OS_ANDROID || cc.sys.os == cc.sys.OS_IOS){
            cc.vv.anysdkMgr.shareResult('1');
        }
        //其它浏览器----二维码扫码登录 
        else{
            console.log("H5分享好友");
            cc.find("Canvas/WebShare").active = true;
            cc.vv.anysdkMgr.getAccess_token('好玩的棋牌游戏');
        }
    },

    btnClick:function(event){
        if(event.target.name === "btn_close"){
            this.reset();
            //返回大厅
            cc.vv.sssNet.send('exit_disconnect');
        }
    }
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
