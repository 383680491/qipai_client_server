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
        _groups:null
    },

    // use this for initialization
    init: function () {
        this._groups = {};
    },
    
    add:function(radioButton){
        this.isStorage = true;

        var groupId = radioButton.groupId; 
        var buttons = this._groups[groupId];
        if(buttons == null){
            buttons = [];
            this._groups[groupId] = buttons; 
        }
        buttons.push(radioButton);

        var gameType = cc.vv.userMgr.gameType;//把存储的数据拿出来
        var data = null;
        if('SSS_SERVER_TYPE' === gameType){
            data = JSON.parse(cc.sys.localStorage.getItem('SSSgroups'));
        }
        else if('SSP_SERVER_TYPE' === gameType){
            data = JSON.parse(cc.sys.localStorage.getItem('SSPgroups'));
        }
        if(data){
            if(groupId === 4){  
                var Pay = this._groups[4];
                for(var i = 0;i < Pay.length;i++){
                    Pay[i].checked = false;
                    if(data.payMode === i){
                        Pay[i].checked = true;
                    }
                }
            }
            else if(groupId === 5){
                var wanfa = this._groups[5];
                for(var j = 0;j < wanfa.length;j++){
                    wanfa[j].checked = false;
                    if(data.wanfaMode === j){
                        wanfa[j].checked = true;
                    }
                }
            }
            else if(groupId === 6){  
                var Pay = this._groups[6];
                for(var i = 0;i < Pay.length;i++){
                    Pay[i].checked = false;
                    if(data.payMode === i){
                        Pay[i].checked = true;
                    }
                }
            }
            else if(groupId === 7){
                var wanfa = this._groups[7];
                for(var j = 0;j < wanfa.length;j++){
                    wanfa[j].checked = false;
                    if(data.wanfaMode === j){
                        wanfa[j].checked = true;
                    }
                }
            }
        }
        
    },
    
    del:function(radioButton){
        var groupId = radioButton.groupId;
        var buttons = this._groups[groupId];

        if(this.isStorage){
            this.storage();
        }

        if(buttons == null){
            return; 
        }
        var idx = buttons.indexOf(radioButton);
        if(idx != -1){
            buttons.splice(idx,1);            
        }
        if(buttons.length == 0){
            delete this._groups[groupId]   
        }
        // cc.sys.localStorage.setItem("H5_wxrefreshToken",refresh_token);
        // var sign = cc.sys.localStorage.getItem("wx_sign");
    },

    storage:function(){  //存储模式
        this.isStorage = false;
        var sssPayModeIndex = null;//支付方式
        var ssswanfaModeIndex = null;//玩法方式
        var sspPayModeIndex = null;//支付方式
        var sspwanfaModeIndex = null;//玩法方式
        var sssPay = this._groups[4];//十三水
        var ssswanfa = this._groups[5];//十三水
        var sspPay = this._groups[6];//四色牌
        var sspwanfa = this._groups[7];//四色牌

        var gameType = cc.vv.userMgr.gameType;
        if('SSS_SERVER_TYPE' === gameType){
            if(!sssPay || !ssswanfa){
                return;
            }
            for(var i = 0 ; i < sssPay.length;i++){
                if(sssPay[i].checked === true){
                    sssPayModeIndex = i;
                }
            }
            for(var j = 0 ; j < ssswanfa.length;j++){
                if(ssswanfa[j].checked === true){
                    ssswanfaModeIndex = j;
                }
            }
            if(sssPayModeIndex >= 0 && ssswanfaModeIndex >= 0){
                var Data = {};
                Data.payMode = sssPayModeIndex;
                Data.wanfaMode = ssswanfaModeIndex;

                cc.sys.localStorage.setItem('SSSgroups', JSON.stringify(Data));
            }
        }
        if('SSP_SERVER_TYPE' === gameType){
            if(!sspPay || !sspwanfa){
                return;
            }
            for(var i = 0 ; i < sspPay.length;i++){
                if(sspPay[i].checked === true){
                    sspPayModeIndex = i;
                }
            }
            for(var j = 0 ; j < sspwanfa.length;j++){
                if(sspwanfa[j].checked === true){
                    sspwanfaModeIndex = j;
                }
            }
            if(sspPayModeIndex >= 0 && sspwanfaModeIndex >= 0){
                var Data = {};
                Data.payMode = sspPayModeIndex;
                Data.wanfaMode = sspwanfaModeIndex;

                cc.sys.localStorage.setItem('SSPgroups', JSON.stringify(Data));
            }
        }
    },
    
    check:function(radioButton){
        var groupId = radioButton.groupId;
        var buttons = this._groups[groupId];
        if(buttons == null){
            return; 
        }
        var gameType = cc.vv.userMgr.serverType;
        if('SSP_SERVER_TYPE' === gameType){
            if(radioButton == buttons[0]){
                cc.vv.sspNetMgr.voiceConversion = 0;
            }
            else{
                cc.vv.sspNetMgr.voiceConversion = 1;
            }
            
        }
        for(var i = 0; i < buttons.length; ++i){
            var btn = buttons[i];
            if(btn == radioButton){
                btn.check(true);
            }else{
                btn.check(false);
            }
        }        
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
