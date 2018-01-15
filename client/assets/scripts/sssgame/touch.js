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
        shezhiPai:{
            type:cc.Node,
            default:null
        },
        myPai:{
            type:cc.Node,
            default:null
        },
        _timeChild:null,
        _gewei:null,
        _shiwei:null,
        _tempHoldData:null,
        numAtlas:{
            default:null,
            type:cc.SpriteAtlas
        },
        // getType:{
        //     type:cc.Node, 
        //     default:null
        // },
    },

    // use this for initialization
    onLoad: function () {
        this.addY = -60;
        this.norY = -110;

        this.initSheZhi();
        this.initMyPai();

        this.arrUpPai = [];
        this.TDIndex = 0;
        this.ZDIndex = 0;
        this.WDIndex = 0;
        this.arrUpPaiIndex = [];
        this.Compare = require("Compare");
        this._timeChild = this.node.getChildByName('time');
        this._shiwei = this._timeChild.getChildByName("shiwei");
        this._gewei = this._timeChild.getChildByName("gewei");
        this._curTurn = cc.vv.sssNetMgr.turn;
        this.bUpPai = true;      
        
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
    },

    initHandler:function(){
        
    },

    //设置倒计时
    setCountdown:function(data){
        var time = data;
        var gewei = null;
        var shiwei = null;
        var t = Math.ceil(time);
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

    reset:function(){
        this.arrUpPai = [];
        this.TDIndex = 0;
        this.ZDIndex = 0;
        this.WDIndex = 0;
        this.arrUpPaiIndex = [];
        this.setAllDown();
    },
    initMyPai:function(){
        this.arrMyPai = [];
        this.arrMyPaiPos = [];
        var posX = -750;
        for(var i = 1; i <= 13; i++){
            var name = 'pai'+i;
            var paiNode = this.myPai.getChildByName(name);
            paiNode.scale = 0.65;
            paiNode.y = -110;
            paiNode.x = posX + 100*i;
            this.arrMyPaiPos.push(paiNode.getPosition());
            this.arrMyPai.push(paiNode);
        }
        this.addTouch();

    },
    initSheZhi:function(){
        this.arrTDPai = [];
        this.arrZDPai = [];
        this.arrWDPai = [];
        this.arrSheZhiPai = [];
        var tdNode = this.shezhiPai.getChildByName('toudaoNode');
        var zdNode = this.shezhiPai.getChildByName('zhongdaoNode');
        var wdNode = this.shezhiPai.getChildByName('weidaoNode');
        this.tempPaiNode = this.shezhiPai.getChildByName('tempPai');
        this.tempPaiNode.active = false;
        if (cc.vv.sssNetMgr.wanfa === 2) {
            var btnBaipai = this.shezhiPai.getChildByName('btn_Baipai');
            btnBaipai.active = false;
        }
        for(var i = 1; i <= 3; i++){
            var name = 'paiNode'+i;
            var paiNode = tdNode.getChildByName(name);
            var pai = paiNode.getChildByName('pai');
            this.arrTDPai.push(pai);
            this.arrSheZhiPai.push(paiNode);
        }
        for(var i = 1; i <= 5; i++){
            var name = 'paiNode'+i;
            var paiNode = zdNode.getChildByName(name);
            var pai = paiNode.getChildByName('pai');
            this.arrZDPai.push(pai);
            this.arrSheZhiPai.push(paiNode);
        }
        for(var i = 1; i <= 5; i++){
            var name = 'paiNode'+i;
            var paiNode = wdNode.getChildByName(name);
            var pai = paiNode.getChildByName('pai');
            this.arrWDPai.push(pai);
            this.arrSheZhiPai.push(paiNode);
        }
    },
    addTouch:function(){
        this.myPai.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.myPai.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.myPai.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);

        var tdNode = this.shezhiPai.getChildByName('toudaoNode');
        for(let i = 1;i <= 3;i++){
            var tdPaiNode = tdNode.getChildByName('paiNode'+i);
            tdPaiNode.tag = 0;
            tdPaiNode.on(cc.Node.EventType.TOUCH_START, this.onSheZhiTouchStart, this);
            tdPaiNode.on(cc.Node.EventType.TOUCH_MOVE, this.onSheZhiTouchMove, this);
            tdPaiNode.on(cc.Node.EventType.TOUCH_END, this.onSheZhiTouchEnd, this);
            tdPaiNode.on(cc.Node.EventType.TOUCH_CANCEL, this.onSheZhiTouchCancel, this);
        }

        var zdNode = this.shezhiPai.getChildByName('zhongdaoNode');
        for(let i = 1;i <= 5;i++){
            var zdPaiNode = zdNode.getChildByName('paiNode'+i);
            zdPaiNode.tag = 1;
            zdPaiNode.on(cc.Node.EventType.TOUCH_START, this.onSheZhiTouchStart, this);
            zdPaiNode.on(cc.Node.EventType.TOUCH_MOVE, this.onSheZhiTouchMove, this);
            zdPaiNode.on(cc.Node.EventType.TOUCH_END, this.onSheZhiTouchEnd, this);
            zdPaiNode.on(cc.Node.EventType.TOUCH_CANCEL, this.onSheZhiTouchCancel, this);
        }

        var wdNode = this.shezhiPai.getChildByName('weidaoNode');
        for(let i = 1;i <= 5;i++){
            var wdPaiNode = wdNode.getChildByName('paiNode'+i);
            wdPaiNode.tag = 2;
            wdPaiNode.on(cc.Node.EventType.TOUCH_START, this.onSheZhiTouchStart, this);
            wdPaiNode.on(cc.Node.EventType.TOUCH_MOVE, this.onSheZhiTouchMove, this);
            wdPaiNode.on(cc.Node.EventType.TOUCH_END, this.onSheZhiTouchEnd, this);
            wdPaiNode.on(cc.Node.EventType.TOUCH_CANCEL, this.onSheZhiTouchCancel, this);
        }
    },

    onSheZhiTouchCancel:function(event){
        console.log('onSheZhiTouchCancel');
        var target = event.target;
        var paiCom = target.getChildByName('pai').getComponent('pai');
        var paiData = paiCom.getData();
        var location = event.getLocation();
        this.tempPaiNode.active = false;
        
        for(let i = 0;i < this.arrSheZhiPai.length;i++){
            let paiNode = this.arrSheZhiPai[i];
            var pos = paiNode.parent.convertToNodeSpaceAR(location);
            let paiPos = paiNode.position;
            let rect = new cc.rect(paiPos.x - paiNode.width/2, paiPos.y - paiNode.height/2, paiNode.width, paiNode.height);
            if (rect.contains(pos)) {
                console.log('rect.contains(pos) arrTDPai');
                let aimCom = paiNode.getChildByName('pai').getComponent('pai');   
                let aimData = aimCom.getData();
                if(aimData.value === 1){    //代表牌是空的
                    paiCom.setNullInfo();
                    aimCom.setInfo(paiData);

                    if(target.parent.name == 'toudaoNode'){
                        this.TDIndex--;
                    }
                    else if(target.parent.name == 'zhongdaoNode'){
                        this.ZDIndex--;
                    }
                    else if(target.parent.name == 'weidaoNode'){
                        this.WDIndex--;
                    }
                    if(i < 3){
                        this.TDIndex++;
                    }
                    else if(i < 8){
                        this.ZDIndex++;
                    }else if(i < 13){
                        this.WDIndex++;
                    }
                    //重新排序
                    if(this.arrTDPai.length === 3){
                        this.sortPaiData(this.arrTDPai);
                    }
                    if(this.arrZDPai.length === 5){
                        this.sortPaiData(this.arrZDPai);
                    }
                    if(this.arrWDPai.length === 5){
                        this.sortPaiData(this.arrWDPai);
                    }
                }
                else{
                    let tempData = {};
                    tempData.type = paiData.type;
                    tempData.value = paiData.value;
                    tempData.isBB = paiData.isBB;
                    paiCom.setInfo(aimData);
                    aimCom.setInfo(tempData);

                    //重新排序
                    if(this.arrTDPai.length === 3){
                        this.sortPaiData(this.arrTDPai);
                    }
                    if(this.arrZDPai.length === 5){
                        this.sortPaiData(this.arrZDPai);
                    }
                    if(this.arrWDPai.length === 5){
                        this.sortPaiData(this.arrWDPai);
                    }
                }
                return;
            }
        }
        // //牌放回手上
        
        if(paiData.value !== 1){
            if(paiData.isBB){
                this.setArrMyPai(paiData,false,true);
            }
            else{
                this.setArrMyPai(paiData,false);
            }
            if(target.parent.name == 'toudaoNode'){
                this.TDIndex--;
            }
            else if(target.parent.name == 'zhongdaoNode'){
                this.ZDIndex--;
            }
            else if(target.parent.name == 'weidaoNode'){
                this.WDIndex--;
            }
            var btnCancel = cc.find("Canvas/prepare/shezhipai/btn_Cancel");
            var btnOk = cc.find("Canvas/prepare/shezhipai/btn_Ok");
            btnCancel.active = false;
            btnOk.active = false;
            
            paiCom.setNullInfo();
            this.refreshMyPai();
        }
    },



    sortPaiData:function(arrpai){  //取牌数据
        var arrPaiData = [];
        for(let m = 0;m < arrpai.length;m++){
            let Node = arrpai[m];
            let PaiCom = Node.getComponent('pai');
            let PaiData = PaiCom.getData();
            let tempData = {};
            tempData.value = PaiData.value;
            tempData.type = PaiData.type;
            tempData.isBB = PaiData.isBB;
            arrPaiData.push(tempData);
        }
        var myPaiCom = this.myPai.getComponent("myPai");
        myPaiCom.sortPai(arrPaiData);

        //刷新自己手牌
        for(var i = 0;i < arrPaiData.length; i++){
            arrpai[i].getComponent("pai").setInfo(arrPaiData[i]);
        }
    },

    onSheZhiTouchEnd:function(event){
        console.log('onSheZhiTouchEnd');
        this.tempPaiNode.active = false;
        var btnCancel = cc.find("Canvas/prepare/shezhipai/btn_Cancel");
        var btnOk = cc.find("Canvas/prepare/shezhipai/btn_Ok");
        var myPaiCom = this.myPai.getComponent("myPai");
        var arrPaiData = myPaiCom.getMyPaiData();
        if(arrPaiData.length === 0){
            btnCancel.active = true;
            btnOk.active = true;
        }
        var target = event.target;
        var paiCom = target.getChildByName('pai').getComponent('pai');
        var paiData = paiCom.getData();
        if(this.bUpPai){
            this.automaticPai();
        }
        // //牌放回手上
        if(paiData.value !== 1 && !this.bUpPai){
            if(paiData.isBB){
                this.setArrMyPai(paiData,false,true);
            }
            else{
                this.setArrMyPai(paiData,false);
            }
            if(target.parent.name == 'toudaoNode'){
                this.TDIndex--;
            }
            else if(target.parent.name == 'zhongdaoNode'){
                this.ZDIndex--;
            }
            else if(target.parent.name == 'weidaoNode'){
                this.WDIndex--;
            }
            var btnCancel = cc.find("Canvas/prepare/shezhipai/btn_Cancel");
            var btnOk = cc.find("Canvas/prepare/shezhipai/btn_Ok");
            btnCancel.active = false;
            btnOk.active = false;
            
            paiCom.setNullInfo();
            this.refreshMyPai();
        }
        this.bUpPai = false;
    },

    onSheZhiTouchMove:function(event){
        var target = event.target;
        let location = event.getLocation();
        let pos = this.shezhiPai.convertToNodeSpaceAR(location);
        this.tempPaiNode.position  = pos;
    },

    onSheZhiTouchStart:function(event){
        var target = event.target;
        var arrUpPaiData = this.getUpPaiData();
        if(arrUpPaiData.length < 1){    //牌的移动,百变先不做
            var target = event.target;
            var paiCom = target.getChildByName('pai').getComponent('pai');
            var paiData = paiCom.getData();
            if(paiData){
                let location = event.getLocation();
                let pos = this.shezhiPai.convertToNodeSpaceAR(location);
                let paiCom = this.tempPaiNode.getComponent('pai');
                paiCom.setInfo(paiData);
                this.tempPaiNode.active = true;
                this.tempPaiNode.position  = pos;
            }
        }
        if(target.tag === 2){
            console.log("touch weidaoNode");
            if(this.WDIndex > 4){
                return;
            }
            var setTypeCom = this.node.getChildByName("setType").getComponent("setType");
            var Type = setTypeCom.preBtnTag;
            if(Type !== 0 && cc.vv.sssNetMgr.wanfa === 2){ 
                //取点击的类型
                var myPaiCom = this.myPai.getComponent("myPai");
                var arrPaiData = myPaiCom.getMyPaiData();
                setTypeCom.preBtnTag = 0;
            }
            for(var i = 0; i < arrUpPaiData.length; i++){
                if(this.WDIndex > 4){
                    break;
                }
                
                for(let m = 0;m<this.arrWDPai.length;m++){
                    let Node = this.arrWDPai[m];
                    let wdPaiCom = Node.getComponent('pai');
                    let wdPaiData = wdPaiCom.getData();
                    if(wdPaiData.value <= 1){
                        var paiNode = this.arrWDPai[m];
                        break;
                    }
                }
                if(!paiNode){
                    return;
                }
                var myPaiCom = this.myPai.getComponent("myPai");
                var arrPaiData = myPaiCom.getMyPaiData();
                var paiCom = paiNode.getComponent("pai");
                paiCom.setInfo(arrUpPaiData[i]);
                this.setArrMyPai(arrUpPaiData[i],true);
                this.WDIndex++;
                this.bUpPai = true;
            }
        }
        else if(target.tag === 1){
            console.log("touch zhongdaoNode");
            if(this.ZDIndex > 4){
                return;
            }
            var setTypeCom = this.node.getChildByName("setType").getComponent("setType");
            var Type = setTypeCom.preBtnTag;
            if(Type !== 0 && cc.vv.sssNetMgr.wanfa === 2){ 
                //取点击的类型
                var myPaiCom = this.myPai.getComponent("myPai");
                var arrPaiData = myPaiCom.getMyPaiData();
                setTypeCom.preBtnTag = 0;
            }
            for(var i = 0; i < arrUpPaiData.length; i++){
                if(this.ZDIndex > 4){
                    break;
                }

                for(let m = 0;m<this.arrZDPai.length;m++){
                    let Node = this.arrZDPai[m];
                    let zdPaiCom = Node.getComponent('pai');
                    let zdPaiData = zdPaiCom.getData();
                    if(zdPaiData.value <= 1){
                        var paiNode = this.arrZDPai[m];
                        break;
                    }
                }
                if(!paiNode){
                    return;
                }
                var paiCom = paiNode.getComponent("pai");
                paiCom.setInfo(arrUpPaiData[i]);
                this.setArrMyPai(arrUpPaiData[i],true);
                this.ZDIndex++;
                this.bUpPai = true;
            }
        }
        else if(target.tag === 0){
            console.log("touch toudaoNode");
            if(this.TDIndex > 2){
                return;
            }
            var setTypeCom = this.node.getChildByName("setType").getComponent("setType");
            var Type = setTypeCom.preBtnTag;
            if(Type !== 0 && cc.vv.sssNetMgr.wanfa === 2){ 
                //取点击的类型
                var myPaiCom = this.myPai.getComponent("myPai");
                var arrPaiData = myPaiCom.getMyPaiData();
                setTypeCom.preBtnTag = 0;
            }
            for(var i = 0; i < arrUpPaiData.length; i++){
                if(this.TDIndex > 2){
                    break;
                }
                
                for(let m = 0;m<this.arrTDPai.length;m++){
                    let Node = this.arrTDPai[m];
                    let tdPaiCom = Node.getComponent('pai');
                    let tdPaiData = tdPaiCom.getData();
                    if(tdPaiData.value <= 1){
                        var paiNode = this.arrTDPai[m];
                        break;
                    }
                }
                if(!paiNode){
                    return;
                }
                var paiCom = paiNode.getComponent("pai");
                paiCom.setInfo(arrUpPaiData[i]);
                this.setArrMyPai(arrUpPaiData[i],true);
                this.TDIndex++;
                this.bUpPai = true;
            }
        }
        this.refreshMyPai();

        var btnIsView = false;
        var btnCancel = this.shezhiPai.getChildByName("btn_Cancel");
        var btnOk = this.shezhiPai.getChildByName("btn_Ok");
        for(var i = 1; i < 14; i++){
            var name = 'pai'+i;
            var paiNode = this.myPai.getChildByName(name);
            if(paiNode.active){
                break;
            }else{
                btnIsView = true;
                break;
            }
        }
        btnCancel.active = btnIsView;
        btnOk.active = btnIsView;
        cc.vv.audioMgr.playSFX("sssMusic/fangpai.mp3");
    },

    onTouchStart:function(event){
        var setTypeCom = this.node.getChildByName("setType").getComponent("setType");
        setTypeCom.preBtnTag = 0;
        var location = event.getLocation();
        this.startPos = location;
        if(this.startPos.y > 150){
            this.bTouchPai = false;
            this.setAllDown();
        }
        else{
            this.bTouchPai = true;
        }
    },
    onTouchMove:function(event){
        var target = event.target;
    },
    onTouchEnd:function(event){
        var target = event.target;
        var location = event.getLocation();
        this.endPos = location;
        var len = this.arrMyPai.length;

        //单独处理滑动的第一张牌和最后一张
        for(var i = 0; i < len; i++){
            var szPai = this.arrMyPai[i];
            var szPaiPos = szPai.getPosition();
            var startPos = this.myPai.convertToNodeSpaceAR(this.startPos);
            var endPos = this.myPai.convertToNodeSpaceAR(this.endPos);
            var rect = new cc.rect(szPaiPos.x, szPaiPos.y, szPai.width*0.65, szPai.height*0.65);
            if (rect.contains(startPos) || rect.contains(endPos)) {
                if (this.arrMyPai[i].getPositionY() <= this.norY){
                    this.arrMyPai[i].setPositionY(this.addY);
                    cc.vv.audioMgr.playSFX("sssMusic/fangpai.mp3");
                }
                else{
                    this.arrMyPai[i].setPositionY(this.norY);
                    cc.vv.audioMgr.playSFX("sssMusic/fangpai.mp3");
                }
                break;
            }
        }

        for (var i = 0; i < len; i++) {
            var szPai = this.arrMyPai[i];
            var startPos = this.myPai.convertToNodeSpaceAR(this.startPos);
            var endPos = this.myPai.convertToNodeSpaceAR(this.endPos);
            if ((this.arrMyPaiPos[i].x > startPos.x && this.arrMyPaiPos[i].x < endPos.x)
                ||(this.arrMyPaiPos[i].x < startPos.x && this.arrMyPaiPos[i].x > endPos.x)) {
                if (this.arrMyPai[i].getPositionY() <= this.norY) {
                    this.arrMyPai[i].setPositionY(this.addY);
                    cc.vv.audioMgr.playSFX("sssMusic/fangpai.mp3");
                }
                else{
                    this.arrMyPai[i].setPositionY(this.norY);
                    cc.vv.audioMgr.playSFX("sssMusic/fangpai.mp3");
                }
            }
        }
    },

    quickSwing:function(data){
        this._tempHoldData = data;
        var tdPai = data[0];
        var zdPai = data[1];
        var wdPai = data[2];
        wdPai.sort(function(a,b){return (b.value-a.value);})
        zdPai.sort(function(a,b){return (b.value-a.value);})
        tdPai.sort(function(a,b){return (b.value-a.value);})
        this.cancelWD();
        this.cancelZD();
        this.cancelTD();
        for(var i = 0; i < wdPai.length; i++){
            if(this.WDIndex > 4){
                break;
            }
            var myPaiCom = this.myPai.getComponent("myPai");
            var arrPaiData = myPaiCom.getMyPaiData();
            var paiNode = this.arrWDPai[this.WDIndex];
            var paiCom = paiNode.getComponent("pai");
            paiCom.setInfo(wdPai[i]);
            this.setArrMyPai(wdPai[i],true);
            this.WDIndex++;
        }
        for(var i = 0; i < zdPai.length; i++){
            if(this.ZDIndex > 4){
                break;
            }
            var paiNode = this.arrZDPai[this.ZDIndex];
            var paiCom = paiNode.getComponent("pai");
            paiCom.setInfo(zdPai[i]);
            this.setArrMyPai(zdPai[i],true);
            this.ZDIndex++;
        }
        for(var i = 0; i < tdPai.length; i++){
            if(this.TDIndex > 2){
                break;
            }
            var paiNode = this.arrTDPai[this.TDIndex];
            var paiCom = paiNode.getComponent("pai");
            paiCom.setInfo(tdPai[i]);
            this.setArrMyPai(tdPai[i],true);
            this.TDIndex++;
        }
        
        this.refreshMyPai();

        var btnIsView = false;
        var btnCancel = this.shezhiPai.getChildByName("btn_Cancel");
        var btnOk = this.shezhiPai.getChildByName("btn_Ok");
        for(var i = 1; i < 14; i++){
            var name = 'pai'+i;
            var paiNode = this.myPai.getChildByName(name);
            if(paiNode.active){
                break;
            }else{
                btnIsView = true;
                break;
            }
        }
        btnCancel.active = btnIsView;
        btnOk.active = btnIsView;
        this.bUpPai = false;
    },

    setAllDown:function(){
        if(this.arrMyPai){
            for(var i = 0;i < this.arrMyPai.length;i++){
                this.arrMyPai[i].setPositionY(this.norY);
            }
        }
    },

    setUp:function(arrUpPai){
        this.setAllDown();
        var arrTemp = [];
        for(var i = 0;i < this.arrMyPai.length; i++){
            arrTemp.push(this.arrMyPai[i]);
        }
        for(var i = 0;i < arrUpPai.length; i++){
            var upPaiType = arrUpPai[i].type;
            var upPaiValue = arrUpPai[i].value;
            for(var j = 0;j < arrTemp.length;j++){
                var MyPaiCom = arrTemp[j].getComponent("pai");
                var MyPaiData = MyPaiCom.getData();
                if(MyPaiData.type === upPaiType && MyPaiData.value === upPaiValue){
                    arrTemp[j].setPositionY(this.addY);
                    arrTemp.splice(j,1);
                    break;
                }
            }
        }
    },

    getUpPaiData:function(){
        this.arrUpPai = [];
        this.arrUpPaiIndex = [];
        for(var i = 0;i < this.arrMyPai.length;i++){
            var MyPaiCom = this.arrMyPai[i].getComponent("pai");
            var MyPaiData = MyPaiCom.getData();
            if(this.arrMyPai[i].y === this.addY && this.arrMyPai[i].active == true){
                this.arrUpPai.push(MyPaiData);
                this.arrUpPaiIndex.push(i);
            }
        }
        return this.arrUpPai;
    },

    //自己手牌的删除和增加
    setArrMyPai:function(pai,bDel){
        if(pai.value === 1){
            console.log('setArrMyPai pai.value === 1');
            return;
        }
        var myPaiCom = this.myPai.getComponent("myPai");
        var arrPaiData = myPaiCom.getMyPaiData();
        if(bDel){
            for(var i = 0;i < arrPaiData.length;i++){
                var MyPaiData = arrPaiData[i];
                if(MyPaiData.type === pai.type && MyPaiData.value === pai.value){
                    arrPaiData.splice(i,1);
                    return;
                }
            }
            console.log("not find can splice");
            console.log("pai:  "+ pai);
        }
        else{
            console.log("push:"+pai.value);
            var temp = {};
            temp.type = pai.type;
            temp.value = pai.value;
            arrPaiData.push(temp);
        }
    },

    //刷新自己手牌、排序、刷新提示按钮、显示百变牌
    refreshMyPai:function(){
        console.log("refreshMyPai");
        var myPaiCom = this.myPai.getComponent("myPai");
        var arrPaiData = myPaiCom.getMyPaiData();
        var gap = 13 - arrPaiData.length;
        //排序
        myPaiCom.sortPai(arrPaiData);
        //刷新自己手牌
        for(var i = 0;i < arrPaiData.length; i++){
            this.arrMyPai[i].getComponent("pai").setInfo(arrPaiData[i]);
            this.arrMyPai[i].active = true;
        }
        for(var i = 0;i < gap;i++){
            this.arrMyPai[i + arrPaiData.length].getComponent("pai").setNullInfo();
            this.arrMyPai[i + arrPaiData.length].active = false;
        }
        this.setAllDown();

        //刷新提示类型
        var setTypeCom = this.node.getChildByName("setType").getComponent("setType");
        setTypeCom.getType();
        console.log("refreshMyPai over");
    },

    automaticPai:function(){
        var myPaiCom = this.myPai.getComponent("myPai");
        var arrPaiData = myPaiCom.getMyPaiData();
        if(arrPaiData.length <= 5 && arrPaiData.length > 0){
            var sanPaiIndex = 0;

            for(var i = 0; i < this.arrWDPai.length; i++){
                if(this.WDIndex > 4){
                    break;
                }
                var paiNode = this.arrWDPai[i];
                var paiCom = paiNode.getComponent("pai");
                var paiData = paiCom.getData();
                if(paiData.value <= 1){     //代表牌为空
                    paiData.value = arrPaiData[sanPaiIndex].value;
                    paiData.type = arrPaiData[sanPaiIndex].type;
                    paiData.isBB = arrPaiData[sanPaiIndex].isBB;
                    paiCom.setInfo(paiData);
                    this.WDIndex++;
                    sanPaiIndex++;
                }
            }
            for(var i = 0; i < this.arrZDPai.length; i++){
                if(this.ZDIndex > 4){
                    break;
                }
                var paiNode = this.arrZDPai[i];
                var paiCom = paiNode.getComponent("pai");
                var paiData = paiCom.getData();
                if(paiData.value <= 1){     //代表牌为空
                    paiData.value = arrPaiData[sanPaiIndex].value;
                    paiData.type = arrPaiData[sanPaiIndex].type;
                    paiData.isBB = arrPaiData[sanPaiIndex].isBB;
                    paiCom.setInfo(paiData);
                    this.ZDIndex++;
                    sanPaiIndex++;
                }
            }
            for(var i = 0; i < this.arrTDPai.length; i++){
                if(this.TDIndex > 2){
                    break;
                }
                var paiNode = this.arrTDPai[i];
                var paiCom = paiNode.getComponent("pai");
                var paiData = paiCom.getData();
                if(paiData.value <= 1){     //代表牌为空
                    paiData.value = arrPaiData[sanPaiIndex].value;
                    paiData.type = arrPaiData[sanPaiIndex].type;
                    paiData.isBB = arrPaiData[sanPaiIndex].isBB;
                    paiCom.setInfo(paiData);
                    this.TDIndex++;
                    sanPaiIndex++;
                }
            }
            for(var i = 0;i < 5; i++){
                if(arrPaiData[0]){
                    this.setArrMyPai(arrPaiData[0],true);
                }
            }
            //重新排序
            if(this.arrTDPai.length === 3){
                this.sortPaiData(this.arrTDPai);
            }
            if(this.arrZDPai.length === 5){
                this.sortPaiData(this.arrZDPai);
            }
            if(this.arrWDPai.length === 5){
                this.sortPaiData(this.arrWDPai);
            }
            this.refreshMyPai();
            var btnCancel = cc.find("Canvas/prepare/shezhipai/btn_Cancel");
            var btnOk = cc.find("Canvas/prepare/shezhipai/btn_Ok");
            var myPaiCom = this.myPai.getComponent("myPai");
            var arrPaiData = myPaiCom.getMyPaiData();
            if(arrPaiData.length === 0){
                btnCancel.active = true;
                btnOk.active = true;
            }
        }
    },

    //取消尾道牌
    cancelWD:function(){
        console.log("cancelWD");
        for(var i = 4; i >= 0;i--){
            var paiNode = this.arrWDPai[i];
            var paiCom = paiNode.getComponent("pai");
            if(!paiCom.getIsSetInfo()){
                continue;
            }
            var data = paiCom.getData();
            if(data.isBB){
                this.setArrMyPai(data,false,true);
            }
            else{
                this.setArrMyPai(data,false);
            }
            paiCom.setNullInfo();
        }
        this.WDIndex = 0;
        this.refreshMyPai();
    },

    //取消中道牌
    cancelZD:function(){
        console.log("cancelZD");
        for(var i = 4; i >= 0;i--){
            var paiNode = this.arrZDPai[i];
            var paiCom = paiNode.getComponent("pai");
            if(!paiCom.getIsSetInfo()){
                continue;
            }
            var data = paiCom.getData();
            if(data.isBB){
                this.setArrMyPai(data,false,true);
            }
            else{
                this.setArrMyPai(data,false);
            }
            paiCom.setNullInfo();
        }
        this.ZDIndex = 0;
        this.refreshMyPai();
    },

    //取消头道牌
    cancelTD:function(){
        console.log("cancelTD");
        for(var i = 2; i >= 0;i--){
            var paiNode = this.arrTDPai[i];
            var paiCom = paiNode.getComponent("pai");
            if(!paiCom.getIsSetInfo()){
                continue;
            }
            var data = paiCom.getData();
            if(data.isBB){
                this.setArrMyPai(data,false,true);
            }
            else{
                this.setArrMyPai(data,false);
            }
            paiCom.setNullInfo();
        }
        this.TDIndex = 0;
        this.refreshMyPai();
    },

    getNumSpriteByNum:function(data){
        for (var i = 0; i < 10; i++) {
            if (data === i) {
                return numSprites[i];
            }
        }
    },
});
