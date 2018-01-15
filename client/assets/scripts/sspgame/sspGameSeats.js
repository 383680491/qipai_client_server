var PaiType = require("define").PaiType;
cc.Class({
    extends: cc.Component,

    properties: {
        _chupaiSprite:[],
        _mopaiSprite:[],
        _chupaiPic:[],
        _mopaiPic:[],
        _opts: [],
        _options:null,
        _mySSPArr:[],
    },

    // use this for initialization
    onLoad: function () {
        var gameChild = cc.find("Canvas/game");
        var sides = ["myself","right","up","left"];
        for(var i = 0; i < sides.length; ++i){
            var side = sides[i];
            
            var sideChild = gameChild.getChildByName(side);
            this._chupaiSprite.push(sideChild.getChildByName("ChuPai").children[1].getComponent(cc.Sprite));
            this._chupaiPic.push(sideChild.getChildByName("ChuPai").children[0].getComponent(cc.Sprite));
            this._chupaiPic.push(sideChild.getChildByName("ChuPai").children[2].getComponent(cc.Sprite));

            this._mopaiSprite.push(sideChild.getChildByName("MoPai").children[1].getComponent(cc.Sprite));
            this._mopaiPic.push(sideChild.getChildByName("MoPai").children[0].getComponent(cc.Sprite));
            this._mopaiPic.push(sideChild.getChildByName("MoPai").children[2].getComponent(cc.Sprite));

            var opt = sideChild.getChildByName("opt");
            opt.active = false;
            var sprite = opt.getChildByName("pai").getComponent(cc.Sprite);
            var data = {
                node:opt,
                sprite:sprite
            };
            this._opts.push(data);
            if (i > 0) {
                var holds = sideChild.getChildByName('holds');
                for (let j = 0; j < holds.childrenCount; ++j) {
                    let node = holds.children[j];
                    node.active = false;
                }
            }
        }
        var opts = gameChild.getChildByName("ops");
        this._options = opts;
        this.chiTargetPai;
    },

    start:function(){
        var gameChild = cc.find("Canvas/game");
        var sides = ["myself","right","up","left"];
        for(var i = 0; i < sides.length; ++i){
            var side = sides[i];
            
            var sideChild = gameChild.getChildByName(side);
            this._chupaiSprite.push(sideChild.getChildByName("ChuPai").children[1].getComponent(cc.Sprite));
            this._chupaiPic.push(sideChild.getChildByName("ChuPai").children[0].getComponent(cc.Sprite));
            this._chupaiPic.push(sideChild.getChildByName("ChuPai").children[2].getComponent(cc.Sprite));

            this._mopaiSprite.push(sideChild.getChildByName("MoPai").children[1].getComponent(cc.Sprite));
            this._mopaiPic.push(sideChild.getChildByName("MoPai").children[0].getComponent(cc.Sprite));
            this._mopaiPic.push(sideChild.getChildByName("MoPai").children[2].getComponent(cc.Sprite));

            var opt = sideChild.getChildByName("opt");
            opt.active = false;
            var sprite = opt.getChildByName("pai").getComponent(cc.Sprite);
            var data = {
                node:opt,
                sprite:sprite
            };
            this._opts.push(data);
            if (i > 0) {
                var holds = sideChild.getChildByName('holds');
            }
        }
        var opts = gameChild.getChildByName("ops");
        this._options = opts;
        this.chiTargetPai;
    },

    initSSP:function(_mySSPArr){ //手牌
        this._mySSPArr = _mySSPArr;
        var seats = cc.vv.sspNetMgr.seats;
        if(cc.vv.sspNetMgr.seatIndex === -1){
            cc.vv.sspNetMgr.seatIndex = 0;
        }
        var seatData = seats[cc.vv.sspNetMgr.seatIndex];
        var holds = this.sortHolds(seatData);
        if(holds == null){
            return;
        }
        
        //初始化手牌
        var lackingNum = 0;
        lackingNum += seatData.liangPai.length;

        for(var i = 0; i < holds.length; ++i){
            var sspid = holds[i];
            var sprite = this._mySSPArr[21-i];
            sprite.node.sspId = sspid;
            sprite.node.y = 0;
            this.setSpriteFrameByPai("M_",sprite,sspid);
        }

        for(var i = 0; i < lackingNum; ++i){
            var sprite = _mySSPArr[i]; 
            sprite.node.sspId = null;
            sprite.spriteFrame = null;
            sprite.node.active = false;
        }
        var len = _mySSPArr.length - holds.length;//空的牌有几个
        for(var i = 0; i < len; ++i){
            var sprite = _mySSPArr[i]; 
            sprite.node.sspId = null;
            sprite.spriteFrame = null;
            sprite.node.active = false;
        }
        this.suopai();
    },
    setSpriteFrameByPai:function(pre,sprite,pai){
        sprite.spriteFrame = cc.vv.SSPMgr.getSpriteFrameByPai(pre,pai);
        sprite.node.active = true;
    },
    sortHolds:function(seatData){
        var holds = seatData.holds;
        if(holds == null){
            return null;
        }
        
        cc.vv.SSPMgr.sortSSP(holds);
        return holds;
    },

    onGameBeign:function(_mySSPArr){
        this.reset();

        this.hideChupai();
        this.hideOptions();
        this.resetHolds();

        if (cc.vv.sspNetMgr.gamestate === 'prepare') {
            this.node.getParent().getChildByName("game").active = false;
            this.node.getParent().getChildByName("prepare").active = true;
        }
        else if(cc.vv.sspNetMgr.gamestate){
            this.node.getParent().getChildByName("game").active = true;
            this.node.getParent().getChildByName("prepare").active = false;
        }
        this.node.getParent().getComponent("sspgame").hidden_tuoguan();
        this.node.getParent().getComponent("sspgame").hidden_tishi();

        this.begin =function(){
            var Animation = window.sspGame.Animation;//隐藏发牌动画
            for(var i = 0; i < 4; i++){
                var fapai = Animation.fapai[i];
                fapai.active = false;
            }
            console.log("onGameBegin");
            
            var seats = cc.vv.sspNetMgr.seats;
            var PlaneLen = 0;//游戏人数
            for(var i = 0; i < seats.length; ++i){
                if(seats[i].userid > 0){
                    PlaneLen++;
                }
            }

            var sides = ['myself',"right","up","left"];
            var gameChild = cc.find("Canvas/game");
            for(var i = 0; i < sides.length; ++i){
                if (i > PlaneLen) {
                    continue;
                }
                var index = cc.vv.sspNetMgr.getShowIndexByIndex(i);
                var sideChild = gameChild.getChildByName(sides[index]);
                var holds = sideChild.getChildByName("holds");
                for(var j = 0; j < holds.childrenCount; ++j){
                    var nc = holds.children[j];
                    nc.active = true;
                    var sprite = nc.getComponent(cc.Sprite);
                    sprite.spriteFrame = cc.vv.SSPMgr.holdsEmpty[index];
                    if(j === 20 || j === 21){
                        nc.active = false;
                    }
                }
            }
          
            if(cc.vv.sspNetMgr.gamestate == "prepare" && cc.vv.replayMgr.isReplay() == false){
                return;
            }

            this.initSSP(_mySSPArr);
            var seats = cc.vv.sspNetMgr.seats;
            for(var i in seats){
                var seatData = seats[i];
                if(seats[i].userid <= 0){
                    continue;
                }
                var localIndex = cc.vv.sspNetMgr.getLocalIndexByIndex(i);
                if(localIndex != 0){
                    this.initOtherSSP(seatData);
                }
            }
            
            if(cc.vv.sspNetMgr.curaction != null){
                cc.vv.sspNetMgr.curaction = null;
            }
        }
        
        this.scheduleOnce(this.begin,0.5);
        
    },

    reset:function(){
        var suokuang = cc.find("Canvas/game/myself/suokuang");
        for(var i = 0; i <suokuang.childrenCount; ++i){
            var child = suokuang.children[i]; 
            child.active = false;
        }
        this.hideChupai();
        this.hidePai();
    },

    hidePai:function(){
        var sides = ['myself',"right","up","left"];
        var gameChild = cc.find("Canvas/game");
        for(var i = 0; i < sides.length; ++i){
            if (i > cc.vv.sspNetMgr.numOfPlayers) {
                continue;
            }
            var index = cc.vv.sspNetMgr.getShowIndexByIndex(i);
            var sideChild = gameChild.getChildByName(sides[index]);
            var holds = sideChild.getChildByName("holds");
            for(var j = 0; j < holds.childrenCount; ++j){
                var nc = holds.children[j];
                nc.active = false;
            }
        }
    },

    resetHolds:function(){
        var gameChild = cc.find("Canvas/game");
        var sides = ["right","up","left"];
        for(var i = 0; i < sides.length; ++i){
            var side = sides[i];
            
            var sideChild = gameChild.getChildByName(side);
            var holds = sideChild.getChildByName('holds');
            for (let j = 0; j < holds.childrenCount; ++j) {
                let node = holds.children[j];
                node.active = false;
            }
        }
        this.hideprompt();
        var dipai = cc.find("Canvas/game/dipai");
        dipai.active = false;
    },
    hideprompt:function(){
        var game = cc.find("Canvas/game");
        var sides = ["myself","right","up","left"];
        for(var i = 0; i < sides.length; ++i){
            var sideName = sides[i];
            var sideRoot = game.getChildByName(sideName);
            var foldRoot = sideRoot.getChildByName("folds");
            var n = foldRoot.children[foldRoot.children.length-1];
            n.active = false;
        }
        
        cc.find("Canvas/game/promptM").active = false;
        cc.find("Canvas/game/promptR").active = false;
        cc.find("Canvas/game/promptU").active = false;
        cc.find("Canvas/game/promptL").active = false;
    },


    hideChupai:function(){
        for(var i = 0; i < this._chupaiSprite.length; ++i){
            this._chupaiSprite[i].node.active = false;
        }   
        for(var i = 0; i < this._chupaiPic.length; ++i){
            this._chupaiPic[i].node.active = false;
        } 
        for(var i = 0; i < this._mopaiSprite.length; ++i){
            this._mopaiSprite[i].node.active = false;
        } 
        for(var i = 0; i < this._mopaiPic.length; ++i){
            this._mopaiPic[i].node.active = false;
        } 
    },
    hideOptions:function(data){
        this._options.active = false;
        for(var i = 0; i < this._options.childrenCount; ++i){
            var child = this._options.children[i]; 
            if(child.name == "op"){
                child.active = false;
                child.getChildByName("btnPeng").active = false;
                child.getChildByName("btnGang").active = false;
                child.getChildByName("btnHu").active = false;
                child.getChildByName("btnChi").active = false;
            }
        }
    },
    hideChi:function(){
        for(var i = 0; i < this._options.childrenCount; ++i){
            var child = this._options.children[i]; 
            if(child.name == "op"){
                child.getChildByName("btnChi").active = false;
            }
        }
    },
    onGameHolds:function(_mySSPArr,Animation){
        //发牌动画
        var self = this;
        var seats = cc.vv.sspNetMgr.seats;
        Animation.node.setPosition(0,0);
        var PlaneLen = 0;//游戏人数
        for(var i = 0; i < seats.length; ++i){
            if(seats[i].userid > 0){
                var index = cc.vv.sspNetMgr.getShowIndexByIndex(i);
                var fapai = Animation.fapai[index];
                fapai.active = true;
                fapai.getComponent(cc.Animation).play('fapai');
            }
        }
        
        this.setHolds =function(){
            self.initSSP(_mySSPArr);
        }
        
        this.scheduleOnce(this.setHolds,1.0);
    },
    initOtherSSP:function(seatData){
        var localIndex = cc.vv.sspNetMgr.getLocalIndexByIndex(seatData.seatindex);
        var showIndex = cc.vv.sspNetMgr.getShowIndexByIndex(localIndex);
        if(showIndex == 0){
            return;
        }
        var side = cc.vv.SSPMgr.getSide(showIndex);
        var game = cc.find("Canvas/game");
        var sideRoot = game.getChildByName(side);
        var sideHolds = sideRoot.getChildByName("holds");
        
        var num = 0;
        var arrChi = seatData.liangPai;//获取总共出了多少牌
        if(arrChi){
            for(var i =0;i < arrChi.length;i++){
                if(arrChi[i].pai){
                    var len = arrChi[i].pai.length - 1;
                }
                else{
                   var len = arrChi[i].length - 1; 
                }
                num += len;
            }
        }

        if(seatData.chupaiNum){
            num += seatData.chupaiNum;
        }
        else{
            if(arrChi){
                num += arrChi.length;
            }  
        }
        

        for(var i = 0; i < num; ++i){
            var idx = this.getSSPIndex(side,i,seatData.seatindex);
            sideHolds.children[idx].active = false;
        }

        var pre = cc.vv.SSPMgr.getFoldPre(showIndex);
        var holds = this.sortHolds(seatData);
        if(holds != null && holds.length > 0){
            for(var i = 0; i < holds.length; ++i){
                var idx = i;
                if(side == "left"){
                    idx = 21-i;
                }
                var sprite = sideHolds.children[i].getComponent(cc.Sprite); 
                if(side == "up"){
                    sprite.node.scaleX = 0.5;
                    sprite.node.scaleY = 0.5;                    
                }
                sprite.spriteFrame = cc.vv.SSPMgr.getSpriteFrameByPai(pre,holds[i]);
            }
        }
    },
    //点击吃按钮会判断左吃右吃中吃
    CheckCanChi: function (Pai) {
        if (!Pai) {
            return;
        }

        var gameChild = cc.find("Canvas/game");
        var Child = gameChild.getChildByName("ChiNode");
        var chiNode = Child.getChildByName("chi");//普通的吃
        var bingchiNode = Child.getChildByName("bingchi");//兵的吃

        if(Pai.pai.value === 7){
            bingchiNode.active = true;
            chiNode.active = false;

            var arrchi = [];
            for(var i = 0 ; i < 5;i++){
                var Node = bingchiNode.getChildByName("ChiNode"+i);
                Node.active = false;
                arrchi.push(Node);
            }
            for(var i = 0;i < Pai.arr.length;i++){
                arrchi[i].active = true;
                var len = Pai.arr[i].length;//第i个有几张牌

                var arrpaiNode = [];
                for(var j = 0 ; j < 4;j++){
                    var Node = arrchi[i].getChildByName("Pai"+j);
                    Node.active = false;
                    arrpaiNode.push(Node);
                }

                for(var k = 0 ; k < Pai.arr[i].length;k++){
                    arrpaiNode[k].active = true;
                    arrpaiNode[k].getComponent(cc.Sprite).spriteFrame = cc.vv.SSPMgr.getSpriteFrameByPai("M_", Pai.arr[i][k]);
                }

            }
        }
        else{
            bingchiNode.active = false;
            chiNode.active = true;
            var chiNode0 = chiNode.getChildByName("ChiNode0");
            var chiNode1 = chiNode.getChildByName("ChiNode1");

            if(Pai.arr[0].length === 2){
                var num = 0;
                var num1 = 1;
            }
            else if(Pai.arr[0].length === 3){
                var num = 1;
                var num1 = 0;
            }
            var leftPai = chiNode0.getChildByName("leftPai").getComponent(cc.Sprite);
            leftPai.spriteFrame = cc.vv.SSPMgr.getSpriteFrameByPai("M_", Pai.arr[num][0]);
            var rightPai = chiNode0.getChildByName("rightPai").getComponent(cc.Sprite);
            rightPai.spriteFrame = cc.vv.SSPMgr.getSpriteFrameByPai("M_", Pai.arr[num][1]);

            var leftPai = chiNode1.getChildByName("leftPai").getComponent(cc.Sprite);
            leftPai.spriteFrame = cc.vv.SSPMgr.getSpriteFrameByPai("M_", Pai.arr[num1][0]);
            var rightPai = chiNode1.getChildByName("rightPai").getComponent(cc.Sprite);
            rightPai.spriteFrame = cc.vv.SSPMgr.getSpriteFrameByPai("M_", Pai.arr[num1][1]);
            var midPai = chiNode1.getChildByName("midPai").getComponent(cc.Sprite);
            midPai.spriteFrame = cc.vv.SSPMgr.getSpriteFrameByPai("M_", Pai.arr[num1][2]);
        }
    },
    getSSPIndex:function(side,index,seatindex){
        if(side == "right" || side == "up"){
            if(seatindex === cc.vv.sspNetMgr.button){
                return 20 - index;
            }
            return 19 - index;
        }
        return index;
    },
    havePai: function (pai) {
        var localIndex = cc.vv.sspNetMgr.seatIndex;
        for (var i = 0; i < 22; ++i) {
            if (cc.vv.sspNetMgr.seats[localIndex].holds[i] == pai) {
                return true;  
            }
        }
        return false;
    },

    showMopai:function(data){
        if( data.pai.value >= 0 ){
            var localIndex = cc.vv.sspNetMgr.getLocalIndexByIndex(cc.vv.sspNetMgr.mopaiIndex);
            var showIndex = cc.vv.sspNetMgr.getShowIndexByIndex(localIndex);
            var sprite = this._mopaiSprite[showIndex];
            sprite.spriteFrame = cc.vv.SSPMgr.getSpriteFrameByPai("M_",data.pai);
            sprite.node.active = true;  
            if(showIndex === 0){//显示出牌图片
                this._mopaiPic[0].node.active = true;
                this._mopaiPic[1].node.active = true;
            }
            else if(showIndex === 1){
                this._mopaiPic[2].node.active = true;
                this._mopaiPic[3].node.active = true;
            }
            else if(showIndex === 2){
                this._mopaiPic[4].node.active = true;
                this._mopaiPic[5].node.active = true;
            }
            else if(showIndex === 3){
                this._mopaiPic[6].node.active = true;
                this._mopaiPic[7].node.active = true;
            }
        }
    },
    showChupai:function(){
        var pai = cc.vv.sspNetMgr.chupai; 
        if( pai.value >= 0 ){
            //
            var localIndex = cc.vv.sspNetMgr.getLocalIndexByIndex(cc.vv.sspNetMgr.chupaiIndex);
            var showIndex = cc.vv.sspNetMgr.getShowIndexByIndex(localIndex);

            if(this._chupaiSprite.length <= 0){
                this.onLoad();
            }
            var sprite = this._chupaiSprite[showIndex];
            sprite.spriteFrame = cc.vv.SSPMgr.getSpriteFrameByPai("M_",pai);
            sprite.node.active = true;  
            if(showIndex === 0){//显示出牌图片
                this._chupaiPic[0].node.active = true;
                this._chupaiPic[1].node.active = true;
            }
            else if(showIndex === 1){
                this._chupaiPic[2].node.active = true;
                this._chupaiPic[3].node.active = true;
            }
            else if(showIndex === 2){
                this._chupaiPic[4].node.active = true;
                this._chupaiPic[5].node.active = true;
            }
            else if(showIndex === 3){
                this._chupaiPic[6].node.active = true;
                this._chupaiPic[7].node.active = true;
            }
        }
    },
    suopai:function(){
        var suokuang = cc.find("Canvas/game/myself/suokuang");
        for(var i = 0; i <suokuang.childrenCount; ++i){
            var child = suokuang.children[i]; 
            child.active = false;
        }

        var seats = cc.vv.sspNetMgr.seats;
        for(var i = 0; i < seats.length; ++i){
            if(seats[i].userid === cc.vv.userMgr.userId){
                if(seats[i].holds && seats[i].suopai){
                    for(var j = 0;j < seats[i].suopai.length;j++){
                        var idx = this.getIndexof(seats[i].holds,seats[i].suopai[j][0]);
                        if(idx != -1){
                            var kuangIndex = 19 - idx;
                            suokuang.children[kuangIndex].active = true;
                        }
                    }
                }
            }
        }
    },
    getIndexof:function(holds,pai1){ //返回手牌里面这张牌的索引
        for(var i = 0;i < holds.length;i++){
            if(holds[i].type === pai1.type && holds[i].value === pai1.value){
                return i;
            }
        }
        return -1;
    },
    showAction:function(data){
        console.log("showAction");
        if(this._options.active){
            this.hideOptions();
        }
        cc.find("Canvas/game/ops/btnGuo").active = true;
        
        if(data && (data.hu || data.gang || data.peng || data.chi)){
            this._options.active = true;
            if(data.hu){
                this.addOption("btnHu",data.pai);
                cc.find("Canvas/game/ops/btnGuo").active = false;
            }
            else{
                if(data.peng){
                    this.addOption("btnPeng",data.pai);
                }
                
                if(data.gang){
                    this.addOption("btnGang",data.pai);
                }
                if (data.chi ) {
                    this.addOption("btnChi", data.pai);
                }
            }   
        }
    },
    addOption:function(btnName,pai){
        for(var i = 0; i < this._options.childrenCount; ++i){
            var child = this._options.children[i]; 
            if(child.name == "op" && child.active == false){
                child.active = true;
                var sprite = child.getChildByName("opTarget").getComponent(cc.Sprite);
                sprite.spriteFrame = cc.vv.SSPMgr.getSpriteFrameByPai("M_",pai);
                var btn = child.getChildByName(btnName); 
                btn.active = true;
                btn.pai = pai;
                return;
            }
        }
    },
});
