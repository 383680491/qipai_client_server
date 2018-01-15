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
        _gameresult:null,
        _seats:[],
    },

    // use this for initialization
    onLoad: function () {
        if(cc.vv == null){
            return;
        }
        
        this._gameresult = this.node.getChildByName("game_result");
        
        var seats = this._gameresult.getChildByName("seats");
        for(var i = 0; i < seats.children.length; ++i){
            this._seats.push(seats.children[i].getComponent("sspSeat"));   
        }
        
        var btnClose = cc.find("Canvas/game_result/btnClose");
        if(btnClose){
            cc.vv.utils.addClickEvent(btnClose,this.node,"SSPGameResult","onBtnCloseClicked");
        }

        var btnWeiClose = cc.find("Canvas/share/btn_close");
        if(btnWeiClose){
            cc.vv.utils.addClickEvent(btnWeiClose,this.node,"SSPGameResult","onBtnShareCloseClicked");
        }

        var btnWei_haoyou = cc.find("Canvas/share/Wei_haoyou");
        if(btnWei_haoyou){
            cc.vv.utils.addClickEvent(btnWei_haoyou,this.node,"SSPGameResult","onBtnShareHaoyou");
        }

        var btnWei_pengyouquan = cc.find("Canvas/share/Wei_pengyouquan");
        if(btnWei_pengyouquan){
            cc.vv.utils.addClickEvent(btnWei_pengyouquan,this.node,"SSPGameResult","onBtnSharePengyouquan");
        }
        
        var btnShare = cc.find("Canvas/game_result/btnShare");
        if(btnShare){
            cc.vv.utils.addClickEvent(btnShare,this.node,"SSPGameResult","onBtnShareClicked");
        }
        
        //初始化网络事件监听器
        var self = this;
        this.node.on('game_end',function(data){self.onGameEnd(data.detail);});
    },
    
    showResult:function(seat,info,isZuiJiaPaoShou){
        
        seat.node.getChildByName("win").getComponent(cc.Label).string = info.win;
        seat.node.getChildByName("lose").getComponent(cc.Label).string = info.lose;
        seat.node.getChildByName("draw").getComponent(cc.Label).string = info.draw;
    },
    
    onGameEnd:function(endinfo){
        var seats = cc.vv.sspNetMgr.seats;
        var maxscore = -1;
        var maxdianpao = 0;
        var dianpaogaoshou = -1;
        for(var i = 0; i < seats.length; ++i){
            var seat = seats[i];
            if(seat.score > maxscore){
                maxscore = seat.score;
            }
        }
        
        for(var i = 0; i < seats.length; ++i){
            if (seats[i].userid === 0) {
                continue;
            }
            var seat = seats[i];
            var isBigwin = false;
            if(seat.score > 0){
                isBigwin = seat.score == maxscore;
            }
            this._seats[i].setInfo(seat.name,endinfo[i].score, isBigwin);
            this._seats[i].setID(seat.userid);
            var isZuiJiaPaoShou = dianpaogaoshou == i;
            this.showResult(this._seats[i],endinfo[i],isZuiJiaPaoShou);
        }
    },
    
    onBtnCloseClicked:function(){
        cc.vv.wc.show('正在返回游戏大厅');
        cc.director.loadScene("hall");
    },
    
    onBtnShareClicked:function(){
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
});
