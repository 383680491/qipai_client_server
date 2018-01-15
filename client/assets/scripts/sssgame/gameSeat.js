var PaiType = require("define").PaiType;
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
        _offline:null,
        _lblName:null,
        _lblScore:null,
        _scoreBg:null,
        _nddayingjia:null,
        _voicemsg:null,
        
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
        this._lblScore = this.node.getChildByName('score').getComponent(cc.Label);
        this.imgLoader = this.node.getChildByName("headBox").getComponent("ImageLoader");
        this.zhuang = this.node.getChildByName("zhuang");
        this.comparPaiNode = this.node.getChildByName("comparPai");
        this.paiBei = this.node.getChildByName("paiBei");
        this.dankong = this.node.getChildByName("dankong");
        this.teshupaiNode = this.node.getChildByName("teshupai");
        this.teshupaixing = this.node.getChildByName("teshupaixing");
        this._voicemsg = this.node.getChildByName("voicemsg");
        this._ready = this.node.getChildByName('ready');
        this._headBox = this.node.getChildByName('headBox');
        this.touxiangkuang = this.node.getChildByName('touxiangkuang');


        this._offline = this.node.getChildByName("offline");
        this._offline.active = false;
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
            cc.vv.utils.addClickEvent(this.imgLoader,this.node,"gameSeat","onIconClicked");    
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

        this.arrTSPNode = [];
        this.arrPaiNode = [];
        this.arrNode = [];
        this.arrScoreNodeZ = [];
        this.arrScoreLabelZ = [];
        this.arrScoreNodeF = [];
        this.arrScoreLabelF = [];
        this.arrFuHaoNode = [];
        this.arrFuHaoSprite = [];
        this.arrTeXiaoNode = [];
        this.arrTeXiaoSprite = [];
        var PaiNode = ["tdPai","zdPai","wdPai"];
        for(var i = 0;i<PaiNode.length;i++){
            var Node = this.comparPaiNode.getChildByName(PaiNode[i]);
            var arrTemp = [];
            for(var j = 0; j < Node.childrenCount; j++){
                var pai = Node.getChildByName("pai"+j);
                arrTemp.push(pai);
            }
            Node.active = false;
            this.arrPaiNode.push(arrTemp);
            this.arrNode.push(Node);
        }

        var scoreNodeZ = this.comparPaiNode.getChildByName("zhengScore");
        for(var i = 0;i<scoreNodeZ.childrenCount;i++){
            var ScoreNode = scoreNodeZ.getChildByName("score"+i);
            var label = ScoreNode.getComponent(cc.Label);
            this.arrScoreNodeZ.push(ScoreNode);
            this.arrScoreLabelZ.push(label);
            ScoreNode.active = false;
        }

        var scoreNodeF = this.comparPaiNode.getChildByName("FuScore");
        for(var i = 0;i<scoreNodeF.childrenCount;i++){
            var ScoreNode = scoreNodeF.getChildByName("score"+i);
            var label = ScoreNode.getComponent(cc.Label);
            this.arrScoreNodeF.push(ScoreNode);
            this.arrScoreLabelF.push(label);
            ScoreNode.active = false;
        }

        var FuHaoNode = this.comparPaiNode.getChildByName("fuhao");
        for(var i = 0;i<FuHaoNode.childrenCount;i++){
            var Node = FuHaoNode.getChildByName("fuhao"+i);
            var Sprite = Node.getComponent(cc.Sprite);
            this.arrFuHaoNode.push(Node);
            this.arrFuHaoSprite.push(Sprite);
            Node.active = false;
        }

        var texiaoNode = this.comparPaiNode.getChildByName("texiao");
        for(var i = 0;i<texiaoNode.childrenCount;i++){
            var Node = texiaoNode.getChildByName("Texiao"+i);
            var Sprite = Node.getComponent(cc.Sprite);
            this.arrTeXiaoNode.push(Node);
            this.arrTeXiaoSprite.push(Sprite);
            Node.active = false;
        }

        for(let i = 0;i<this.teshupaiNode.childrenCount;i++){
            let Node = this.teshupaiNode.getChildByName("pai"+i);
            this.arrTSPNode.push(Node);
        }

        this.beShoot = this.node.getChildByName("beShoot");
        this.doShoot = this.node.getChildByName("doShoot");
        
        this.tdPB = this.paiBei.getChildByName("tdPai");
        this.zdPB = this.paiBei.getChildByName("zdPai");
        this.wdPB = this.paiBei.getChildByName("wdPai");
        this.beShoot.active = false;
        this.doShoot.active = false;
        this.teshupaiNode.active = false;

        this.tdPB.active = false;
        this.zdPB.active = false;
        this.wdPB.active = false;

        if(this.dankong){
            this.dankong.active = false;
        }

        if(this.zhuang){
            this.zhuang.active = false;
        }

        this.allScore = 0;
        this._ready.active = false;
        this._headBox.active = false;
        this.touxiangkuang.active = false;
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

    resetGameSeat:function(){
        for(let i = 0;i<this.arrScoreNodeZ.length;i++){
            this.arrScoreNodeZ[i].active = false;
        }
        for(let i = 0;i<this.arrScoreNodeF.length;i++){
            this.arrScoreNodeF[i].active = false;
        }
        for(let i = 0;i<this.arrFuHaoNode.length;i++){
            this.arrFuHaoNode[i].active = false;
        }
        for(let i = 0;i<this.arrTeXiaoNode.length;i++){
            this.arrTeXiaoNode[i].active = false;
        }
        for(let i = 0;i<this.arrScoreLabelZ.length;i++){
            this.arrScoreLabelZ[i].string = 0;
        }
        for(let i = 0;i<this.arrScoreLabelF.length;i++){
            this.arrScoreLabelF[i].string = 0;
        }

        for(let i = 0;i<this.arrNode.length;i++){
            this.arrNode[i].active = false;
        }
        this.beShoot.active = false;
        this.doShoot.active = false;
        this.teshupaiNode.active = false;
        this.teshupaixing.active = false;
        if(this.dankong){
            this.dankong.active = false;
        }
        if(this.zhuang){
            this.zhuang.active = false;
        }

        this.allScore = 0;
        this._ready.active = false;
        this._chatBubble.active = false;
        this._chatBubble.getComponent(cc.Label).string = '';
        this._chatBubble.getChildByName("New Label").getComponent(cc.Label).string = '';

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

    setOffline:function(isOffline){
        this._isOffline = isOffline;
        if(this._offline){
            this._offline.active = this._isOffline && this._userName != "";
        }
    },

    setTotalScore:function(data) {
        this._lblScore.string = data;
    },

    showTD:function(arrPai,score,paiType){
        this.allScore = 0;
        var arrPaiData = arrPai;
        for(var i = 0;i < this.arrPaiNode[0].length;i++){
            var paiNode = this.arrPaiNode[0][i];
            var paiCom = paiNode.getComponent("pai");
            paiCom.setInfo(arrPaiData[i]);
        }
        this.arrNode[0].active = true;
        if(score < 0){
            this.arrScoreNodeF[0].active = true;
            this.arrScoreNodeZ[0].active = false;
            this.arrScoreLabelF[0].string = score;
        }
        else{
            this.arrScoreNodeF[0].active = false;
            this.arrScoreNodeZ[0].active = true;
            this.arrScoreLabelZ[0].string = score;
        }
        if (paiType > 7) {
            //播放动画
        }
        this.arrFuHaoNode[0].active = true;
        this.arrTeXiaoNode[0].active = true;
        
        this.setFuHao(score,0);
        this.addAllScore(score);
        this.showAllScore();
        this.paiTexiaoTD(paiType);
        this.tdPB.active = false;

        cc.vv.audioMgr.playSFX("sssMusic/bipai.mp3");
    },
    showZD:function(arrPai,score,paiType){
        this.zdPB.active = false;
        cc.vv.audioMgr.playSFX("sssMusic/bipai.mp3");
        var arrPaiData = arrPai;
        for(var i = 0;i < this.arrPaiNode[1].length;i++){
            var paiNode = this.arrPaiNode[1][i];
            var paiCom = paiNode.getComponent("pai");
            paiCom.setInfo(arrPaiData[i]);
        }
        this.arrNode[1].active = true;
        if(score < 0){
            this.arrScoreNodeF[1].active = true;
            this.arrScoreNodeZ[1].active = false;
            this.arrScoreLabelF[1].string = score;
        }
        else{
            this.arrScoreNodeF[1].active = false;
            this.arrScoreNodeZ[1].active = true;
            this.arrScoreLabelZ[1].string = score;
        }
        this.arrFuHaoNode[1].active = true;
        this.arrTeXiaoNode[1].active = true;
        
        this.setFuHao(score,1);
        this.addAllScore(score);
        this.showAllScore();
        this.paiTexiaoZD(paiType);
    },
    showWD:function(arrPai,score,paiType){
        this.wdPB.active = false;
        cc.vv.audioMgr.playSFX("sssMusic/bipai.mp3");
        var arrPaiData = arrPai;
        for(var i = 0;i < this.arrPaiNode[2].length;i++){
            var paiNode = this.arrPaiNode[2][i];
            var paiCom = paiNode.getComponent("pai");
            paiCom.setInfo(arrPaiData[i]);
        }
        this.arrNode[2].active = true;
        if(score < 0){
            this.arrScoreNodeF[2].active = true;
            this.arrScoreNodeZ[2].active = false;
            this.arrScoreLabelF[2].string = score;
        }
        else{
            this.arrScoreNodeF[2].active = false;
            this.arrScoreNodeZ[2].active = true;
            this.arrScoreLabelZ[2].string = score;
        }
        this.arrFuHaoNode[2].active = true;
        this.arrTeXiaoNode[2].active = true;
        this.setFuHao(score,2);
        this.addAllScore(score);
        this.showAllScore();
        this.paiTexiaoWD(paiType);
    },

    //改变符号
    setFuHao:function(Score,Index){
        var shuzi = window.sssGame.shuzi;
        if(Score < 0){
            var spriteFrame = shuzi.getSpriteFrame("fuhao");
            this.arrFuHaoSprite[Index].spriteFrame = spriteFrame;
        }
        else{
            var spriteFrame = shuzi.getSpriteFrame("zhenghao");
            this.arrFuHaoSprite[Index].spriteFrame = spriteFrame;
        }
    },

    paiTexiaoTD:function(paiType){
        var paiTexiao = window.sssGame.paiTexiao;
        var paiName = "texiao_"+paiType;
        var spriteFrame = paiTexiao.getSpriteFrame(paiName);
        var animation = window.sssGame.Animation;
        if(paiType == 9){
            this.arrTeXiaoNode[0].setContentSize(82.5,35);
        }
        else{
            this.arrTeXiaoNode[0].setContentSize(55,35);
        }
        this.arrTeXiaoSprite[0].spriteFrame = spriteFrame;

        if (paiType > 7) {
            var paiGuangS = animation.paiguangS;
            paiGuangS.active = true;
            var pos = this.arrTeXiaoNode[0].getPosition();
            var worldPos = this.arrTeXiaoNode[0].parent.convertToWorldSpaceAR(pos);
            var animNode = window.sssGame.AnimationNode;
            var guangPos = animNode.convertToNodeSpaceAR(worldPos);
            paiGuangS.setPosition(guangPos);
            paiGuangS.getComponent(cc.Animation).play();
        }
        var audioUrl = "sssMusic/" + "texiao/" + paiType + ".mp3"
        cc.vv.audioMgr.playSFX(audioUrl);
    },
    paiTexiaoZD:function(paiType){
        var paiTexiao = window.sssGame.paiTexiao;
        var paiName = "texiao_"+paiType;
        var spriteFrame = paiTexiao.getSpriteFrame(paiName);
        var animation = window.sssGame.Animation;
        if(paiType == 12 || paiType == 15 || paiType == 16){
            this.arrTeXiaoNode[1].setContentSize(110,35);
        }
        else if(paiType == 13){
            this.arrTeXiaoNode[1].setContentSize(137.5,35);
        }
        else if(paiType == 9){
            this.arrTeXiaoNode[1].setContentSize(82.5,35);
        }
        else{
            this.arrTeXiaoNode[1].setContentSize(55,35);
        }
        this.arrTeXiaoSprite[1].spriteFrame = spriteFrame;

        if (paiType === 8 || paiType === 10) {
            var paiGuangS = animation.paiguangS;
            paiGuangS.active = true;
            var pos = this.arrTeXiaoNode[1].getPosition();
            var worldPos = this.arrTeXiaoNode[1].parent.convertToWorldSpaceAR(pos);
            var animNode = window.sssGame.AnimationNode;
            var guangPos = animNode.convertToNodeSpaceAR(worldPos);
            paiGuangS.setPosition(guangPos);
            paiGuangS.getComponent(cc.Animation).play();
        }
        else if(paiType === 9 || paiType === 11) {
            var paiGuangM = animation.paiguangM;
            paiGuangM.active = true;
            var pos = this.arrTeXiaoNode[1].getPosition();
            var worldPos = this.arrTeXiaoNode[1].parent.convertToWorldSpaceAR(pos);
            var animNode = window.sssGame.AnimationNode;
            var guangPos = animNode.convertToNodeSpaceAR(worldPos);
            paiGuangM.setPosition(guangPos);
            paiGuangM.getComponent(cc.Animation).play();
        }
        else if(paiType > 12) {
            var paiGuangL = animation.paiguangL;
            paiGuangL.active = true;
            var pos = this.arrTeXiaoNode[1].getPosition();
            var worldPos = this.arrTeXiaoNode[1].parent.convertToWorldSpaceAR(pos);
            var animNode = window.sssGame.AnimationNode;
            var guangPos = animNode.convertToNodeSpaceAR(worldPos);
            paiGuangL.setPosition(guangPos);
            paiGuangL.getComponent(cc.Animation).play();
        }
        var audioUrl = "sssMusic/" + "texiao/" + paiType + ".mp3"
        cc.vv.audioMgr.playSFX(audioUrl);
    },
    paiTexiaoWD:function(paiType){
        var paiTexiao = window.sssGame.paiTexiao;
        var paiName = "texiao_"+paiType;
        var spriteFrame = paiTexiao.getSpriteFrame(paiName);
        var animation = window.sssGame.Animation;
        if(paiType == 9){
            this.arrTeXiaoNode[2].setContentSize(82.5,35);
        }
        else{
            this.arrTeXiaoNode[2].setContentSize(55,35);
        }
        this.arrTeXiaoSprite[2].spriteFrame = spriteFrame;

        if (paiType === 8 || paiType === 10) {
            var paiGuangS = animation.paiguangS;
            paiGuangS.active = true;
            var pos = this.arrTeXiaoNode[2].getPosition();
            var worldPos = this.arrTeXiaoNode[2].parent.convertToWorldSpaceAR(pos);
            var animNode = window.sssGame.AnimationNode;
            var guangPos = animNode.convertToNodeSpaceAR(worldPos);
            paiGuangS.setPosition(guangPos);
            paiGuangS.getComponent(cc.Animation).play();
        }
        else if (paiType === 9 || paiType === 11) {
            var paiGuangM = animation.paiguangM;
            paiGuangM.active = true;
            var pos = this.arrTeXiaoNode[2].getPosition();
            var worldPos = this.arrTeXiaoNode[2].parent.convertToWorldSpaceAR(pos);
            var animNode = window.sssGame.AnimationNode;
            var guangPos = animNode.convertToNodeSpaceAR(worldPos);
            paiGuangM.setPosition(guangPos);
            paiGuangM.getComponent(cc.Animation).play();
        }
        var audioUrl = "sssMusic/" + "texiao/" + paiType + ".mp3"
        cc.vv.audioMgr.playSFX(audioUrl);
    },
    showShoot:function(bShoot,index0,index1){
        var self = this;
        // 打枪
        var animation = window.sssGame.Animation;
        if(bShoot){
            cc.vv.audioMgr.playSFX("sssMusic/daqiang.mp3");
            var qiang = animation.daqiang;
            qiang.active = true;
            this.setQiangDir(qiang,index0,index1);
            this.setDaQiangPosition(qiang,index0);
            qiang.getComponent(cc.Animation).play('daqiang');
            cc.vv.audioMgr.playSFX("sssMusic/daqiangsheng.mp3");
        }
        else if(!bShoot){
            var keng = animation.dankeng;
            keng.active = true;
            this.setDaQiangPosition(keng,index1);
            keng.getComponent(cc.Animation).play('dangkeng');
            this.kong =function(){
                self.dankong.active = true;
            }
            this.scheduleOnce(this.kong,0.58);
        }
    },

    //改变打枪动画位置
    setDaQiangPosition:function(qiangA,index){
        if (cc.vv.sssNetMgr.wanfa === 1) {
            if(index === 0){
                qiangA.setPosition(-120,-160);
            }
            else if(index === 1){
                qiangA.setPosition(320,0);
            }
            else if(index === 2){
                qiangA.setPosition(-50,150);
            }
            else if(index === 3){
                qiangA.setPosition(-410,0);
            }            
        }
        else {
            if(index === 0){                
                qiangA.setPosition(-33,-141);
            }
            else if(index === 5){
                qiangA.setPosition(375,-141);
            }
            else if(index === 3){
                qiangA.setPosition(375,190);
            }
            else if(index === 1){
                qiangA.setPosition(-33,190);
            }
            else if(index === 2){
                qiangA.setPosition(-487,190);
            }
            else if(index === 4){
                qiangA.setPosition(-487,-141);
            }
        }
            
    },

    //改变枪方向
    setQiangDir:function(qiangA,index0,index1){
        if (cc.vv.sssNetMgr.wanfa === 1) {
            if(index0 === 0){
                if(index1 === 1 ){
                    qiangA.setScale(-1,1);
                    qiangA.setRotation(30);
                }
                else if(index1 === 2){
                    qiangA.setScale(-1,1);
                    qiangA.setRotation(-20);
                }
                else if(index1 === 3){
                    qiangA.setScale(1,1);
                    qiangA.setRotation(-20);
                }
            }
            else if(index0 === 1){
                if(index1 === 0){
                    qiangA.setScale(1,1);
                    qiangA.setRotation(-80);
                }
                else if(index1 === 2){
                    qiangA.setScale(1,1);
                    qiangA.setRotation(-20);
                }
                else if(index1 === 3){
                    qiangA.setScale(1,1);
                    qiangA.setRotation(-40);
                }
            }
            else if(index0 === 2){
                if(index1 === 0 ){
                    qiangA.setScale(1,1);
                    qiangA.setRotation(-120);
                }
                else if(index1 === 1){
                    qiangA.setScale(-1,1);
                    qiangA.setRotation(70);
                }
                else if(index1 === 3){
                    qiangA.setScale(1,1);
                    qiangA.setRotation(-70);
                }
            }
            else if(index0 === 3){
                if(index1 === 0 ){
                    qiangA.setScale(-1,1);
                    qiangA.setRotation(90);
                }
                else if(index1 === 1){
                    qiangA.setScale(-1,1);
                    qiangA.setRotation(40);
                }
                else if(index1 === 2){
                    qiangA.setScale(-1,1);
                    qiangA.setRotation(20);
                }
            }
        }
        else {
            if(index0 == 0){
                if(index1 == 1){
                    qiangA.setScale(1,1);
                    qiangA.setRotation(40);
                }
                else if(index1 == 2){
                    qiangA.setScale(1,1);
                    qiangA.setRotation(0);
                }
                else if(index1 == 3){
                    qiangA.setScale(-1,1);
                    qiangA.setRotation(0);
                }
                else if(index1 == 4){
                    qiangA.setScale(1,1);
                    qiangA.setRotation(-40);
                }
                else if(index1 == 5){
                    qiangA.setScale(-1,1);
                    qiangA.setRotation(40);
                }
            }
            else if(index0 == 1){
                if(index1 == 0){
                    qiangA.setScale(1,1);
                    qiangA.setRotation(-140);
                }
                else if(index1 == 2){
                    qiangA.setScale(1,1);
                    qiangA.setRotation(-40);
                }
                else if(index1 == 3){
                    qiangA.setScale(-1,1);
                    qiangA.setRotation(40);
                }
                else if(index1 == 4){
                    qiangA.setScale(1,1);
                    qiangA.setRotation(-80);
                }
                else if(index1 == 5){
                    qiangA.setScale(-1,1);
                    qiangA.setRotation(90);
                }
            }
            else if(index0 == 2){
                if(index1 == 0 || index1 == 5){
                    qiangA.setScale(-1,1);
                    qiangA.setRotation(90);
                }
                else if(index1 == 1 || index1 == 3){
                    qiangA.setScale(-1,1);
                    qiangA.setRotation(40);
                }
                else if(index1 == 4){
                    qiangA.setScale(1,1);
                    qiangA.setRotation(-140);
                }
            }
            else if(index0 == 3){
                if(index1 == 0 || index1 == 4){
                    qiangA.setScale(1,1);
                    qiangA.setRotation(-80);
                }
                else if(index1 == 1 || index1 == 2){
                    qiangA.setScale(1,1);
                    qiangA.setRotation(-40);
                }
                else if(index1 == 5){
                    qiangA.setScale(1,1);
                    qiangA.setRotation(-140);
                }
            }
            else if(index0 == 4){
                if(index1 == 0 || index1 == 5){
                    qiangA.setScale(-1,1);
                    qiangA.setRotation(40);
                }
                else if(index1 == 1 || index1 == 3){
                    qiangA.setScale(-1,1);
                    qiangA.setRotation(0);
                }
                else if(index1 == 2){
                    qiangA.setScale(1,1);
                    qiangA.setRotation(40);
                }
            }
            else if(index0 == 5){
                if(index1 == 0 || index1 == 4){
                    qiangA.setScale(1,1);
                    qiangA.setRotation(-40);
                }
                else if(index1 == 1 || index1 == 2){
                    qiangA.setScale(1,1);
                    qiangA.setRotation(0);
                }
                else if(index1 == 3){
                    qiangA.setScale(1,1);
                    qiangA.setRotation(40);
                }
            }
        }
        
    },

    paibei:function(len){
        this.tdPB.active = true;
        this.zdPB.active = true;
        this.wdPB.active = true;
        if(len === 13)
        {
            this.teshupaixing.active = true;
        }
    },
    addAllScore:function(score){
        this.allScore += score; 
    },
    setAllScore:function(score){
        this.allScore = score; 
        this.showAllScore();
    },
    showAllScore:function(){
        if(this.allScore < 0){
            this.arrScoreNodeF[3].active = true;
            this.arrScoreNodeZ[3].active = false;
            this.arrScoreLabelF[3].string = this.allScore;
        }
        else{
            this.arrScoreNodeF[3].active = false;
            this.arrScoreNodeZ[3].active = true;
            this.arrScoreLabelZ[3].string = this.allScore;
        }
        this.arrFuHaoNode[3].active = true;
        
        this.setFuHao(this.allScore,3);
    },

    showSpecialResult:function(holds,type){
        for(let i = 0;i<this.arrTSPNode.length;i++){
            var paiCom = this.arrTSPNode[i].getComponent("pai");
            paiCom.setInfo(holds[i]);
        }

        this.teshupaiNode.active = true;
        this.tdPB.active = false;
        this.zdPB.active = false;
        this.wdPB.active = false;
        this.teshupaixing.active = false;

        var animation = window.sssGame.Animation;
        if(type == PaiType.STH)
        {
            animation.santonghua.active = true;
            animation.santonghua.getComponent(cc.Animation).play('santonghua');
            cc.vv.audioMgr.playSFX("sssMusic/santonghua.mp3");
        }
        else if(type == PaiType.SSZ)
        {
            animation.sanshunzi.active = true;
            animation.sanshunzi.getComponent(cc.Animation).play('sanshunzi');
            cc.vv.audioMgr.playSFX("sssMusic/sanshunzi.mp3");
        }
        else if(type == PaiType.LDB)
        {
            animation.liuduiban.active = true;
            animation.liuduiban.getComponent(cc.Animation).play('luiduiban');
            cc.vv.audioMgr.playSFX("sssMusic/luiduiban.mp3");
        }
        else if(type == PaiType.QX)
        {
            animation.quanxiao.active = true;
            animation.quanxiao.getComponent(cc.Animation).play('quanxiao');
            cc.vv.audioMgr.playSFX("sssMusic/quanxiao.mp3");
        }
        else if(type == PaiType.QD)
        {
            animation.quanda.active = true;
            animation.quanda.getComponent(cc.Animation).play('quanda');
            cc.vv.audioMgr.playSFX("sssMusic/quanda.mp3");
        }
        else if(type == PaiType.CYS)
        {
            animation.cuoyise.active = true;
            animation.cuoyise.getComponent(cc.Animation).play('cuoyise');
            cc.vv.audioMgr.playSFX("sssMusic/cuoyise.mp3");
        }
        else if(type == PaiType.SFTX)
        {
            animation.sanfentianxia.active = true;
            animation.sanfentianxia.getComponent(cc.Animation).play('sanfentianxia');
            cc.vv.audioMgr.playSFX("sssMusic/sanfentianxia.mp3");
        }
        else if(type == PaiType.STHS)
        {
            animation.santonghuashun.active = true;
            animation.santonghuashun.getComponent(cc.Animation).play('santonghuashun');
            cc.vv.audioMgr.playSFX("sssMusic/santonghuashun.mp3");
        }
        else if(type == PaiType.YTL)
        {
            animation.long.active = true;
            animation.long.getComponent(cc.Animation).play('long');
            cc.vv.audioMgr.playSFX("sssMusic/long.mp3");
        }
        else if(type == PaiType.ZZQL)
        {
            animation.zzlong.active = true;
            animation.zzlong.getComponent(cc.Animation).play('long');
            cc.vv.audioMgr.playSFX("sssMusic/zzlong.mp3");
        }
        else if(type == PaiType.TZP)
        {
            animation.tezhi.active = true;
            animation.tezhi.getComponent(cc.Animation).play('teizhi');
            cc.vv.audioMgr.playSFX("sssMusic/tiezi.mp3");
        }
        else if(type == PaiType.THSBD)
        {
            animation.tonghuashun.active = true;
            animation.tonghuashun.getComponent(cc.Animation).play('tonghuashun');
            cc.vv.audioMgr.playSFX("sssMusic/tonghuashun.mp3");
        }
        else if(type == PaiType.WTZ)
        {
            animation.wutong.active = true;
            animation.wutong.getComponent(cc.Animation).play('wutong');
            cc.vv.audioMgr.playSFX("sssMusic/wutong.mp3");
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
        }
        this.setCountdown(this.lixianTime);
    },
});
