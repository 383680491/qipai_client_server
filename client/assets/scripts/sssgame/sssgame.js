var PaiType = require("define").PaiType;
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
        canvas:{
            type:cc.Node,
            default:null
        },
        prepare:{
            type:cc.Node,
            default:null
        },
        shezhiPaiNode:{
            type:cc.Node,
            default:null
        },
        NorSeatsNode:{
            type:cc.Node,
            default:null
        },
        myPaiNode:{
            type:cc.Node,
            default:null
        },
        paiAtlas:{
            default:null,
            type:cc.SpriteAtlas
        },
        BBpaiAtlas:{
            default:null,
            type:cc.SpriteAtlas
        },
        paiTexiao:{
            default:null,
            type:cc.SpriteAtlas
        },
        shuzi:{
            default:null,
            type:cc.SpriteAtlas
        },
        setType:{
            default:null,
            type:cc.Node
        },
        gameStartNode:{
            default:null,
            type:cc.Node
        },
        AnimationNode:{
            default:null,
            type:cc.Node
        },
        gameOverNode:{
            default:null,
            type:cc.Node
        },
        sssGameResultNode:{
            default:null,
            type:cc.Node
        },
        setZhuangNode:{
            default:null,
            type:cc.Node
        },
        btnMgrNode:{
            default:null,
            type:cc.Node
        },
        settingNode:{
            default:null,
            type:cc.Node
        },
        _timeLabel:null,
        _voiceMsgQueue:[],
        _lastPlayingSeat:null,
        _playingSeat:null,
        _lastPlayTime:null,
        _gamecount:null,
    },

    // use this for initialization
    onLoad: function () {
        window.sssGame = this;
        this.addComponent("UserInfoShow");
        this.initView();
        this.initCanvas();
        this.initSheZhiPai();
        this.initGameStart();
        this.initGameOver();
        this.initSeats();
        this.initMyPai();
        this.initHandler();
        this.initSetType();
        this.initBtnMgr();

        //解散房间脚本
        this.addComponent("PopupMgr");

        //断线重连脚本
        this.addComponent('ReConnect');

        this.addComponent("Status");

        this.Compare = require("Compare");

        this.totalData = null;

        this.onRefreshSeat();

        if(cc.vv.userMgr.control.value != 1 && cc.sys.os == cc.sys.OS_IOS){ //苹果隐藏
            cc.find("Canvas/btnMgr/bthYaoqing").active = false;
            cc.find("Canvas/game_result/btn_wxfx").active = false;
            cc.find("Canvas/userinfo/diamond").active = false;
            cc.find("Canvas/userinfo/money").active = false;
        }
    },
    initView:function(){
        this._timeLabel = cc.find("Canvas/infobar/time").getComponent(cc.Label);
        this._gamecount = cc.find("Canvas/gameStart/gamecount").getComponent(cc.Label);
        this._gamecount.string = "  " + "1" + "/" + cc.vv.sssNetMgr.maxNumOfGames + "局";
        this._min = cc.find("Canvas/notice/minute").getComponent(cc.Label);
        this._second = cc.find("Canvas/notice/second").getComponent(cc.Label);
        this._isExit = 0;
    },
    initCanvas:function(){
        if(!cc.sys.isNative && cc.sys.isMobile){
            this.cvs = this.canvas.getComponent(cc.Canvas);
            this.cvs.fitHeight = true;
            this.cvs.fitWidth = true;
        }
        if(!cc.vv){
            cc.director.loadScene("loading");
            return;
        }
    },
    initGameStart:function(){
        this.gameStartNode.active = true;
        this.gameStartPaiCom = this.gameStartNode.getComponent('gameStart');
        this.gameStartPaiCom.game = this;
        this.gameStartNode.getChildByName('gameSeats').active = true;
        this.gameSeatsCom = this.gameStartNode.getChildByName('gameSeats').getComponent('gameSeats'); 
        this.Animation = this.AnimationNode.getComponent('Animation');
    },
    initGameOver:function(){
        this.gameOverCom = this.gameOverNode.getComponent('game_over');
        this.sssGameResult = this.sssGameResultNode.getComponent('sssGameResult');
    },
    initSheZhiPai:function(){
        this.shezhiPaiCom = this.shezhiPaiNode.getComponent('shezhipai');
        this.shezhiPaiCom.game = this;
    },
    initSeats:function(){
        this.seatsNode = this.NorSeatsNode;
        this.seatsNode.active = true;
        this.seatsCom = this.seatsNode.getComponent('seats');
        this.seatsCom.game = this;
    },
    initMyPai:function(){
        this.myPaiCom = this.myPaiNode.getComponent('myPai');
        this.myPaiCom.initDt();
        this.myPaiCom.game = this;
    },
    initBtnMgr:function(){
        this._btnMianban = this.settingNode.getChildByName("btn_mianban");
        var newNode = this.settingNode.getChildByName("New Node");
        this.btnBack = newNode.getChildByName("btnBack");
        for (var i = 0; i < this.settingNode.children.length; i++) {
            if (i != 1) {
                this.settingNode.children[i].active = false;
            }
        }
        this.btnReady = this.btnMgrNode.getChildByName('btnReady');
        this.bthYaoqing = this.btnMgrNode.getChildByName('bthYaoqing');
        this.btnDissolve = this.btnMgrNode.getChildByName('btnDissolve');
        if (cc.vv.sssNetMgr.seatIndex !== 0) {
            this.btnDissolve.active = false;
        }
        if(cc.vv.userMgr.control.value == 0){
            this.bthYaoqing.active = false;
        }
    },
    initHandler:function(){
        this.emitter = cc.vv.emitter;
        this.emitter.on('game_holds', this.onGameHolds.bind(this));
        this.emitter.on('refresh_seat', this.onRefreshSeat.bind(this));
        this.emitter.on('self_ready', this.selfReady.bind(this));
        this.emitter.on('other_ready', this.otherReady.bind(this));
        this.emitter.on('game_mapai', this.showMaPai.bind(this));
        this.emitter.on('compare_result', this.setResultData.bind(this));
        this.emitter.on('game_begin', this.resetGame.bind(this));
        this.emitter.on('remove_handler', this.removeHandler.bind(this));
        this.emitter.on('game_num_notify', this.setGameNum.bind(this));
	    this.emitter.on('game_over_Notify', this.setOverData.bind(this));
	    this.emitter.on('game_result_Notify', this.setTotalResult.bind(this));
        this.emitter.on('quick_swing_notify', this.quickSwing.bind(this));
        this.emitter.on('player_outCard_notify', this.playerOutCardNotify.bind(this));
	    this.emitter.on('out_maxPai_Notify', this.outMaxPai.bind(this));
        this.emitter.on('chat_push', this.setChat.bind(this));
        this.emitter.on('quick_chat_push', this.setQuickChat.bind(this));
        this.emitter.on('emoji_push', this.setEmoji.bind(this));
        this.emitter.on('voice_msg', this.setVoice.bind(this));
        this.emitter.on('set_lastTime', this.setLastTime.bind(this));
        this.emitter.on('user_state_offline', this.offline.bind(this));
        this.emitter.on('expression_notify', this.expression.bind(this));
        this.emitter.on('set_lixianTime', this.setlixianTime.bind(this));
        this.emitter.on('set_dissolutionTime', this.setdissolutionTime.bind(this));
        this.emitter.on('limit_login', this.limitLogin.bind(this));
    },
    removeHandler:function(){
        this.emitter.off('game_holds');
        this.emitter.off('refresh_seat');
        this.emitter.off('self_ready');
        this.emitter.off('other_ready');
        this.emitter.off('game_mapai');
        this.emitter.off('compare_result');
        this.emitter.off('game_begin');
        this.emitter.off('remove_handler');
        this.emitter.off('game_num_notify');
        this.emitter.off('game_over_Notify');
        this.emitter.off('quick_swing_notify');
	    this.emitter.off('game_result_Notify');
        this.emitter.off('player_outCard_notify');
	    this.emitter.off('out_maxPai_Notify');
        this.emitter.off('chat_push');
        this.emitter.off('quick_chat_push');
        this.emitter.off('emoji_push');
        this.emitter.off('voice_msg');
        this.emitter.off('set_lastTime');
        this.emitter.off('user_state_offline');
        this.emitter.off('expression_notify');
        this.emitter.off('set_lixianTime');
        this.emitter.off('set_dissolutionTime');
        this.emitter.off('limit_login');
    },
    //将游戏刷新，游戏重新开始
    resetGame:function(){
        cc.find("Canvas/notice").active = false;
        this.onRefreshSeat();
        this.gameStartPaiCom.resetGameSeats();
        this.prepare.getComponent('touch').reset();
        if(this.zjId){
            this.zjbiaoshi(this.zjId);
        }
    },

    playerOutCardNotify:function(data){
        cc.find("Canvas/notice").active = false;
        cc.find("Canvas/btnMgr/btnDissolve").active = false;
        this.setBtnReadyActive(false);
        var selfSeats = cc.vv.sssNetMgr.getSelfData();
        for (var i = 0; i < data.length; i++) {
            if(data[i].userId === selfSeats.userid && data[i].isChuPai == true){
                this.seatsNode.active = true;
            }
        }
        this.seatsCom.setPlayerInfo(data);
    },

    setGameNum:function(data){
        this._gamecount.string = "  " + cc.vv.sssNetMgr.numOfGames + "/" + cc.vv.sssNetMgr.maxNumOfGames + "局";
    },

    offline:function(data){
        var seat = data;
        var isOffline = !seat.online;
        var index = cc.vv.sssNetMgr.getLocalIndex(seat.seatindex);
        this.seatsCom.seatComs[index].setOffline(isOffline);
        this.gameSeatsCom.seatComs[index].setOffline(isOffline);
    },

    expression:function(data){       //表情
        this.gameStartPaiCom.expression(data);
    },

    outMaxPai:function(){
        this.seatsNode.active = true;        
        this.shezhiPaiCom.reset();

        this.unschedule(this.setkaishi);
        this.unschedule(this.setAnimation);
        this.unschedule(this.setHolds);
    },

    onGameHolds:function(){
        cc.find("Canvas/notice").active = false;
        this.setBtnReadyActive(false);
        this.btnDissolve.active = false;
        this.onRefreshSeat();
        var self = this;

        if(cc.vv.sssNetMgr.wanfa === 1 && cc.vv.sssNetMgr.zjID){
            this.zjbiaoshi(cc.vv.sssNetMgr.zjID);
        }

        this.setAnimation =function(){
            //发牌动画
            self.seatsCom.fapaiAnimate();
        }
        
        this.setHolds =function(){
            console.log('onGameHolds');
            self.seatsCom.reset();
            if(!self.myPaiCom.setInfo()){
                return;
            }
            var mapai = cc.find("Canvas/prepare/shezhipai/mapai");
            mapai.active = false;
            if(cc.vv.sssNetMgr.wanfa === 3){  //马牌
                mapai.active = true;
                var paiAtlas = window.sssGame.paiAtlas;
                var pai = cc.find("Canvas/prepare/shezhipai/mapai/pai").getComponent(cc.Sprite);
                var arrType = ["hua","tao","xin","fangkuai"];
                var paiName = arrType[cc.vv.sssNetMgr.maPaiData.type] + cc.vv.sssNetMgr.maPaiData.value;
                var spriteFrame = paiAtlas.getSpriteFrame(paiName);
                pai.spriteFrame = spriteFrame;
            }
            self.prepare.active = true;
            self.seatsNode.active = false;       
            self.setType.getType();
            cc.vv.audioMgr.playSFX("sssMusic/qingchupai.mp3");
        }

        this.setkaishi =function(){
            var animation = this.Animation.kaishi.getComponent(cc.Animation);
            this.Animation.kaishi.getComponent(cc.Animation).play('kaishi');
            if(cc.vv.sssNetMgr.wanfa === 2 || cc.vv.sssNetMgr.wanfa === 3){
                var seq = cc.sequence(cc.delayTime(1.0),cc.callFunc(this.setAnimation),cc.delayTime(4.0),cc.callFunc(this.setHolds));
            }
            else{
                var seq = cc.sequence(cc.delayTime(1.0),cc.callFunc(this.setAnimation),cc.delayTime(2.0),cc.callFunc(this.setHolds));
            }
            
            this.Animation.kaishi.active = true;
            this.Animation.kaishi.runAction(seq);
            
            this.seatsCom.start();
        }
        
        this.scheduleOnce(this.setkaishi,1.0);
        this.resetReady();
    },

    onRefreshSeat:function(){
        this.seatsCom.refreshSeats();
        this.gameSeatsCom.refreshSeats();
    },

    onResetAllSeat:function() {
        this.seatsCom.resetALLSeat();
        this.gameSeatsCom.resetALLSeat();
    },
    
    initSetType:function(){
        this.setType = this.setType.getComponent('setType');
        this.setType.game = this;
    },

    selfReady:function(data){
        console.log("selfReady");
        this.setBtnReadyActive(false);
        var userId = data.userid;
        this.seatsCom.setPlayerReady(userId);
        this.gameSeatsCom.setPlayerReady(userId);    
    },

    otherReady:function(data){
        console.log("selfReady");
        var userId = data.userid;
        this.seatsCom.setPlayerReady(userId);
        this.gameSeatsCom.setPlayerReady(userId);
    },

    resetReady:function() {
        this.seatsCom.resetReady();
        this.gameSeatsCom.resetReady();
    },

    setBtnReadyActive:function(bActive){
        this.btnReady.active = bActive;
        this.bthYaoqing.active = bActive;
        this.btnDissolve.active = false;
        if(cc.vv.userMgr.control.value == 0){
            this.bthYaoqing.active = false;
        }
    },

    showMaPai:function(){
        console.log("setMaPai");
    },

    setResultData:function(data){
        cc.find("Canvas/notice").active = false;
        this.btnDissolve.active = false;
        console.log('setResultData : '+ data);
        if(this.seatsNode){
            this.seatsNode.active = false;
        }
        if(this.gameStartNode){
            this.gameStartNode.active = true;
        }
        this.setBtnReadyActive(false);

        this.gameStartPaiCom.gameNormol(data);
        this.seatsCom.emptyChatBubble();
        this.gameOverCom.hiddenPai(true);//显示牌
    },
    
    setZhuang:function(){
        this.setZhuangNode.active = true;
        var seatData = cc.vv.sssNetMgr.seats;
        for (var i = 0; i < 4; i++) {
            var nameNode = this.setZhuangNode.getChildByName("name"+i);
            var nameLabel = nameNode.getChildByName("Label").getComponent(cc.Label);
            seatData[i].imgLoader = nameNode.getComponent("ImageLoader");
            nameLabel.string = seatData[i].name;
            nameNode.tag = seatData[i].userid;
            if(seatData[i].imgLoader && seatData[i].userid){
                seatData[i].imgLoader.setUserID(seatData[i].userid);
            }
        }
    },
    zjbiaoshi:function(data){ //庄家标识
        this.zjId = data;
        var self = this;
        var seatData = cc.vv.sssNetMgr.seats;
        for (var i = 0; i < seatData.length; i++) {
            if(seatData[i].userid === data){
                var index = cc.vv.sssNetMgr.getLocalIndex(seatData[i].seatindex);
                self.seatsCom.seatComs[index].zhuang.active = true;
                self.gameSeatsCom.seatComs[index].zhuang.active = true;
            }
        }
    },

    //单局结算
    setOverData:function(data){
        this.btnDissolve.active = false;
        console.log('setOverData: '+ data);
        this.overData = data;
    },
    
    showOver:function(){
        if(this.overData){
            this.setBtnReadyActive(false);
            this.gameOverNode.active = true;
            this.gameOverCom.showOver(this.overData);
            this.gameSeatsCom.setAllScoreResult(this.overData);
            this.seatsCom.setAllScoreResult(this.overData);
            this.btnReady.active = true;//显示准备按钮
            this.seatsCom.reset();
        }
    },

    //总局结算
    setTotalResult:function(data){
        this.btnDissolve.active = false;
        console.log('setTotalResult: '+ data);
        this.totalData = data;
        if(cc.vv.sssNetMgr.numOfGames < cc.vv.sssNetMgr.maxNumOfGames){
            this.showTotalResult();
        }
    },

    showTotalResult:function(){
        if(this.totalData){
            this.gameOverNode.active = false;
            this.sssGameResultNode.active = true;
            this.sssGameResult.showResult(this.totalData);
            return true;
        }
        else{
            return false;
        }
    },

    setChat:function(data){
        var self = this;
        var idx = cc.vv.sssNetMgr.getSeatIndexByID(data.sender);
        var localIdx = cc.vv.sssNetMgr.getLocalIndex(idx);
        self.seatsCom.seatComs[localIdx].chat(data.content);
        self.gameSeatsCom.seatComs[localIdx].chat(data.content);
    },

    setQuickChat:function(data){
        var self = this;
        var idx = cc.vv.sssNetMgr.getSeatIndexByID(data.sender);
        var localIdx = cc.vv.sssNetMgr.getLocalIndex(idx);
            
        var index = data.content;
        var info = cc.vv.chat.getQuickChatInfo(index);
        self.seatsCom.seatComs[localIdx].chat(info.content);
        self.gameSeatsCom.seatComs[localIdx].chat(info.content);
            
        cc.vv.audioMgr.playSFX(info.sound);
    },

    setEmoji:function(data){
        var self = this;
        var idx = cc.vv.sssNetMgr.getSeatIndexByID(data.sender);
        var localIdx = cc.vv.sssNetMgr.getLocalIndex(idx);
        console.log(data);
        self.seatsCom.seatComs[localIdx].emoji(data.content);
        self.gameSeatsCom.seatComs[localIdx].emoji(data.content);
    },

    setVoice:function(data){
        var self = this;
        self._voiceMsgQueue.push(data);
        self.playVoice();
    },

    playVoice:function(){
        if(this._playingSeat == null && this._voiceMsgQueue.length){
            console.log("playVoice2");
            var data = this._voiceMsgQueue.shift();
            var idx = cc.vv.sssNetMgr.getSeatIndexByID(data.sender);
            var localIndex = cc.vv.sssNetMgr.getLocalIndex(idx);
            this._playingSeat = localIndex;
            this.seatsCom.seatComs[localIndex].voiceMsg(true);
            this.gameSeatsCom.seatComs[localIndex].voiceMsg(true);
            
            var msgInfo = JSON.parse(data.content);
            var url = msgInfo.msg;
            cc.vv.voiceMgr.playFromUrl(url);
            this._lastPlayTime = Date.now() + msgInfo.time;
        }
    },
	
    //快速摆牌
    quickSwing:function(data){
        this.prepare.getComponent('touch').quickSwing(data);
        cc.vv.audioMgr.playSFX("sssMusic/fangpai.mp3");
    },
    
    onNameBtnClick:function(event){
        console.log("onNameBtnClick event.target.tag:"+event.target.tag);
        var userId = event.target.tag;
        cc.vv.sssNet.send("assign_zj",userId);
        this.setZhuangNode.active = false;
    },

    onBtnClick:function(event){
        var self = this;
        if(event.target.name == "btn_mianban"){
            for (var i = 0; i < this.settingNode.children.length; i++) {
                if (i != 1) {
                    this.settingNode.children[i].active = !this.settingNode.children[i].active;
                }
            }
        }
        else if (event.target.name == "btnBack") {
            cc.vv.alert.show("返回大厅","返回大厅房间仍会保留，快去邀请大伙来玩吧！",function(){
                cc.vv.wc.show('正在返回游戏大厅');
                cc.vv.sssNet.send('backToHall');
                self.removeHandler();
                cc.director.loadScene("hall");    
            },true);
        }
        else if(event.target.name == "btnDissolve"){
            var string = "解散房间不扣房卡，是否确定解散？";
            if(cc.vv.userMgr.control.value != 1 && cc.sys.os == cc.sys.OS_IOS){ //苹果隐藏
                string = "是否确定解散？";
            }
            cc.vv.alert.show("解散房间",string,function(){
                cc.vv.sssNet.send("dispress");
            },true);
        }
        else if(event.target.name == "btnReady"){
            console.log("onBtnReady");
            cc.vv.sssNet.send('ready');
        }
        else if(event.target.name == "btnSetting"){
            cc.vv.popupMgr.showSettings();
        }
        else if(event.target.name == "public-bangzhu"){
            var wanfa = cc.find("Canvas/wanfa");
            wanfa.active = true;
        }
        else if(event.target.name == "btn_wanfa_close"){
            var wanfa = cc.find("Canvas/wanfa");
            wanfa.active = false;
        }
        else if(event.target.name == "bthYaoqing"){
                //分享至微信
            //微信分享监听
            console.log('分享至微信: ');
            var SSSwanfa = "普通场";
            if(cc.vv.sssNetMgr.wanfa === 0){
                SSSwanfa = "普通场";
            }
            else if(cc.vv.sssNetMgr.wanfa === 3){
                SSSwanfa = "马牌";
            }

            //保存SSS房间信息
            cc.sys.localStorage.setItem("SSS_wanfa",cc.vv.sssNetMgr.wanfa);
            cc.sys.localStorage.setItem("SSS_roomId",cc.vv.sssNetMgr.roomId);
            
            //微信浏览器----公众号登录 
            if(cc.sys.browserType == "mqqbrowser" || "wechat" == cc.sys.browserType){
                console.log("H5分享好友");
                cc.find("Canvas/WebShare").active = true;
                cc.vv.anysdkMgr.getAccess_token("小伙子，我在十三水"+"("+SSSwanfa+")"+"【"+cc.vv.sssNetMgr.roomId+"】开好了房间，快来大战三百回合",cc.vv.sssNetMgr.roomId);
            }
            else if(cc.sys.os == cc.sys.OS_ANDROID || cc.sys.os == cc.sys.OS_IOS){
                var agent = anysdk.agentManager;
                this.share_plugin = agent.getSharePlugin();
                this.share_plugin.setListener(this.onShareResult, this);
                this.shareUrl("斗斗福建十三水","小伙子，我在十三水"+"("+SSSwanfa+")"+"【"+cc.vv.sssNetMgr.roomId+"】开好了房间，快来大战三百回合",
                "http://game.doudouyule.wang/?roomId="+cc.vv.sssNetMgr.roomId,
                "http://game.doudouyule.wang/icon.png","0");//标题 内容 URL 图片路径 发送至
            }
            //其它浏览器----二维码扫码登录 
            else{
                console.log("H5分享好友");
                cc.find("Canvas/WebShare").active = true;
                cc.vv.anysdkMgr.getAccess_token("小伙子，我在十三水"+"("+SSSwanfa+")"+"【"+cc.vv.sssNetMgr.roomId+"】开好了房间，快来大战三百回合",cc.vv.sssNetMgr.roomId);
            }
        }
        else if(event.target.name == "New_Node"){
            for (var i = 0; i < this.settingNode.children.length; i++) {
                if (i != 1) {
                    this.settingNode.children[i].active = !this.settingNode.children[i].active;
                }
            }
        }
        else if(event.target.name == "New Layout"){
            var userinfo = cc.find("Canvas/userinfo");
            userinfo.active = false;
        }
        else if(event.target.name == "zhadan"){
            var userinfo = cc.find("Canvas/userinfo");
            var _userId = cc.vv.userinfoShow._userId;
            userinfo.active = false;
            var data= {};
            data.type = 0;
            data.receiveId = _userId;
            cc.vv.sssNet.send("expression",data);
        }
        else if(event.target.name == "dangao"){
            var userinfo = cc.find("Canvas/userinfo");
            var _userId = cc.vv.userinfoShow._userId;
            userinfo.active = false;
            var data= {};
            data.type = 1;
            data.receiveId = _userId;
            cc.vv.sssNet.send("expression",data);
        }
        else if(event.target.name == "dianzan"){
            var userinfo = cc.find("Canvas/userinfo");
            var _userId = cc.vv.userinfoShow._userId;
            userinfo.active = false;
            var data= {};
            data.type = 2;
            data.receiveId = _userId;
            cc.vv.sssNet.send("expression",data);
        }
        else if(event.target.name == "feiwen"){
            var userinfo = cc.find("Canvas/userinfo");
            var _userId = cc.vv.userinfoShow._userId;
            userinfo.active = false;
            var data= {};
            data.type = 3;
            data.receiveId = _userId;
            cc.vv.sssNet.send("expression",data);
        }
        else if(event.target.name == "songhua"){
            var userinfo = cc.find("Canvas/userinfo");
            var _userId = cc.vv.userinfoShow._userId;
            userinfo.active = false;
            var data= {};
            data.type = 4;
            data.receiveId = _userId;
            cc.vv.sssNet.send("expression",data);
        }
        else if(event.target.name == "fanqie"){
            var userinfo = cc.find("Canvas/userinfo");
            var _userId = cc.vv.userinfoShow._userId;
            userinfo.active = false;
            var data= {};
            data.type = 5;
            data.receiveId = _userId;
            cc.vv.sssNet.send("expression",data);
        }
    },

    //分享事件
    onShareResult:function(code, msg){
    cc.log("share result, resultcode:"+code+", msg: "+msg);
    switch ( code ) {
        case anysdk.ShareResultCode.kShareSuccess:
            //do something
            console.log('分享成功');
            break;
        case anysdk.ShareResultCode.kShareFail:
            //do something
            console.log('分享失败');
            break;
        case anysdk.ShareResultCode.kShareCancel:
            //do something
            console.log('分享取消');
            break;
        case anysdk.ShareResultCode.kShareNetworkError:
            //do something
            console.log('分享错误');
            break;
        }
    },
    onBtnHideWebShare:function(){
        cc.find("Canvas/WebShare").active = false;
    },
    //分享URL
    shareUrl:function(title,text,url,imagePath,to){
        console.log('分享URL: ');
        console.log('title: ' + title);
        console.log('text: ' + text);
        console.log('url: ' + url);
        console.log('imagePath: ' + imagePath);
        console.log('to: ' + to);
        var map ={
            title : title,//标题
            text  : text,//文本
            url   : url,//链接
            mediaType : '2',//分享类型
            shareTo : to,//分享至 0 聊天 1 朋友圈 2 收藏
            imagePath : imagePath,//图片路径
            thumbImage: jsb.fileUtils.getWritablePath() +'icon.png'//苹果用
        }
        this.share_plugin.share(map);
    },

    setLastTime:function(data){
        var prepareCom = this.prepare.getComponent('touch');
        var lastTime= data / 1000;
        prepareCom.setCountdown(lastTime);
    },

    setdissolutionTime:function(data){
        this._time= data / 1000;
        if(this._time > 0){
            var min = null;
            var sec = null;
            var t = Math.ceil(this._time);
            min = Math.floor(t / 60);
            sec = Math.floor(t % 60);
            this._min.string = min;
            this._second.string = sec;
            
        }
        else if (this._time <=0) {
            this._isExit++;
            if (this._isExit === 1) {
                cc.vv.sssNet.send("dispress");
            }
        }
    },

    setlixianTime:function(data){  //改变离线时间
        var userId = data.userId;//离线人的ID
        var lastTime= 99;//离线人的剩余时间

        var self = this;
        var seatData = cc.vv.sssNetMgr.seats;
        if(seatData){
            for (var i = 0; i < seatData.length; i++) {
                if(seatData[i].userid === 0){
                    continue;
                }
                if(seatData[i].userid === userId){
                    var index = cc.vv.sssNetMgr.getLocalIndex(seatData[i].seatindex);
                    self.seatsCom.seatComs[index].setCountdown(lastTime);
                    self.gameSeatsCom.seatComs[index].setCountdown(lastTime);
                }
            }
        }
    },

    limitLogin:function(data){
        var self = this;
        cc.vv.sssNetMgr.roomId = null;
        cc.vv.alert.show("返回大厅","您的账号在异地登录！",function(){
            cc.vv.wc.show('正在返回游戏大厅');
            self.removeHandler();
            cc.director.loadScene("hall"); 
        },false);
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
    update: function (dt) {
        var minutes = Math.floor(Date.now()/1000/60);
        if(this._lastMinute != minutes){
            this._lastMinute = minutes;
            var date = new Date();
            var h = date.getHours();
            h = h < 10? "0"+h:h;
            
            var m = date.getMinutes();
            m = m < 10? "0"+m:m;
            this._timeLabel.string = "" + h + ":" + m;             
        }
        
        
        if(this._lastPlayTime != null){
            if(Date.now() > this._lastPlayTime + 200){
                this.onPlayerOver();
                this._lastPlayTime = null;    
            }
        }
        else{
            this.playVoice();
        }

        
},
    
        
    onPlayerOver:function(){
        cc.vv.audioMgr.resumeAll();
        console.log("onPlayCallback:" + this._playingSeat);
        var localIndex = this._playingSeat;
        this._playingSeat = null;
        this.seatsCom.seatComs[localIndex].voiceMsg(false);
        this.gameSeatsCom.seatComs[localIndex].voiceMsg(false);
    },
    
    onDestroy:function(){
        cc.vv.voiceMgr.stop();
//        cc.vv.voiceMgr.onPlayCallback = null;
    }
});


