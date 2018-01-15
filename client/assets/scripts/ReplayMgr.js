var ACTION_CHUPAI = 1;
var ACTION_MOPAI = 2;
var ACTION_PENG = 3;
var ACTION_GANG = 4;
var ACTION_HU = 5;
var ACTION_ZIMO = 6;
var ACTION_CHI = 7;
var ACTION_KAIJIN = 8;
var ACTION_BUHUA = 9;

var ACTION_CHUPAI = 1;
var ACTION_MOPAI = 2;
var ACTION_PENG = 3;
var ACTION_GANG = 4;
var ACTION_HU = 5;
var ACTION_DANCHI = 6;
var ACTION_CHI = 7;
var ACTION_KAIJINLONG = 8;
var ACTION_GUO = 9;
var ACTION_STAR = 10;
var ACTION_SCORE = 11;
var ACTION_DIPAIS = 12;


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
        _lastAction:null,
        _actionRecords:null,
        _currentIndex:0,
    },

    // use this for initialization
    onLoad: function () {

    },
    
    clear:function(){
        this._lastAction = null;
        this._actionRecords = null;
        this._currentIndex = 0;
    },
    
    init:function(data){
        this._actionRecords = data.action_records;
        if(this._actionRecords == null){
            this._actionRecords = {};
        }
        this._currentIndex = 0;
        this._lastAction = null;
    },
    
    isReplay:function(){
        return this._actionRecords != null;    
    },

    SSPgetNextAction:function(){
        if(this._currentIndex >= this._actionRecords.length){
            return null;
        }
        
        var si = this._actionRecords[this._currentIndex++];
        var action = this._actionRecords[this._currentIndex++];
        
        if (action == ACTION_CHI) {
            var pai = [];
            var pai1 = this._actionRecords[this._currentIndex++];
            var pai2 = this._actionRecords[this._currentIndex++];
            pai1 = this.SSPPaiformat(pai1);
            pai2 = this.SSPPaiformat(pai2);
            pai.push(pai1);
            pai.push(pai2);
            var isPai = this.isSSPpai(this._actionRecords[this._currentIndex]);
            if(isPai){
                var pai3 = this._actionRecords[this._currentIndex++];
                pai3 = this.SSPPaiformat(pai3);
                pai.push(pai3);
                isPai = this.isSSPpai(this._actionRecords[this._currentIndex]);
                if(isPai){
                    var pai4 = this._actionRecords[this._currentIndex++];
                    pai4 = this.SSPPaiformat(pai4);
                    pai.push(pai4);
                }
            }

            return {si:si,type:action,pai:pai};
        }
        else if(action == ACTION_KAIJINLONG){
            var pai = [];
            var pai1 = this._actionRecords[this._currentIndex++];
            var pai2 = this._actionRecords[this._currentIndex++];
            var pai3 = this._actionRecords[this._currentIndex++];
            var pai4 = this._actionRecords[this._currentIndex++];
            pai1 = this.SSPPaiformat(pai1);
            pai2 = this.SSPPaiformat(pai2);
            pai3 = this.SSPPaiformat(pai3);
            pai4 = this.SSPPaiformat(pai4);
            pai.push(pai1);
            pai.push(pai2);
            pai.push(pai3);
            pai.push(pai4);

            return {si:si,type:action,pai:pai};
        }
        else if(action == ACTION_PENG){
            var pai = [];
            var pai1 = this._actionRecords[this._currentIndex++];
            var pai2 = this._actionRecords[this._currentIndex++];
            var pai3 = this._actionRecords[this._currentIndex++];
            pai1 = this.SSPPaiformat(pai1);
            pai2 = this.SSPPaiformat(pai2);
            pai3 = this.SSPPaiformat(pai3);
            pai.push(pai1);
            pai.push(pai2);
            pai.push(pai3);
            return {si:si,type:action,pai:pai};
        }
        else if(action == ACTION_GANG){
            var pai = [];
            var pai1 = this._actionRecords[this._currentIndex++];
            var pai2 = this._actionRecords[this._currentIndex++];
            var pai3 = this._actionRecords[this._currentIndex++];
            var pai4 = this._actionRecords[this._currentIndex++];
            pai1 = this.SSPPaiformat(pai1);
            pai2 = this.SSPPaiformat(pai2);
            pai3 = this.SSPPaiformat(pai3);
            pai4 = this.SSPPaiformat(pai4);
            pai.push(pai1);
            pai.push(pai2);
            pai.push(pai3);
            pai.push(pai4);
            return {si:si,type:action,pai:pai};
        }
        else if(action == ACTION_STAR){
            var data = this._actionRecords[this._currentIndex++];
            return {si:0,type:action,data:data};
        }
        else if(action == ACTION_SCORE){
            var data = this._actionRecords[this._currentIndex++];
            return {si:0,type:action,data:data};
        }
        else if(action == ACTION_DIPAIS){
            var data = this._actionRecords[this._currentIndex++];
            return {si:0,type:action,data:data};
        }
        else if(action == ACTION_DANCHI){
            var pai = [];
            var pai1 = this._actionRecords[this._currentIndex++];
            pai1 = this.SSPPaiformat(pai1);
            pai.push(pai1);
            return {si:si,type:action,pai:pai};
        }
        else{
            var pai = this._actionRecords[this._currentIndex++];
            pai = this.SSPPaiformat(pai);
            return {si:si,type:action,pai:pai};
        }
        
    },

    isSSPpai:function(data){ //下一张是不是牌
        var isPai = false;
        if(data.T >= 0){
            isPai = true;
        }  
        return isPai;
    },

    SSPPaiformat:function(Data){ //四色牌牌格式转换
        var pai =[];
        pai.type = Data.T;//型号
        pai.value = Data.V;//值
        return pai;
    },
    
    SSPtakeAction:function(){
        var action = this.SSPgetNextAction();
        // if(this._lastAction != null && this._lastAction.type == ACTION_CHUPAI){
        //     if(action != null && action.type != ACTION_PENG && action.type != ACTION_GANG && action.type != ACTION_HU){
        //         var seats = cc.vv.sspNetMgr.seats;
        //         var PlaneLen = 0;//游戏人数
        //         for(var i = 0; i < seats.length; ++i){
        //             if(seats[i].userid > 0){
        //                 PlaneLen++;
        //             }
        //         }
        //         var seatIndex = action.si - 1;//前一个人的
        //         if(seatIndex < 0){
        //             seatIndex = PlaneLen-1;
        //         }
        //         cc.vv.sspNetMgr.doGuo(seatIndex,action.pai,action.si);
        //         cc.vv.sspNetMgr.mopaiIndex = action.si;
        //         cc.vv.sspNetMgr.doTurnChange(action.si);
        //     }
        // }
        this._lastAction = action;
        if(action == null){
            return -1;
        }
        var nextActionDelay = 1.5;
        var typeofAction = typeof(action.type);
        var tempType = -1;
        if(typeofAction == "object"){
            tempType = action.type.type; 
        }
        else{
            tempType = action.type; 
        }
        if(tempType === ACTION_CHUPAI){//出牌
            cc.vv.sspNetMgr.doChupai(action.si,action.pai);
            return 3.0;
        }
        else if(tempType === ACTION_GUO){//过
            var seats = cc.vv.sspNetMgr.seats;
            var PlaneLen = 0;//游戏人数
            for(var i = 0; i < seats.length; ++i){
                if(seats[i].userid > 0){
                    PlaneLen++;
                }
            }
            var seatIndex = action.si - 1;//前一个人的
            if(seatIndex < 0){
                seatIndex = PlaneLen-1;
            }
            cc.vv.sspNetMgr.doGuo(seatIndex,action.pai,action.si);
            cc.vv.sspNetMgr.mopaiIndex = action.si;
            cc.vv.sspNetMgr.doTurnChange(action.si);
            return 2.0;
        }
        else if(tempType === ACTION_STAR){//星星
            cc.vv.sspNetMgr.doStar(action.data);
            return 0.5;
        }
        else if(tempType === ACTION_DIPAIS){//上面那些底牌
            cc.vv.sspNetMgr.doDipais(action.data);
            return 0.5;
        }
        else if(tempType === ACTION_SCORE){//分数
            cc.vv.sspNetMgr.doScore(action.data);
            return 0.5;
        }
        else if(tempType === ACTION_MOPAI){//摸牌
            cc.vv.sspNetMgr.doMopai(action.si,action.pai);
            //cc.vv.sspNetMgr.doTurnChange(action.si);
            return 2.0;
        }
        else if(tempType === ACTION_PENG){//碰
            cc.vv.sspNetMgr.liangPai(action.si,action.pai,"peng",action.pai[0]);
            cc.vv.sspNetMgr.chupaiIndex = action.si;
            cc.vv.sspNetMgr.doTurnChange(action.si);
            return 3.0;
        }
        else if(tempType === ACTION_GANG){//杠
            cc.vv.sspNetMgr.liangPai(action.si,action.pai,"gang",action.pai[0]);
            cc.vv.sspNetMgr.chupaiIndex = action.si;
            cc.vv.sspNetMgr.doTurnChange(action.si);
            return 3.0;
        }
        else if(tempType === ACTION_CHI){//吃
            cc.vv.sspNetMgr.liangPai(action.si,action.pai,"chi",action.pai[action.pai.length-1]);
            cc.vv.sspNetMgr.chupaiIndex = action.si;
            cc.vv.sspNetMgr.doTurnChange(action.si);
            return 3.0;
        }
        else if(tempType === ACTION_DANCHI){//单吃
            cc.vv.sspNetMgr.liangPai(action.si,action.pai,"dan",action.pai);
            cc.vv.sspNetMgr.chupaiIndex = action.si;
            cc.vv.sspNetMgr.doTurnChange(action.si);
            return 4.0;
        }
        else if(tempType === ACTION_KAIJINLONG){//金龙
            var pai = action.pai;
            cc.vv.sspNetMgr.liangPaiJinlong(action.si,pai,"jinlong",1);
            return 1.0;
        }
        else if(tempType === ACTION_HU){
            cc.vv.sspNetMgr.doHu({seatindex:action.si,hupai:action.pai});
            return 2.0;
        }
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
