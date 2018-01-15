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
    },

    // use this for initialization
    onLoad: function () {
        this.ScrollView = this.node.getChildByName('ScrollView');
        this.victory = this.node.getChildByName('shengli');
        this.lose = this.node.getChildByName('shibai');
        this.pingju = this.node.getChildByName('pingju');

        this.view = this.ScrollView.getChildByName('view');
        this.content = this.view.getChildByName('content');
        this._seats = [];
        for(var i = 0; i < 6; ++i){
            var s = "s" + i;
            var sn = this.content.getChildByName(s);
            sn.active = false;
            var viewdata = {};
            viewdata.username = sn.getChildByName('userName').getComponent(cc.Label);
            viewdata.imgLoader = sn.getChildByName("headBox").getComponent("ImageLoader");
            viewdata.score = sn.getChildByName('score').getComponent(cc.Label);
            var arrPaiNode = sn.getChildByName('comparPai');

            viewdata.tdPai = arrPaiNode.getChildByName('tdPai');
            viewdata.zdPai = arrPaiNode.getChildByName('zdPai');
            viewdata.wdPai = arrPaiNode.getChildByName('wdPai');
            viewdata.teshuPai = sn.getChildByName('teshuPai');

            viewdata.username.string = "";
            this._seats.push(viewdata);
            sn.getChildByName('comparPai').active = true;
            sn.getChildByName('teshuPai').active = false;
        }
    },

    reset:function(){
            this.node.active = false;
            this.victory.active = false;
            this.pingju.active = false;
            this.lose.active = false;
            for(var i = 0; i < 6; ++i){
                var s = "s" + i;
                var sn = this.content.getChildByName(s);
                sn.active = false;
                sn.getChildByName('comparPai').active = true;
                sn.getChildByName('teshuPai').active = false;
            }
    },

    showOver:function(data){
        var len = data.length;
        this.victory.active = false;
        this.pingju.active = false;
        this.lose.active = false;
        //显示牌
        for(var i = 0; i < len; i++){
            var s = "s" + i;
            var sn = this.content.getChildByName(s);
            sn.active = true;

            var name = data[i].userName;
            var nameLen = name.length;
            if (nameLen > 4) {
                var str = name.substring(0,4);
                this._seats[i].username.string = str +'...';
            }
            else {
                this._seats[i].username.string = name;
            }
            this._seats[i].score.string = data[i].score;
            if(this._seats[i].imgLoader && data[i].userId){
                this._seats[i].imgLoader.setUserID(data[i].userId);
            }
            if(cc.vv.userMgr.userId === data[i].userId){
                if(data[i].win === 1)
                {
                    this.victory.active = true;
                    cc.vv.audioMgr.playSFX("sssMusic/shengli.mp3");
                }
                else if(data[i].flat === 1)
                {
                    this.pingju.active = true;
                    cc.vv.audioMgr.playSFX("sssMusic/pingju.mp3");
                }
                else if(data[i].lose === 1)
                {
                    this.lose.active = true;
                    cc.vv.audioMgr.playSFX("sssMusic/sibai.mp3");
                }
            }

            //特殊牌
            if(data[i].arrPai.length == 13)
            {
                sn.getChildByName('comparPai').active = false;
                sn.getChildByName('teshuPai').active = true;
                var arrpai = data[i].arrPai;

                for(let m = 0; m < arrpai.length; m++){
                    var paiNode = this._seats[i].teshuPai.getChildByName("pai" + m);
                    var paiCom = paiNode.getComponent('pai');
                    paiCom.setInfo(arrpai[m]);
                }
            }
            else{
                var tdPai = data[i].arrPai[0];
                var zdPai = data[i].arrPai[1];
                var wdPai = data[i].arrPai[2];
                

                //显示相关的牌
                for(let m = 0; m < tdPai.length; m++){
                    var paiNode = this._seats[i].tdPai.getChildByName("pai" + m);
                    var paiCom = paiNode.getComponent('pai');
                    paiCom.setInfo(tdPai[m]);
                }
                for(let n = 0; n < zdPai.length; n++){
                    var paiNode = this._seats[i].zdPai.getChildByName("pai" + n);
                    var paiCom = paiNode.getComponent('pai');
                    paiCom.setInfo(zdPai[n]);
                }
                for(let k = 0; k < wdPai.length; k++){
                    var paiNode = this._seats[i].wdPai.getChildByName("pai" + k);
                    var paiCom = paiNode.getComponent('pai');
                    paiCom.setInfo(wdPai[k]);
                }
            }
        }
        
    },

    hiddenPai:function(isHidd){  //隐藏牌
        for(var i = 0; i < 6; ++i){
            cc.find("Canvas/gameStart/gameSeats/seat"+i+"/comparPai").active = isHidd;
            cc.find("Canvas/gameStart/gameSeats/seat"+i+"/teshupai").active = false;
            cc.find("Canvas/gameStart/gameSeats/seat"+i+"/paiBei").active = isHidd;
            cc.find("Canvas/gameStart/gameSeats/seat"+i+"/dankong").active = false;
         }
    },

    btnClick:function(event){
        if(event.target.name === "btn_close"){
            this.reset();
            if(!window.sssGame.showTotalResult()){
                this.hiddenPai(false);
            }
        }
    }
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
