var Net = require("Net")
var Global = require("Global")
cc.Class({
    extends: cc.Component,

    properties: {
        lblName:cc.Label,
        lblMoney:cc.Label,
        lblGems:cc.Label,
        lblID:cc.Label,
        lblNotice:cc.Label,
        joinGameWin:cc.Node,
        settingsWin:cc.Node,
        //helpWin:cc.Node,
        xiaoxiWin:cc.Node,
        //btnJoinGame:cc.Node,
        //btnReturnGame:cc.Node,
        sprHeadImg:cc.Sprite,
        roomModeWin:cc.Node,
        sssCreateRoomWin:cc.Node,
        sspCreateRoomWin:cc.Node,

        modeNameImg:cc.Sprite,
        modeNameAtlas:{
            default:null,
            type:cc.SpriteAtlas
        },
        sspmodeNameAtlas:{
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
    
    // initNetHandlers:function(){
    //     var self = this;
    // },
    
    onShare:function(){
        cc.vv.anysdkMgr.share("");   
    },

    // use this for initialization
    onLoad: function () {
        console.log("Hall onload:" + cc.vv);
        if(!cc.sys.isNative && cc.sys.isMobile){
            var cvs = this.node.getComponent(cc.Canvas);
            cvs.fitHeight = true;
            cvs.fitWidth = true;
        }
        if(!cc.vv){
            cc.director.loadScene("loading");
            return;
        }
        this.initLabels();
        this.shareJoinRoom();//通过分享加入游戏
        var roomId = cc.vv.userMgr.oldRoomId;
        if( roomId != null){
            cc.sys.localStorage.setItem("roomId",null);
            cc.vv.userMgr.oldRoomId = null;
            cc.vv.userMgr.enterRoom(roomId);
        }
        
        console.log("Hall setUserID:" + cc.vv.userMgr.userId);
        var imgLoader = this.sprHeadImg.node.getComponent("ImageLoader");
        imgLoader.setUserID(cc.vv.userMgr.userId);
        cc.vv.utils.addClickEvent(this.sprHeadImg.node,this.node,"Hall","onBtnClicked");
        
        
        this.addComponent("UserInfoShow");
        
        this.initButtonHandler("Canvas/bottom_center/btn_shezhi");
        this.initButtonHandler("Canvas/bottom_center/btn_xiaoxi");
        
        if(!cc.vv.userMgr.notice){
            cc.vv.userMgr.notice = {
                version:null,
                msg:"数据请求中...",
            }
        }
        
        if(!cc.vv.userMgr.gemstip){
            cc.vv.userMgr.gemstip = {
                version:null,
                msg:"数据请求中...",
            }
        }

        if(!cc.vv.userMgr.control){
            cc.vv.userMgr.control = {
                version:null,
                msg:0,
            }
        }
        
        this.lblNotice.string = '珍爱生命，远离赌博';
        
        this.refreshInfo();
        this.refreshNotice();
        this.refreshGemsTip();
        this.refreshControl();
        
        cc.vv.audioMgr.playBGM("bgMain.mp3");

        cc.vv.utils.addEscEvent(this.node);
	
        //微信浏览器----公众号登录 
        if(cc.sys.browserType == "mqqbrowser" || "wechat" == cc.sys.browserType){
            cc.vv.anysdkMgr.getAccess_token('斗斗棋牌，包含了福州麻将、十三水等多种玩法。');
        }
        else if(cc.sys.os == cc.sys.OS_ANDROID || cc.sys.os == cc.sys.OS_IOS){
            
        }
        //其它浏览器----二维码扫码登录 
        else{
            
        }
        
        
        
    },

    shareJoinRoom:function(){//通过分享加入游戏
        var roomId = cc.args["roomId"];
        if(roomId){
            //存
            cc.vv.userMgr.oldRoomId = roomId;
            cc.sys.localStorage.setItem("roomId",roomId);
        }
        else{//取
            roomId = cc.sys.localStorage.getItem("roomId");
            cc.vv.userMgr.oldRoomId = roomId;
        }  
    },
    
    refreshInfo:function(){
        var self = this;
        var onGet = function(ret){
            if(ret.errcode !== 0){
                console.log(ret.errmsg);
            }
            else{
                if(ret.gems != null){
                    this.lblGems.string = ret.gems;    
                }
            }
        };
        
        var data = {
            account:cc.vv.userMgr.account,
            sign:cc.vv.userMgr.sign,
        };
        cc.vv.http.sendRequest("/get_user_status",data,onGet.bind(this));
    },
    
    refreshGemsTip:function(){
        var self = this;
        var onGet = function(ret){
            if(ret.errcode !== 0){
                console.log(ret.errmsg);
            }
            else{
                cc.vv.userMgr.gemstip.version = ret.version;
                cc.vv.userMgr.gemstip.msg = ret.msg.replace("<newline>","\n");
            }
        };
        
        var data = {
            account:cc.vv.userMgr.account,
            sign:cc.vv.userMgr.sign,
            type:"fkgm",
            version:cc.vv.userMgr.gemstip.version
        };
        cc.vv.http.sendRequest("/get_message",data,onGet.bind(this));
    },
    
    //控制是否显示微信登录
    refreshControl:function(){
        var self = this;
        if(cc.sys.os != cc.sys.OS_IOS){
            cc.vv.userMgr.control.value = 1;    //显示微信
            return;
        }
        var onGet = function(ret){
            if(ret.errcode !== 0){
                console.log(ret.errmsg);
            }
            else{
                cc.vv.userMgr.control.version = ret.version;
                cc.vv.userMgr.control.value = ret.msg;
            }
        };
        
        var data = {
            account:cc.vv.userMgr.account,
            sign:cc.vv.userMgr.sign,
            type:"control",
            version:20161128
        };
        cc.vv.http.sendRequest("/get_message",data,onGet.bind(this));
    },

    refreshNotice:function(){
        var self = this;
        var onGet = function(ret){
            if(ret.errcode !== 0){
                console.log(ret.errmsg);
            }
            else{
                cc.vv.userMgr.notice.version = ret.version;
                cc.vv.userMgr.notice.msg = ret.msg;
                this.lblNotice.string = '珍爱生命，远离赌博';
            }
        };
        
        var data = {
            account:cc.vv.userMgr.account,
            sign:cc.vv.userMgr.sign,
            type:"notice",
            version:cc.vv.userMgr.notice.version
        };
        cc.vv.http.sendRequest("/get_message",data,onGet.bind(this));
    },
    
    initButtonHandler:function(btnPath){
        var btn = cc.find(btnPath);
        cc.vv.utils.addClickEvent(btn,this.node,"Hall","onBtnClicked");        
    },
    
    
    
    initLabels:function(){
        var name = cc.vv.userMgr.userName;
        var len = name.length;
        if (len > 8) {
            var str = name.substring(0,8);
            this.lblName.string = str + '...';
        }
        else {
            this.lblName.string = name;
        }
        
        this.lblMoney.string = cc.vv.userMgr.coins;
        this.lblGems.string = cc.vv.userMgr.gems;
        this.lblID.string = "ID:" + cc.vv.userMgr.userId;
    },
    
    onBtnClicked:function(event){
        if(event.target.name == "btn_shezhi"){
            this.settingsWin.active = true;
        }
        else if(event.target.name == "btn_xiaoxi"){
            this.xiaoxiWin.active = true;
        }
        else if(event.target.name == "head"){
            cc.vv.userinfoShow.show(cc.vv.userMgr.userName,cc.vv.userMgr.userId,this.sprHeadImg,cc.vv.userMgr.sex,cc.vv.userMgr.ip);
        }
    },
    

    onBtnShare:function(){
        //分享至微信
        //微信分享监听
        console.log('分享至微信: ');
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
        console.log("onBtnShareHaoyou117");      

        //微信浏览器----公众号登录 
        if(cc.sys.browserType == "mqqbrowser" || "wechat" == cc.sys.browserType){
            console.log("H5分享好友");
            cc.find("Canvas/WebShare").active = true;
           // cc.vv.anysdkMgr.getsignature();
            cc.vv.anysdkMgr.getAccess_token('好玩的棋牌游戏');
        }
        else if(cc.sys.os == cc.sys.OS_ANDROID || cc.sys.os == cc.sys.OS_IOS){
            cc.vv.anysdkMgr.shareUrlEvent('0');
            console.log("cc.vv.anysdkMgr.shareUrlEvent('0');");
        }
        //其它浏览器----二维码扫码登录 
        else{
            console.log("H5分享好友");
            cc.find("Canvas/WebShare").active = true;
            cc.vv.anysdkMgr.getAccess_token('好玩的棋牌游戏');
            //cc.vv.anysdkMgr.H5share('好玩的棋牌游戏',"icon.png",0);
        }
    },
    onBtnSharePengyouquan:function(){
        var share = cc.find("Canvas/share");
        share.active = false;
        console.log("onBtnSharePengyouquan117");   
        //微信浏览器----公众号登录 
        if(cc.sys.browserType == "mqqbrowser" || "wechat" == cc.sys.browserType){
            console.log("H5分享朋友圈");
            cc.vv.anysdkMgr.getAccess_token('好玩的棋牌游戏');
            cc.find("Canvas/WebShare").active = true;
           // cc.vv.anysdkMgr.H5share('好玩的棋牌游戏',"icon.png",1);
        }
        else if(cc.sys.os == cc.sys.OS_ANDROID || cc.sys.os == cc.sys.OS_IOS){
            cc.vv.anysdkMgr.shareUrlEvent('1');
            console.log("cc.vv.anysdkMgr.shareUrlEvent('1');");
        }
        //其它浏览器----二维码扫码登录 
        else{
            console.log("H5分享朋友圈");
            cc.vv.anysdkMgr.getAccess_token('好玩的棋牌游戏');
            cc.find("Canvas/WebShare").active = true;
           // cc.vv.anysdkMgr.H5share('好玩的棋牌游戏',"icon.png",1);
        }
    },


    onBtnNothing:function(){

    },

    onBtnHideWebShare:function(){
        cc.find("Canvas/WebShare").active = false;
    },

    onBtnUserinfo:function(){
        var userinfo = this.node.getChildByName('userinfo');
        userinfo.active = false;
    },
    
    onJoinGameClicked:function(){
        this.joinGameWin.active = true;
    },
    
    onBtnAddGemsClicked:function(){
        cc.vv.alert.show("提示",cc.vv.userMgr.gemstip.msg,function(){
            this.onBtnTaobaoClicked();
        }.bind(this));
        this.refreshInfo();
    },

    onBtnXiaoxiCloseClicked:function(){
        var xiaoxi = cc.find("Canvas/xiaoxi");
        xiaoxi.active = false;
    },

    onBtnShopClicked:function(){
        var self = this;
        var onGet = function(ret){
            if(ret.errcode.PayUrl){
                console.log("ret.errcode.PayUrl:"+ret.errcode.PayUrl);
                if(cc.sys.os == cc.sys.OS_ANDROID || cc.sys.os == cc.sys.OS_IOS){
                    cc.Application.getInstance().openURL(ret.errcode.PayUrl);
                }
                else{
                    window.location.href = ret.errcode.PayUrl;//跳转到支付网站
                }
            }
        };
        
        var data = {
            userId:cc.vv.userMgr.userId,
        };
        cc.vv.http.sendRequest("/getPayUrl",data,onGet.bind(this));
    },

    onBtnShopCloseClicked:function(){
        var shop = cc.find("Canvas/shop");
        shop.active = false;
    },

    onBtnKefuClicked:function(){
        var kefu = cc.find("Canvas/kefu");
        kefu.active = true;
    },

    onBtnKefuCloseClicked:function(){
        var kefu = cc.find("Canvas/kefu");
        kefu.active = false;
    },

    onBtnWanfaCloseClicked:function(){
        var wanfa = cc.find("Canvas/wanfa");
        wanfa.active = false;
    },

    onCreateRoomClicked:function(){
        var gameType = cc.vv.userMgr.gameType;
        if('SSS_SERVER_TYPE' === gameType){
            if(cc.vv.sssNetMgr.roomId != null){
                cc.vv.alert.show("提示","房间已经创建!\n必须解散当前房间才能创建新的房间");
                return;
            }
            console.log("onCreateRoomClicked");
            this.sssCreateRoomWin.active = true;
        }
        else if('SSP_SERVER_TYPE' === gameType){
            if(cc.vv.sspNetMgr.roomId != null){
                cc.vv.alert.show("提示","房间已经创建!\n必须解散当前房间才能创建新的房间");
                return;
            }
            console.log("onCreateRoomClicked");
            this.sspCreateRoomWin.active = true;
        }
    },
    
    onBtnTaobaoClicked:function(){
        //cc.sys.openURL('https://shop596732896.taobao.com/');
    },


    onBtnFzsssClicked:function(){
        this.roomModeWin.active = true;
        cc.vv.userMgr.gameType = 'SSS_SERVER_TYPE';
        this.changeModeNameImg('SSS_SERVER_TYPE');
    },

    onBtnFzsspClicked:function(){
        this.roomModeWin.active = true;
        cc.vv.userMgr.gameType = 'SSP_SERVER_TYPE';
        this.changeModeNameImg('SSP_SERVER_TYPE');
    },

    onBtnEnterRoomClicked:function(){
        var self = this;
        var limitLogin = function(ret){
            var roomid = ret.errcode;
            if(roomid != null){
                cc.vv.userMgr.enterRoom(roomid);
            }else{
                console.log('进入房间失败');
            }
        };
        var isLogin = function (ret) {
            console.log('进到 isLogin');
            var roomid = ret.errcode;
            if (roomid != null) {
                //roomId已存在
                var data = {};
                data.roomid = roomid;
                data.userid = cc.vv.userMgr.userId;
                if(roomid >= 200000 && roomid < 300000){
                    data.serverType = "SSS_SERVER_TYPE";
                }
                else if(roomid >= 300000 && roomid < 400000){
                    data.serverType = "SSP_SERVER_TYPE";
                }
                cc.vv.http.sendRequest("/limit_login", data, limitLogin.bind(this));
            }
            else {
                if(!roomid){
                    cc.vv.sssNetMgr.roomId = null;
                    cc.vv.sspNetMgr.roomId = null;
                }
                if(cc.vv.sssNetMgr.roomId != null){
                    cc.vv.wc.show('正在返回游戏房间');
                    cc.director.loadScene("sssgame"); 
                }
                else if(cc.vv.sspNetMgr.roomId != null){
                    cc.vv.wc.show('正在返回游戏房间');
                    cc.director.loadScene("sspgame"); 
                }
                else{
                    self.joinGameWin.active = true;
                }
            }
        };
        var data = {
            account: cc.vv.userMgr.account
        };
        console.log('点击了加入房间按钮');
        cc.vv.http.sendRequest("/is_login", data, isLogin.bind(this));
    },

    //观察者进入房间
    onBtnObserverClicked:function(){
        if(cc.vv.sssNetMgr.roomId != null){
            cc.vv.wc.show('正在返回游戏房间');
            cc.director.loadScene("sssgame"); 
        }
        else if(cc.vv.sspNetMgr.roomId != null){
            cc.vv.wc.show('正在返回游戏房间');
            cc.director.loadScene("sspgame"); 
        }
        else{
            cc.vv.userMgr.bObserver = true;
            this.joinGameWin.active = true; 
        }
    },

    onBtnCloseClicked:function(){
        var observed = this.roomModeWin.getChildByName('btn_observedEnter');
        observed.active = false;
        this.roomModeWin.active = false;
        this.sssCreateRoomWin.active = false;
        this.sspCreateRoomWin.active = false;
    },

    onBtnBack:function(){
        //退出游戏
        cc.sys.localStorage.removeItem("wx_account");
        cc.sys.localStorage.removeItem("wx_sign");
        cc.director.loadScene("login");
    },

    onBtnWanfa:function(){
        var wanfa = this.node.getChildByName('wanfa');
        wanfa.active = true;
        var gameType = cc.vv.userMgr.gameType;
        var viewlist = wanfa.getChildByName('viewlist');
        var content = viewlist.getComponent(cc.ScrollView).content;

        var sss = viewlist.getChildByName('view').getChildByName('content').getChildByName('sss');
        var ssp = viewlist.getChildByName('view').getChildByName('content').getChildByName('ssp');

        sss.active = false;
        ssp.active = false;
        if('SSS_SERVER_TYPE' === gameType){
            sss.active = true;            
            //content = sss;
        }
        else if('SSP_SERVER_TYPE' === gameType){
            ssp.active = true;            
        }
    },

    changeModeNameImg:function(gameType){
        var spriteFrame = null;
        switch(gameType){
            case 'SSS_SERVER_TYPE':
                spriteFrame = this.modeNameAtlas.getSpriteFrame("jryx-sss");
                break;
            case 'SSP_SERVER_TYPE':
                spriteFrame = this.sspmodeNameAtlas.getSpriteFrame("biaoti");
                break;
            default:
                break;
        }

        var modeName = this.modeNameImg.node.getComponent(cc.Sprite);
        modeName.spriteFrame = spriteFrame;
    },
    
    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        var x = this.lblNotice.node.x;
        x -= dt*100;
        if(x + this.lblNotice.node.width < -1000){
            x = 500;
        }
        this.lblNotice.node.x = x;
        
        if(cc.vv && cc.vv.userMgr.roomData != null){
            cc.vv.userMgr.enterRoom(cc.vv.userMgr.roomData);
            cc.vv.userMgr.roomData = null;
        }
    },
});
