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
    },

    // use this for initialization
    onLoad: function () {
        if(!cc.vv){
            return;
        }
        
        var gameChild = this.node.getChildByName("game");
        var myself = gameChild.getChildByName("myself");
        var pengangroot = myself.getChildByName("penggangs");
        var realwidth = cc.director.getVisibleSize().width;
        var scale = realwidth / 1280;
        pengangroot.scaleX *= scale;
        pengangroot.scaleY *= scale;
        
        var self = this;
        this.node.on('liangPai_notify',function(data){
            var data = data.detail;
            if(data.type != "dan"){
                var seatData = data.seatData;
                var redundantPai = data.redundantPai;//多出来的那张牌
                self.onPengGangChanged(seatData,data.type,redundantPai);
            }
            else{
                var mySch =function(){ 
                    var seatData = data.seatData;
                    var redundantPai = data.redundantPai;//多出来的那张牌
                    self.onPengGangChanged(seatData,data.type,redundantPai);
                }
                self.scheduleOnce(mySch,1.0);
            }
        });
        this.node.on('liangPaiJinlong_notify',function(data){
            var data = data.detail;
            var seatData = data.seatData;
            self.onPengGangChanged(seatData,data.type);
        });
        
        this.node.on('game_begin',function(data){
            self.onGameBein();
        });
        
        var seats = cc.vv.sspNetMgr.seats;
        for(var i in seats){
            this.onPengGangChanged(seats[i]);
        }

        this.m_paiLen = 0;//玩家吃碰杠 当前的长度
        this.r_paiLen = 0;
        this.u_paiLen = 0;
        this.l_paiLen = 0;

        this.deviationL = 0;//光标的偏差
        this.deviationR = 0;
        this.deviationU = 0;
        this.deviationM = 0;

        this.initView();
    },

    initView:function(){
        this._folds = {};
        var game = this.node.getChildByName("game");
        var sides = ["myself","right","up","left"];
        for(var i = 0; i < sides.length; ++i){
            var sideName = sides[i];
            var sideRoot = game.getChildByName(sideName);
            var folds = [];
            var foldRoot = sideRoot.getChildByName("folds");
            for(var j = 0; j < foldRoot.children.length; ++j){
                var n = foldRoot.children[j];
                n.active = false;
                var sprite = n.getComponent(cc.Sprite); 
                if (j != foldRoot.children.length-1) {
                    sprite.spriteFrame = null; 
                } 
                else {
                    sprite.node.active = true;
                    var moveUp = cc.moveBy(1,cc.p(0,10));
                    var moveDown = cc.moveBy(1,cc.p(0,-10));
                    var seq = cc.sequence(moveUp,moveDown);
                    sprite.node.runAction(cc.repeatForever(seq));
                }
                folds.push(sprite);            
            }
            this._folds[sideName] = folds; 
        }
        
        this.hideAllFolds();
        
        for(var j = 0; j < 4; j++){
            if(j == 0){
                var n = cc.find("Canvas/game/promptM");
            }
            else if(j == 1){
                var n = cc.find("Canvas/game/promptR");
            }
            else if(j == 2){
                var n = cc.find("Canvas/game/promptU");
            }
            else if(j == 3){
                var n = cc.find("Canvas/game/promptL");
            }
            n.active = false;
            var sprite = n.getComponent(cc.Sprite); 
            sprite.node.active = true;
            var moveUp = cc.moveBy(1,cc.p(0,10));
            var moveDown = cc.moveBy(1,cc.p(0,-10));
            var seq = cc.sequence(moveUp,moveDown);
            sprite.node.runAction(cc.repeatForever(seq));

            if(j == 0){
                this.promptM = sprite;
            }
            else if(j == 1){
                this.promptR = sprite;
            }    
            else if(j == 2){
                this.promptU = sprite;
            } 
            else if(j == 3){
                this.promptL = sprite;
            }     
        }
    },
    
    hideAllFolds:function(){
        for(var k in this._folds){
            var f = this._folds[i];
            for(var i in f){
                f[i].node.active = false;
            }
        }
    },
    
    onGameBein:function(){
        this.hideSide("myself");
        this.hideSide("right");
        this.hideSide("up");
        this.hideSide("left");
    },
    
    hideSide:function(side){
        var gameChild = this.node.getChildByName("game");
        var myself = gameChild.getChildByName(side);
        var pengangroot = myself.getChildByName("penggangs");
        if(pengangroot){
            for(var i = 0; i < pengangroot.childrenCount; ++i){
                pengangroot.children[i].active = false;
            }            
        }
    },
    
    onPengGangChanged:function(seatData,type,redundantPai){
        
        if(seatData.liangPai == null){
            return;
        }
        var tempIndex = cc.vv.sspNetMgr.getLocalIndexByIndex(seatData.seatindex);
        var localIndex = cc.vv.sspNetMgr.getShowIndexByIndex(tempIndex);
        var side = cc.vv.SSPMgr.getSide(localIndex);
        var pre = cc.vv.SSPMgr.getFoldPre(localIndex);
       
        console.log("onPengGangChanged" + localIndex);
            
        var gameChild = this.node.getChildByName("game");
        var myself = gameChild.getChildByName(side);
        var pengangroot = myself.getChildByName("penggangs");

        for(var i = 0; i < pengangroot.childrenCount; ++i){
            pengangroot.children[i].active = false;
        }
        

        var pgroot = null;
        if(side == "left" || side == "right"){
            pgroot = cc.instantiate(cc.vv.SSPMgr.pengPrefabLeft);
        }
        else{
            pgroot = cc.instantiate(cc.vv.SSPMgr.pengPrefabSelf);
        }
        var sprites = pgroot.getComponentsInChildren(cc.Sprite);
        this.sprites = sprites;
        for(var i = 0;i < sprites.length;i++){
            sprites[i].node.active = false;
        }

        var index = 0;
        var liangpais = seatData.liangPai;
        if(liangpais){
            for(var i = 0; i < liangpais.length; ++i){
                if(liangpais[i].pai){
                    var sspid = liangpais[i].pai;
                }
                else{
                    var sspid = liangpais[i];
                }
                
                if(sspid){
                    cc.vv.SSPMgr.sortSSPF(sspid);//排序
                }

                if(liangpais[i-1]){
                    if(liangpais[i-1].pai){
                        this.BeforeLen = liangpais[i-1].pai.length; //前一个吃碰杠的长度
                    }
                    else{
                        this.BeforeLen = liangpais[i-1].length; //前一个吃碰杠的长度
                    }
                }
                var TYPE = null;
                if(liangpais[i].type && liangpais[i].type === "jinLong"){//牌的长度
                    TYPE = "jinlong";
                }
                else if(sspid.length === 4 && i < seatData.jinlongLen){//牌的长度
                    TYPE = "jinlong";
                }
                else if(sspid.length === 4 && sspid[0].type == sspid[1].type){//牌的长度
                    TYPE = "gang";
                }
                else{
                    TYPE = "chi";
                }
                this.initliangpais(pengangroot,side,pre,index,sspid,TYPE);
                if(i === liangpais.length-1 && redundantPai){ //最后一项 显示标记
                    this.prompt(pengangroot,side,seatData,sspid,redundantPai,index,liangpais);
                }
                index++;
            }    
        }      
    },

    prompt:function(pengangroot,side,seatData,Pai,redundantPai,index,liangpais){ //显示标记
        var foldsSprites = this._folds[side];
        var prompt = foldsSprites[24];

        if(side == "left"){
            prompt = this.promptL;
        }
        else if(side == "right"){
            prompt = this.promptR;
        }
        else if(side == "up"){
            prompt = this.promptU;
        }
        else if(side == "myself"){
            prompt = this.promptM;
        }

        var cutLen = 4 - this.BeforeLen;//缩减到长度
        if(side == "left"){ //加上上一次 多减掉的长度
            prompt.node.y += this.deviationL;
        }
        else if(side == "right"){
            prompt.node.y += this.deviationR;
        }
        else if(side == "up"){
            prompt.node.x += this.deviationU;
        }
        else if(side == "myself"){
            prompt.node.x += this.deviationM;
        }

        var paiNum =0;//亮牌的总共有几张牌 除最后一个意外的
        var clearance = liangpais.length-1;//有几个亮牌
        for(var i = 0; i < liangpais.length-1; ++i){
            if(liangpais[i].pai){
                paiNum += liangpais[i].pai.length; //前一个吃碰杠的长度
            }
            else{
                paiNum += liangpais[i].length; //前一个吃碰杠的长度
            }
        }

        var x = 0; 
        var y = 0;
        if(side == "left"){
            x = -425;
            prompt.node.y = 305
            y = prompt.node.y -(paiNum * 22.4) - (3 * clearance);
        }
        else if(side == "right"){
            x = 450;
            prompt.node.y = -200;
            y = prompt.node.y +(paiNum * 22.4) + (3 * clearance); 
        }
        else if(side == "myself"){
            y = -260;
            prompt.node.x = -600;
            x = prompt.node.x +(paiNum * 41) + (10 * clearance);    
        }
        else{
            y = 210;
            prompt.node.x = 400;
            x = prompt.node.x - (paiNum * 30) - (8 * clearance); 
        }
        
        var sides = ["myself","right","up","left"];
        for(var i = 0; i < sides.length; ++i){
            var sideName = sides[i];
            var game = this.node.getChildByName("game");
            var sideRoot = game.getChildByName(sideName);
            var foldRoot = sideRoot.getChildByName("folds");
            var n = foldRoot.getChildByName("prompt");
            n.active = false;
        }

        cc.find("Canvas/game/promptL").active = false;
        cc.find("Canvas/game/promptR").active = false;
        cc.find("Canvas/game/promptU").active = false;
        cc.find("Canvas/game/promptM").active = false;

        var tempIndex = cc.vv.sspNetMgr.getLocalIndexByIndex(seatData.seatindex);
        var localIndex = cc.vv.sspNetMgr.getShowIndexByIndex(tempIndex);
        var pre = cc.vv.SSPMgr.getFoldPre(localIndex);
        var side = cc.vv.SSPMgr.getSide(localIndex);

        

        var paiindex = 0;
        for(var i = 0;i < Pai.length;i++){ //取那张牌是第几张
            if(Pai[i].type === redundantPai.type && Pai[i].value === redundantPai.value){
                paiindex = i;
                break;
            }
        }
        if(side == "left"){
            y -= paiindex*22.4;
            this.deviationL = paiindex*22.4;
        }
        else if(side == "right"){
            y += paiindex*22.4;
            this.deviationR = -paiindex*22.4;
        }
        else if(side == "myself"){
            x += paiindex*41;
            this.deviationM = -paiindex*41;
        }
        else{
            x -= paiindex*30;
            this.deviationU = paiindex*30;
        }


        
        prompt.node.active = true;
        prompt.node.setPosition(x,y);
        
    },

    initliangpais:function(pengangroot,side,pre,index,sspid,type,flag){
        var pgroot = null;
        var paiLen = sspid.length;//牌的长度
        var cutLen = 4 - this.BeforeLen;//缩减到长度
        if(index === 0){
            this.m_paiLen = -213;//玩家吃碰杠 当前的长度
            this.r_paiLen = 40;
            this.u_paiLen = 60;
            this.l_paiLen = 120;
            this.BeforeLen = 0;
            cutLen = 0;
        }
        if(pengangroot.childrenCount <= index){
            if(side == "left" || side == "right"){
                pgroot = cc.instantiate(cc.vv.SSPMgr.pengPrefabLeft);
            }
            else{
                pgroot = cc.instantiate(cc.vv.SSPMgr.pengPrefabSelf);
            }
            
            pengangroot.addChild(pgroot);    
        }
        else{
            pgroot = pengangroot.children[index];
            pgroot.active = true;
        }
        
        if(side == "left"){
            pgroot.y = -(index * 22.4 * 4) + this.l_paiLen + (cutLen * 22.4) - (index * 3); //左  4个牌的长度 - 吃碰杠初始位置 - 上一个少几张牌的长度 + 每个吃碰杠的间隔
            this.l_paiLen += cutLen * 22.4;   
        }
        else if(side == "right"){
            pgroot.x = 40;
            pgroot.y = (index * 22.4 * 4) + this.r_paiLen - (cutLen * 22.4) + (index * 3); 
            this.r_paiLen -= cutLen * 22.4;
        }
        else if(side == "myself"){
            var Before = this.BeforeLen * 40 + 12; 
            this.m_paiLen += Before;
            pgroot.x = this.m_paiLen;              
        }
        else{
            pgroot.y = -20;
            pgroot.x = -(index * 43*4) + this.u_paiLen + (cutLen * 43) - (index * 10);
            this.u_paiLen += cutLen * 43;
        }

        var sprites = pgroot.getComponentsInChildren(cc.Sprite);
        for(var s = 0; s < sprites.length; ++s){
            var spritesIndex = s;
            if(side == "up" || side == "right"){ //上面和右边的反过来显示
                if(s === 0){
                    spritesIndex = 3;
                }
                else if(s === 1){
                    spritesIndex = 2;
                }
                else if(s === 2){
                    spritesIndex = 1;
                }
                else if(s === 3){
                    spritesIndex = 0;
                }
            }

            var sprite = sprites[spritesIndex];
            if( side !="myself" && flag == "angang"){
                sprite.spriteFrame = cc.vv.SSPMgr.getEmptySpriteFrame(side);
                if(side == "myself" || side == "up"){
                    sprite.node.scaleX = 0.85;
                    sprite.node.scaleY = 0.85;                           
                }
            }
            else {
                if(sspid[s]){
                    sprite.node.active = true;
                    sprite.spriteFrame = cc.vv.SSPMgr.getSpriteFrameByPai(pre,sspid[s]);
                }
                else{
                    sprite.node.active = false;
                    if(type === "gang"){//显示银龙框
                        if(side == "left"){
                            if(s === 13 || s === 14 || s === 15){
                                sprite.node.active = true;
                            }
                        }
                        else if(side == "right"){
                            if(s === 10 || s === 11 || s === 12){
                                sprite.node.active = true;
                            }
                        }
                        else{
                            if(s === 4 || s === 5 || s === 6){
                                sprite.node.active = true;
                            }
                        }
                    }
                    else if(type === "jinlong"){//显示金龙框
                        if(side == "left"){
                            if(s === 4 || s === 5 || s === 6){
                                sprite.node.active = true;
                            }
                        }
                        else if(side == "right"){
                            if(s === 7 || s === 8 || s === 9){
                                sprite.node.active = true;
                            }
                        }
                        else{
                            if(s === 7 || s === 8 || s === 9){
                                sprite.node.active = true;
                            }
                        }
                    }
                }
            }  
        }
    },
    
});
