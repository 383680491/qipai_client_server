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
        _daQiangLen:null,
        TDseq:null,
        ZDseq:null,
        WDseq:null,
        shootSeq:null,
    },

    // use this for initialization
    onLoad: function () {
        this.seatComs = [];
        for(var i = 0; i < this.node.children.length; i++){
            var name = 'seat'+i;
            var seatNode = this.node.getChildByName(name);
            var seatCom = seatNode.getComponent('gameSeat');
            this.seatComs.push(seatCom);     
        }
         this.Compare = require("Compare");  
    },

    refreshSeats:function(){
        var seatData = cc.vv.sssNetMgr.seats;
        for (var i = 0; i < seatData.length; i++) {
            if(seatData[i].userid <= 0){
                continue;
            }
            var index = cc.vv.sssNetMgr.getLocalIndex(seatData[i].seatindex);
            this.seatComs[index].setInfo(seatData[i]);
            this.seatComs[index].setReady(seatData[i].ready);
        }
    },

    setPlayerReady:function(data) {
        var userid = data;
        var seatData = cc.vv.sssNetMgr.seats;
        for (var i = 0; i < seatData.length; i++) {
            if(seatData[i].userid === userid){
                var index = cc.vv.sssNetMgr.getLocalIndex(seatData[i].seatindex);
                this.seatComs[index].setReady(seatData[i].ready);
            }
        }
    },

    resetReady:function() {
        var seatData = cc.vv.sssNetMgr.seats;
        for (var i = 0; i < seatData.length; i++) {
            if(seatData[i].userid <= 0){
                continue;
            }
            this.seatComs[i].setReady(false);
        }
    },

    emptyChatBubble:function() {//清空聊天
        var seatData = cc.vv.sssNetMgr.seats;
        for (var i = 0; i < this.seatComs.length; i++) {
            this.seatComs[i]._chatBubble.active = false; 
            this.seatComs[i]._emoji.active = false;
        }
    },
    
    resetALLSeat:function(){
        var seatData = cc.vv.sssNetMgr.seats;
        for (var i = 0; i < seatData.length; i++) {
            if(seatData[i].userid <= 0){
                var indexClear = cc.vv.sssNetMgr.getLocalIndex(seatData[i].seatindex);
                this.seatComs[indexClear].setInfo(seatData[i]);
                this.seatComs[index].setReady(false);
                continue;
            }
            var index = cc.vv.sssNetMgr.getLocalIndex(seatData[i].seatindex);
            this.seatComs[index].setInfo(seatData[i]);
            this.seatComs[index].setReady(seatData[i].ready);
        }
    },
    
    resetGameSeats:function(){
        if(this.seatComs){
            for (let i = 0; i < this.seatComs.length; i++) {
                this.seatComs[i].resetGameSeat();
            }
        }
        
    },

    //普通玩法结果显示
    setResultData:function(data){
        var arrSeq = [];
        //每个人同时比牌
        var compareResult = data.compareResult;
        var tdRes = [];
        var copyTdArr = compareResult.tdRes.concat();
        if(compareResult.tdRes.length > 0){
            this.arrSort(copyTdArr, tdRes);
        }
        var zdRes = [];
        var copyTdArr = compareResult.zdRes.concat();
        if(compareResult.zdRes.length > 0){
            this.arrSort(copyTdArr, zdRes);
        }
        var wdRes = [];
        var copyTdArr = compareResult.wdRes.concat();
        if(compareResult.wdRes.length > 0){
            this.arrSort(copyTdArr, wdRes);
        }

        this.showCompareResult(arrSeq,tdRes,zdRes,wdRes);

        //比牌结束显示打枪
        var shootResult = data.shootResult;
        this.showShootResult(arrSeq,shootResult);

        //显示特殊牌
        var TSPResult = data.TSPResult;
        this.showTSPResult(arrSeq,TSPResult);

        //分数显示
        var setAllScore = function(target, data){
            for(let i = 0;i < data.length;i++){
                var userId = data[i].userId;
                var score = data[i].score;
                var seatIndex = cc.vv.sssNetMgr.getSeatIndexByID(userId);
                var index = cc.vv.sssNetMgr.getLocalIndex(seatIndex);
                if(!target.getComponent('gameSeats').seatComs[index]){
                    return;
                }
                target.getComponent('gameSeats').seatComs[index].setAllScore(score);
            }
        }
        arrSeq.push(cc.delayTime(1));
        arrSeq.push(cc.callFunc(setAllScore, this.node, data.userInfo));

        //显示本局结算
        var showOver = function(target, data){
             window.sssGame.showOver();
        }
        arrSeq.push(cc.delayTime(1));
        arrSeq.push(cc.callFunc(showOver, this.node, data));
        var mySeq = cc.sequence(arrSeq);
        this.node.runAction(mySeq);
    },

    setAllScoreResult:function(data) {
        var len = data.length;
        for (let i = 0; i < len; i++) {
            var userId = data[i].userId;
            var seatIndex = cc.vv.sssNetMgr.getSeatIndexByID(userId);
            var index = cc.vv.sssNetMgr.getLocalIndex(seatIndex);
            if(!this.seatComs[index]){
                return;
            }
            this.seatComs[index].setTotalScore(data[i].allScore);
        }
    },

    showTSPResult:function(arrSeq,TSPResult){
        if(!TSPResult || TSPResult.length < 1){
            return;
        }
        for(let i = 0;i < TSPResult.length;i++){
            var holds = TSPResult[i].holds;
            var userId = TSPResult[i].userId;
            var type = TSPResult[i].type;

            var seatIndex = cc.vv.sssNetMgr.getSeatIndexByID(userId);
            var index = cc.vv.sssNetMgr.getLocalIndex(seatIndex);

            var data = {};
            data.holds = holds;
            data.type = type;
            data.index = index;

            //显示牌背
            this.seatComs[index].paibei(13);

            var showTSP = function(target, data){
                if(!target.getComponent('gameSeats').seatComs[data.index]){
                    return;
                }
                target.getComponent('gameSeats').seatComs[data.index].showSpecialResult(data.holds,data.type);
            }
            arrSeq.push(cc.delayTime(1));
            arrSeq.push(cc.callFunc(showTSP, this.node, data));
            arrSeq.push(cc.delayTime(2));
        }
    },

    showShootResult:function(arrSeq,shootResult){
        if(!shootResult.shootInfo || shootResult.shootInfo.length < 1){
            return;
        }
        var shootInfo = shootResult.shootInfo;
        for(var key in shootInfo){
            var doShootId = key;
            var beShootArr = shootInfo[key];
            for(var i = 0;i<beShootArr.length;i++){               
                var beShootId = beShootArr[i];
                var seatIndex0 = cc.vv.sssNetMgr.getSeatIndexByID(doShootId);
                var index0 = cc.vv.sssNetMgr.getLocalIndex(seatIndex0);
                var seatIndex1 = cc.vv.sssNetMgr.getSeatIndexByID(beShootId);
                var index1 = cc.vv.sssNetMgr.getLocalIndex(seatIndex1);

                var data = {};
                data.index0 = index0;
                data.index1 = index1;
                var setShoot = function(target, data){
                    if(!target.getComponent('gameSeats').seatComs[data.index1]){
                        return;
                    }
                    if(!target.getComponent('gameSeats').seatComs[data.index0]){
                        return;
                    }
                    target.getComponent('gameSeats').seatComs[data.index1].showShoot(false,data.index0,data.index1);
                    target.getComponent('gameSeats').seatComs[data.index0].showShoot(true,data.index0,data.index1);
                }
                arrSeq.push(cc.delayTime(1));
                arrSeq.push(cc.callFunc(setShoot, this.node, data));
            }
        }

        //打枪后分数显示
        var setAllScore = function(target, data){
            for(let i = 0;i < data.length;i++){
                var userId = data[i].userId;
                var score = data[i].score;
                var seatIndex = cc.vv.sssNetMgr.getSeatIndexByID(userId);
                var index = cc.vv.sssNetMgr.getLocalIndex(seatIndex);
                if(!target.getComponent('gameSeats').seatComs[index]){
                    return;
                }
                target.getComponent('gameSeats').seatComs[index].setAllScore(score);
            }
        }
        arrSeq.push(cc.delayTime(1));
        arrSeq.push(cc.callFunc(setAllScore, this.node, shootResult.shootScore));
        

        //全垒打
        if(shootResult.swatUserId > 0){
            var animation = window.sssGame.Animation;
            var showSwat = function(target, data){
                window.sssGame.Animation.quanleida.active = true;
                window.sssGame.Animation.quanleida.getComponent(cc.Animation).play('quanleida');
                cc.vv.audioMgr.playSFX("sssMusic/quanleda.mp3");
            }
            
            arrSeq.push(cc.delayTime(1));
            arrSeq.push(cc.callFunc(showSwat, this.node, data));
            
        }
    },

    showCompareResult:function(arrSeq,tdRes,zdRes,wdRes){
        if(tdRes.length < 1 || zdRes.length < 1 || wdRes.length < 1){
            return;
        }
        for(let i = 0;i < tdRes.length ; i++){
            var data = {};
            arrSeq.push(cc.delayTime(1));
            if(tdRes[i]){
                var userID = tdRes[i].userId;
                var score = tdRes[i].score;
                var arrPai = tdRes[i].arrPai;
                var type = this.getPaiType(arrPai);
                var paiType = this.getRealType(type,0);
                var seatIndex = cc.vv.sssNetMgr.getSeatIndexByID(userID);
                var index = cc.vv.sssNetMgr.getLocalIndex(seatIndex);
            }

            //显示牌背
            this.seatComs[index].paibei();

            data.comIndex = index;
            data.arrPai = arrPai;
            data.score = score;
            data.paiType = paiType;

            var setTD =function(target, data){
                if(!target.getComponent('gameSeats').seatComs[data.comIndex]){
                    return;
                }
                target.getComponent('gameSeats').seatComs[data.comIndex].showTD(data.arrPai,data.score,data.paiType);
            }
            arrSeq.push(cc.callFunc(setTD, this.node, data));
        }
        for(let i = 0;i < zdRes.length ; i++){
            var data = {};
            arrSeq.push(cc.delayTime(1));
            if(zdRes[i]){
                var userID = zdRes[i].userId;
                var score = zdRes[i].score;
                var arrPai = zdRes[i].arrPai;
                var type = this.getPaiType(arrPai);
                var paiType = this.getRealType(type,1);
                var seatIndex = cc.vv.sssNetMgr.getSeatIndexByID(userID);
                var index = cc.vv.sssNetMgr.getLocalIndex(seatIndex);
            }

            data.comIndex = index;
            data.arrPai = arrPai;
            data.score = score;
            data.paiType = paiType;

            var setZD =function(target, data){
                if(!target.getComponent('gameSeats').seatComs[data.comIndex]){
                    return;
                }
                target.getComponent('gameSeats').seatComs[data.comIndex].showZD(data.arrPai,data.score,data.paiType);
            }
            arrSeq.push(cc.callFunc(setZD, this.node, data));
        }
        for(let i = 0;i < wdRes.length ; i++){
            var data = {};
            arrSeq.push(cc.delayTime(1));
            if(wdRes[i]){
                var userID = wdRes[i].userId;
                var score = wdRes[i].score;
                var arrPai = wdRes[i].arrPai;
                var type = this.getPaiType(arrPai);
                var paiType = this.getRealType(type,2);
                var seatIndex = cc.vv.sssNetMgr.getSeatIndexByID(userID);
                var index = cc.vv.sssNetMgr.getLocalIndex(seatIndex);
            }

            data.comIndex = index;
            data.arrPai = arrPai;
            data.score = score;
            data.paiType = paiType;

            var setWD =function(target, data){
                if(!target.getComponent('gameSeats').seatComs[data.comIndex]){
                    return;
                }
                target.getComponent('gameSeats').seatComs[data.comIndex].showWD(data.arrPai,data.score,data.paiType);
            }
            arrSeq.push(cc.callFunc(setWD, this.node, data));
        }
    },

    //对牌型牌值进行排序
    arrSort:function(arrRes ,arrTar){
        var len = arrRes.length;
        if(len < 2){
            arrTar.push(arrRes[0]);
            return;
        }
        var bPush = false;
        for(let i = 0; i < len; i++){
            bPush = false;
            for(let j = 0; j < len; j++){
                if(i !== j){
                    var result = this.comparePai(arrRes[i].arrPai, arrRes[j].arrPai);
                    if(1 === result){
                        bPush = true;
                    }
                }
            }
            if(!bPush){
                arrTar.push(arrRes[i]);
                arrRes.splice(i, 1);
                this.arrSort(arrRes, arrTar);
                break;
            }
        }
    },

    
    getRealType:function(paiType,dunIndex){
        switch(dunIndex){
            case 0: //头道
                if(paiType === PaiType.ST){
                    paiType = 14;
                }
                break;
            case 1: //中道
                if(paiType ===  PaiType.WT){
                    paiType = 12;
                }
                else if(paiType ===  PaiType.THS){
                    paiType = 13;
                }
                else if(paiType ===  PaiType.HL){
                    paiType = 15;
                }
                else if(paiType ===  PaiType.TZ){
                    paiType = 16;
                }
                break;
            case 2: //尾道
                break;
            default:
                break;
        }
        return paiType;
    },

    //获取牌的类型
    getPaiType:function(arrPai)
    {
        var arrType = [];
        window.sssGame.myPaiCom.sortPai(arrPai);
        arrType = window.sssGame.Compare.getType(arrPai);
        return arrType[0];
    },
    //以牌值和牌型对比大小
    comparePai:function(arrPai1, arrPai2){
        var type1 = this.getPaiType(arrPai1);
        var type2 = this.getPaiType(arrPai2);
        if (type1 > type2) {
            return 1;
        }
        else if (type1 === type2) {
            return this.Compare.compareSameType(arrPai1, arrPai2, type1);
        }
        else{
            return -1;
        }
    },

    //显示牌背
    setPaibei:function(data){
        var playerData = data.allScore;
        for(let i = 0; i<playerData.length;i++){
            var seatIndex = cc.vv.sssNetMgr.getSeatIndexByID(playerData[i].userId);
            var index = cc.vv.sssNetMgr.getLocalIndex(seatIndex);
            var len = playerData[i].arrPai.length;
            this.seatComs[index].paibei(len);
        }
    },

    setScore:function(data){
        //特殊牌显示完之后的分数显示
        var allScore = data.allScore;

        for(var key in allScore){
            var score = allScore[key].score;
            var userId = allScore[key].userId;
            var seatIndex = cc.vv.sssNetMgr.getSeatIndexByID(userId);
            var index = cc.vv.sssNetMgr.getLocalIndex(seatIndex);
            this.seatComs[index].setAllScore(score);
        }
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
