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
        _gameover:null,
        _gameresult:null,
        _seats:[],
        _isGameEnd:false,
        _pingju:null,
        _win:null,
        _lose:null,

    },

    // use this for initialization
    onLoad: function () {
        if(cc.vv == null){
            return;
        }
        if(cc.vv.sspNetMgr.conf == null){
            return;
        }
        this._gameover = this.node.getChildByName("game_over_xlch");
        
        this._gameover.active = false;
        
        this._pingju = this._gameover.getChildByName("pingju");
        this._win = this._gameover.getChildByName("win");
        this._lose = this._gameover.getChildByName("lose");
        
        this._gameresult = this.node.getChildByName("game_result");
        this.SSPTeXiaoAtlas = window.sspGame.SSPTeXiaoAtlas;
        
        
        var listRoot = this._gameover.getChildByName("result_list");
        for(var i = 1; i <= 4; ++i){
            var s = "s" + i;
            var sn = listRoot.getChildByName(s);
            sn.active = false;
            var viewdata = {};
            viewdata.username = sn.getChildByName('username').getComponent(cc.Label);
            viewdata.imgLoader = sn.getChildByName('Z_nobody').getComponent("ImageLoader");
            viewdata.reason = sn.getChildByName('reason').getComponent(cc.Label);
            
            viewdata.score = sn.getChildByName('score').getComponent(cc.Label);
            viewdata.hu = sn.getChildByName('hu');
            viewdata.mahjongs = sn.getChildByName('pai');
            viewdata.zhuang = sn.getChildByName('zhuang');
            viewdata.hupai = sn.getChildByName('hupai');
            viewdata.hupai.active = true;
            viewdata._pengandgang = [];
            this._seats.push(viewdata);
        }
        
        //初始化网络事件监听器
        var self = this;
        this.node.on('game_over',function(data){
            var detail = data.detail;
            var mySch =function(){ 
                self.onGameOver(detail);
             }
            self.scheduleOnce(mySch,2);
        });
        
        this.node.on('game_end',function(data){self._isGameEnd = true;});

        //初始化按钮监听事件
        var clickEventHandler = new cc.Component.EventHandler();
        clickEventHandler.target = this;
        clickEventHandler.component = "SSPGameOver";
        clickEventHandler.handler = "onBtnReadyClicked";
        clickEventHandler.customEventData = "foobar";

        var button = this._gameover.getChildByName("btnReady").getComponent(cc.Button);
        button.clickEvents.push(clickEventHandler);
    },
    
    onGameOver:function(data){
        console.log(data);
        var listRoot = this._gameover.getChildByName("result_list");
        for(var i = 1;i < data.length+1;i++){
            var s = "s" + i;
            var sn = listRoot.getChildByName(s);
            sn.active = true;
        }
        if(data.length == 0){
            this._gameresult.active = true;
            return;
        }
        this._gameover.active = true;
        this._pingju.active = false;
        this._win.active = false;
        this._lose.active = false;

        if (data[cc.vv.sspNetMgr.seatIndex]) {
            var myscore = data[cc.vv.sspNetMgr.seatIndex].singleScore;
        }
        else {
            var myscore = 0;
        }
        if(myscore && myscore > 0){
            this._win.active = true;
        }         
        else if(myscore < 0){
            this._lose.active = true;
        }
        else{
            this._pingju.active = true;
        }
            
        //显示玩家信息
        var seats = cc.vv.sspNetMgr.seats;
        for(var i = 0; i < seats.length; ++i){
            if (seats[i].userid === 0) {
                continue;
            }
            var seatView = this._seats[i];
            var userData = data[i];
            var hued = false;
            var actionArr = [];
            var is7pairs = false;
            var ischadajiao = false;
            var hupaiRoot = seatView.hupai;
            
            for(var j = 0; j < hupaiRoot.children.length; ++j){
                hupaiRoot.children[j].active = false;
            }
            
            var hi = 0;
            if (!userData) {
                continue;
            }
            if(userData.type && userData.type != 'draw'){
                seatView.hu.active = true;
            }
            else{
                seatView.hu.active = false;
            }
            var playerName = cc.vv.sspNetMgr.seats[i].name;
            var len = playerName.length;
            if (len > 4) {
                var str = playerName.substring(0,4);
                seatView.username.string = str + '...';
            }
            else {
                seatView.username.string = playerName;
            }
            if(seatView.imgLoader && cc.vv.sspNetMgr.seats[i].userid){
                seatView.imgLoader.setUserID(cc.vv.sspNetMgr.seats[i].userid);
            }
            seatView.zhuang.active = cc.vv.sspNetMgr.button == i;
            seatView.reason.string = actionArr.join("、");
            
            if(userData.singleScore > 0){
                seatView.score.string = "+" + userData.singleScore;    
            }
            else{
                seatView.score.string = userData.singleScore;
            }
           
            //隐藏所有牌
            for(var k = 0; k < seatView.mahjongs.childrenCount; ++k){
                var n = seatView.mahjongs.children[k];
                n.setPosition(k*62,0);
                n.active = false;
                var jin = n.getChildByName("yinlong");
                if(jin){
                    n.getChildByName("yinlong").active = false;
                    n.getChildByName("jinlong").active = false;
                    n.getChildByName("suokuang").active = false;
                }
            }
            seatView.hupai.active = false;
            cc.find("Canvas/game_over_xlch/result_list/s1/hupai").active = true;
            cc.find("Canvas/game_over_xlch/result_list/s2/hupai").active = true;
            cc.find("Canvas/game_over_xlch/result_list/s3/hupai").active = true;
            cc.find("Canvas/game_over_xlch/result_list/s4/hupai").active = true;
            
            if(userData.holds){
                cc.vv.SSPMgr.sortSSPF(userData.holds.holds);
            }

            if(!userData.type || userData.type === 'draw'){ //没胡的人
                var ziTi = "";
                var num = 0;
                var clearance = 0;//每个吃碰杠之间的间隙之和
                //显示相关的牌
                for(var k = 0; k < userData.liangPai.length; ++k){
                    cc.vv.SSPMgr.sortSSPF(userData.liangPai[k].pai);
                    clearance += 20;
                    for(var l = 0;l < userData.liangPai[k].pai.length;l++){
                        var pai = userData.liangPai[k].pai[l];
                        var n = seatView.mahjongs.children[num];
                        if(n){
                            n.setPosition(n.x+clearance,n.y);
                            n.active = true;
                            var sprite = n.getComponent(cc.Sprite);
                            sprite.spriteFrame = cc.vv.SSPMgr.getSpriteFrameByPai("M_",pai);
                            num++;
                        }
                    }

                    if(userData.liangPai[k].type == "kaiYinLong"){
                        if(num === 3){
                            continue;
                        }
                        seatView.mahjongs.children[num-1].getChildByName("yinlong").active = true;
                        if(ziTi == "金龙"){
                            ziTi = "金龙";
                        }
                        else{
                            ziTi = "银龙";
                        }
                    }
                    else if(userData.liangPai[k].type == "jinLong"){
                        seatView.mahjongs.children[num-1].getChildByName("jinlong").active = true;
                        ziTi = "金龙";
                    }
                }
                seatView.reason.string = ziTi;
                if(ziTi == "银龙"){
                    seatView.hu.active = true;
                    seatView.hu.getComponent(cc.Sprite).spriteFrame = this.SSPTeXiaoAtlas.getSpriteFrame("yinlong1");
                }
                if(ziTi == "金龙"){
                    seatView.hu.active = true;
                    seatView.hu.getComponent(cc.Sprite).spriteFrame = this.SSPTeXiaoAtlas.getSpriteFrame("jinlong1");
                }
                clearance += 20;
                for(var k = 0; k < userData.holds.holds.length; ++k){
                    var pai = userData.holds.holds[k];
                    var n = seatView.mahjongs.children[num];
                    if(n){
                        n.setPosition(n.x+clearance,n.y)
                        n.active = true;
                        var sprite = n.getComponent(cc.Sprite);
                        sprite.spriteFrame = cc.vv.SSPMgr.getSpriteFrameByPai("M_",pai);
                        num++;
                    }
                }

                var arrSuopaiIndex = [];
                 
                
                for(var m = 0;m < userData.holds.longPai.length;m++){//获取所有锁牌的index
                    var suopai = userData.holds.longPai[m];
                    for(var k = 0; k < userData.holds.holds.length; ++k){
                        var pai = userData.holds.holds[k];
                        if(pai.type === suopai[0].type && pai.value === suopai[0].value){
                            arrSuopaiIndex.push(k);
                            break;
                        }
                    } 
                }

                if(arrSuopaiIndex){//如果有锁牌
                    for(var m = 0;m < arrSuopaiIndex.length;m++){
                        var liangpaiNum = 0;
                        for(var p = 0;p < userData.liangPai.length;p++){
                            liangpaiNum += userData.liangPai[p].pai.length;
                        }
                        var num = arrSuopaiIndex[m] + liangpaiNum + 3;
                        if(seatView.mahjongs.children[num]){
                            seatView.mahjongs.children[num].getChildByName("suokuang").active = true;
                        }
                    }
                }
                
            }
            else{  //胡的人
                var huType = "   ";
                if(userData.type === 'daHu'){
                    huType = "   (大胡)";
                }
                else if(userData.type === 'diHu'){
                    huType = "   (地胡)";
                }
                else if(userData.type === 'tianHu'){
                    huType = "   (天胡)";
                }
                else if(userData.type === 'yifanHu'){
                    huType = "   (一番胡)";
                }
                var ziTi = null;
                if(userData.score.yinLongFan > 0 && userData.score.jinLongFan > 0){
                    ziTi = "[番X" + userData.score.fan + "   金龙X" + userData.score.jinLongFan + "   银龙X" + userData.score.yinLongFan
                     + "   底X3]X"+userData.multiple+huType;
                }
                else if(userData.score.yinLongFan > 0 && userData.score.jinLongFan <= 0){
                    ziTi = "[番X" + userData.score.fan + "   银龙X" + userData.score.yinLongFan
                     + "   底X3]X"+userData.multiple+huType;
                }
                else if(userData.score.jinLongFan > 0 && userData.score.yinLongFan <= 0){
                    ziTi = "[番X" + userData.score.fan + "   金龙X" + userData.score.jinLongFan
                     + "   底X3]X"+userData.multiple+huType;
                }
                else{
                    ziTi = "番X" + userData.score.fan + "   底X3"+huType;
                }

                var clearance = 0;//每个吃碰杠之间的间隙之和
                seatView.reason.string = ziTi;
                if(userData.type === 'pingHu'){
                    seatView.hu.getComponent(cc.Sprite).spriteFrame = this.SSPTeXiaoAtlas.getSpriteFrame("pinghu");
                }
                else if(userData.type === 'daHu'){
                    seatView.hu.getComponent(cc.Sprite).spriteFrame = this.SSPTeXiaoAtlas.getSpriteFrame("dahu1");
                }
                else if(userData.type === 'diHu'){
                    seatView.hu.getComponent(cc.Sprite).spriteFrame = this.SSPTeXiaoAtlas.getSpriteFrame("dihu");
                }
                else if(userData.type === 'tianHu'){
                    seatView.hu.getComponent(cc.Sprite).spriteFrame = this.SSPTeXiaoAtlas.getSpriteFrame("tianhu");
                }
                else if(userData.type === 'yifanHu'){
                    seatView.hu.getComponent(cc.Sprite).spriteFrame = this.SSPTeXiaoAtlas.getSpriteFrame("yufanhu1");
                }
                var num = 0;
                //显示相关的牌
                for(var k = 0; k < userData.liangPai.length; ++k){
                    cc.vv.SSPMgr.sortSSPF(userData.liangPai[k].pai);
                    clearance += 20;
                    for(var l = 0;l < userData.liangPai[k].pai.length;l++){
                        var pai = userData.liangPai[k].pai[l];
                        var n = seatView.mahjongs.children[num];
                        if(n){
                            n.setPosition(n.x+clearance,n.y);
                            n.active = true;
                            var sprite = n.getComponent(cc.Sprite);
                            sprite.spriteFrame = cc.vv.SSPMgr.getSpriteFrameByPai("M_",pai);
                            num++;
                        } 
                    }
                    if(userData.liangPai[k].type == "kaiYinLong"){
                        if(num === 3){
                            continue;
                        }
                        seatView.mahjongs.children[num-1].getChildByName("yinlong").active = true;
                    }
                    else if(userData.liangPai[k].type == "jinLong"){
                        seatView.mahjongs.children[num-1].getChildByName("jinlong").active = true;
                    }
                }

                clearance += 20;
                for(var k = 0; k < userData.holds.holds.length; ++k){
                    var pai = userData.holds.holds[k];
                    var n = seatView.mahjongs.children[num];
                    if(n){
                        n.setPosition(n.x+clearance,n.y)
                        n.active = true;
                        var sprite = n.getComponent(cc.Sprite);
                        sprite.spriteFrame = cc.vv.SSPMgr.getSpriteFrameByPai("M_",pai);
                        num++;
                    }
                }

                var arrSuopaiIndex = [];
                for(var m = 0;m < userData.holds.longPai.length;m++){//获取所有锁牌的index
                    var suopai = userData.holds.longPai[m];
                    for(var k = 0; k < userData.holds.holds.length; ++k){
                        var pai = userData.holds.holds[k];
                        if(pai.type === suopai[0].type && pai.value === suopai[0].value){
                            arrSuopaiIndex.push(k);
                            break;
                        }
                    } 
                }

                if(arrSuopaiIndex){//如果有锁牌
                    for(var m = 0;m < arrSuopaiIndex.length;m++){
                        var liangpaiNum = 0;
                        for(var p = 0;p < userData.liangPai.length;p++){
                            liangpaiNum += userData.liangPai[p].pai.length;
                        }
                        var num = arrSuopaiIndex[m] + liangpaiNum + 3;
                        if(seatView.mahjongs.children[num]){
                            seatView.mahjongs.children[num].getChildByName("suokuang").active = true;
                        }
                    }
                }

                if(userData.type !== 'tianHu'){
                    var hupaiView = hupaiRoot.children[0]; 
                    hupaiView.active = true;
                    hupaiView.getComponent(cc.Sprite).spriteFrame = cc.vv.SSPMgr.getSpriteFrameByPai("M_",userData.huPai);
                }
            }      
            
            for(var k = 0; k < seatView._pengandgang.length; ++k){
                seatView._pengandgang[k].active = false;
            }
        }
    },
    
    onBtnReadyClicked:function(event){
        console.log("onBtnReadyClicked");
        this._gameover.active = false;
        if(this._isGameEnd){
            this._gameresult.active = true;
        }
        else{
            cc.vv.sspNet.send('next_game_data'); 
        }
        this._gameover.active = false; 
    },
    
    onBtnShareClicked:function(){
        console.log("onBtnShareClicked");
    }

});
