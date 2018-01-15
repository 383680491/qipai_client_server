var mahjongSprites = [];

cc.Class({
    extends: cc.Component,

    properties: {
        leftAtlas:{
            default:null,
            type:cc.SpriteAtlas
        },
        
        rightAtlas:{
            default:null,
            type:cc.SpriteAtlas
        },
        
        bottomAtlas:{
            default:null,
            type:cc.SpriteAtlas
        },
        
        bottomFoldAtlas:{
            default:null,
            type:cc.SpriteAtlas
        },
        
        upAtlas:{
            default:null,
            type:cc.SpriteAtlas
        },

        pengPrefabSelf:{
            default:null,
            type:cc.Prefab
        },
        
        pengPrefabLeft:{
            default:null,
            type:cc.Prefab
        },
        
        holdsEmpty:{
            default:[],
            type:[cc.SpriteFrame]
        },
        
        _sides:null,
        _pres:null,
        _foldPres:null,
    },
    
    onLoad:function(){
        if(cc.vv == null){
            return;
        }
        this._sides = ["myself","right","up","left"];
        this._pres = ["M_","R_","M_","L_"];
        this._foldPres = ["M_","R_","M_","L_"];//改
        cc.vv.SSPMgr = this; 

    },
    
    getMahjongSpriteByID:function(data){
        //type: 0红,1白,2绿,3黄,4公侯伯子男
        //value: 1:将,2:士,3:象,4:车,5:马,6:炮,7:兵,8:公,9:候,10:伯,11:子,12:男
        return data.type + "_" + data.value;
    },
    
    getSSPType:function(data){
      if(data.type === 4){
        for(var i = 0;i < 5;i++){
            if(data.value === i + 8)
            {
                return i;
            }
        } 
      }
      else if(data.type === 0){
        for(var i = 5;i < 11;i++){
            if(data.value === i - 4)
            {
                return i;
            }
        }
        if(data.value === 7)
        {
            return 29;
        }
      }
      else if(data.type === 1){
        for(var i = 11;i < 17;i++){
            if(data.value === i - 10)
            {
                return i;
            }
        } 
        if(data.value === 7)
        {
            return 30;
        }
      }
      else if(data.type === 2){
        for(var i = 17;i < 23;i++){
            if(data.value === i - 16)
            {
                return i;
            }
        }
        if(data.value === 7)
        {
            return 31;
        }
      }
      else if(data.type === 3){
        for(var i = 23;i < 29;i++){
            if(data.value === i - 22)
            {
                return i;
            }
        }
        if(data.value === 7)
        {
            return 32;
        }
      }
    },
    
    getSpriteFrameByPai:function(pre,pai){
        var spriteFrameName = this.getMahjongSpriteByID(pai);
        spriteFrameName = pre + spriteFrameName;
        if(pre == "M_"){
            return this.bottomAtlas.getSpriteFrame(spriteFrameName);            
        }
        else if(pre == "M_"){
            return this.bottomFoldAtlas.getSpriteFrame(spriteFrameName);
        }
        else if(pre == "L_"){
            return this.leftAtlas.getSpriteFrame(spriteFrameName);
        }
        else if(pre == "R_"){
            return this.rightAtlas.getSpriteFrame(spriteFrameName);
        }
        else if(pre == "M_"){
            return this.upAtlas.getSpriteFrame(spriteFrameName);
        }
    },
    
    getAudioURLByPai:function(id){
        var realId = 0;
        if(id >= 0 && id < 9){
            realId = id + 21;
        }
        else if(id >= 9 && id < 18){
            realId = id - 8;
        }
        else if(id >= 18 && id < 27){
            realId = id - 7;
        }
        return "nv/" + realId + ".mp3";
    },
    
    getEmptySpriteFrame:function(side){
        if(side == "up"){
            return this.bottomAtlas.getSpriteFrame("paibei-s");
        }   
        else if(side == "myself"){
            return this.bottomAtlas.getSpriteFrame("paibei-s");
        }
        else if(side == "left"){
            return this.leftAtlas.getSpriteFrame("paibei-left");
        }
        else if(side == "right"){
            return this.rightAtlas.getSpriteFrame("paibei-right");
        }
    },
    
    getHoldsEmptySpriteFrame:function(side){
        if(side == "up"){
            return this.bottomAtlas.getSpriteFrame("paibei-s");
        }   
        else if(side == "myself"){
            return null;
        }
        else if(side == "left"){
            return this.leftAtlas.getSpriteFrame("paibei-left");
        }
        else if(side == "right"){
            return this.rightAtlas.getSpriteFrame("paibei-right");
        }
    },

    sortSSP:function(arrPai){
        var self = this;
        if(arrPai){
            arrPai.sort(function(a,b){
                var t1 = self.getSSPType(a);
                var t2 = self.getSSPType(b);
                return t2 - t1;
            });
        }
    },

    sortSSPF:function(arrPai){
        var self = this;
        if(arrPai){
            arrPai.sort(function(a,b){
                var t1 = self.getSSPType(a);
                var t2 = self.getSSPType(b);
                return t1 - t2;
            });
        }
    },
    
    getSide:function(localIndex){
        return this._sides[localIndex];
    },
    
    getPre:function(localIndex){
        return this._pres[localIndex];
    },
    
    getFoldPre:function(localIndex){
        return this._foldPres[localIndex];
    }
});
