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
        _popuproot:null,
        _settings:null,
        _dissolveNotice:null,
        
        _endTime:-1,
        _extraInfo:null,
        _noticeLabel:null,
        _noticePlayerLabel:null,
    },

    // use this for initialization
    onLoad: function () {
        if(cc.vv == null){
            return;
        }
        
        cc.vv.popupMgr = this;
        
        this._popuproot = cc.find("Canvas/popups");
        this._popuproot.active = false;
        this._settings = cc.find("Canvas/popups/settings");
        this._dissolveNotice = cc.find("Canvas/popups/dissolve_notice");
        this._noticeLabel = this._dissolveNotice.getChildByName("info0").getComponent(cc.Label);
        this._noticePlayerLabel = this._dissolveNotice.getChildByName("info").getComponent(cc.Label);
        
        this.closeAll();
        
        this.addBtnHandler("settings/btn_close");
        this.addBtnHandler("settings/btn_sqjsfj");
        this.addBtnHandler("dissolve_notice/btn_agree");
        this.addBtnHandler("dissolve_notice/btn_reject");
        //this.addBtnHandler("dissolve_notice/btn_ok");
        
        var self = this;
        var gameType = cc.vv.userMgr.serverType;
        if('SSS_SERVER_TYPE' === gameType){

            cc.vv.emitter.on('dissolve_notice', this.dissolveNotice.bind(this));
            cc.vv.emitter.on('dissolve_cancel', this.dissolveCancel.bind(this));
            cc.vv.emitter.on('remove_handler', this.removeHandler.bind(this));
            cc.vv.emitter.on('stopEndTime', this.stopEndTime.bind(this));
        }
        
        this.node.on("dissolve_notice",function(event){
            var data = event.detail;
            self.showDissolveNotice(data);
        });
        
        this.node.on("dissolve_cancel",function(event){
            self.closeAll();
        });
    },

    removeHandler:function(){
        cc.vv.emitter.off('dissolve_notice');
        cc.vv.emitter.off('dissolve_cancel');
        cc.vv.emitter.off('remove_handler');
    },

    dissolveNotice:function(data){
        this.showDissolveNotice(data);
    },

    dissolveCancel:function(){
        this.closeAll();
    },

    start:function(){
        var gameType = cc.vv.userMgr.serverType;
        if(cc.vv.sssNetMgr.dissoveData) {
            if('SSS_SERVER_TYPE' === gameType){
                this.showDissolveNotice(cc.vv.sssNetMgr.dissoveData);
            }
        }
        else if(cc.vv.sspNetMgr.dissoveData) {
            if('SSP_SERVER_TYPE' === gameType){
                this.showDissolveNotice(cc.vv.sspNetMgr.dissoveData);
            }
        }
    },
    
    addBtnHandler:function(btnName){
        var btn = cc.find("Canvas/popups/" + btnName);
        this.addClickEvent(btn,this.node,"PopupMgr","onBtnClicked");
    },
    
    addClickEvent:function(node,target,component,handler){
        var eventHandler = new cc.Component.EventHandler();
        eventHandler.target = target;
        eventHandler.component = component;
        eventHandler.handler = handler;

        var clickEvents = node.getComponent(cc.Button).clickEvents;
        clickEvents.push(eventHandler);
    },

    stopEndTime:function(){
        this._endTime = 0;
    },
    
    onBtnClicked:function(event){
        this.closeAll();
        var gameType = cc.vv.userMgr.serverType;
        var btnName = event.target.name;

        if('SSS_SERVER_TYPE' === gameType){
            if(btnName == "btn_agree"){
                cc.vv.sssNet.send("dissolve_agree");
            }
            else if(btnName == "btn_reject"){
                cc.vv.sssNet.send("dissolve_reject");
            }
            else if(btnName == "btn_sqjsfj"){
                cc.vv.sssNet.send("dissolve_request"); 
            }
        }
        else if('SSP_SERVER_TYPE' === gameType){
            if (cc.vv.sspNetMgr.isObserver) {
                return;
            }
            if(btnName == "btn_agree"){
                cc.vv.sspNet.send("dissolve_agree");
            }
            else if(btnName == "btn_reject"){
                cc.vv.sspNet.send("dissolve_reject");
            }
            else if(btnName == "btn_sqjsfj"){
                cc.vv.sspNet.send("dissolve_request"); 
            }
        }    
    },
    
    closeAll:function(){
        if(this._popuproot){
            this._popuproot.active = false;
            this._settings.active = false;
            this._dissolveNotice.active = false;
        }
    },
    
    showSettings:function(){
        if(this._popuproot){
            this.closeAll();
            this._popuproot.active = true;
            this._settings.active = true;
        }
    },
    
    showDissolveRequest:function(){
        this.closeAll();
        this._popuproot.active = true;
    },
    
    showDissolveNotice:function(data){
        if (cc.vv.replayMgr.isReplay()) {
            return;
        }
        var gameType = cc.vv.userMgr.serverType;
        this._endTime = Date.now()/1000 + data.time;
        this._extraInfo = "";
        for(var i = 0; i < data.states.length; ++i){
            var b = data.states[i];
            var name = '';
            if('SSS_SERVER_TYPE' === gameType){
                name = cc.vv.sssNetMgr.seats[i].name;
                var len = name.length;
                if (len > 4) {
                    name = name.substring(0,4) + '...';
                }
            }
            else if('SSP_SERVER_TYPE' === gameType){
                name = cc.vv.sspNetMgr.seats[i].name;
                var len = name.length;
                if (len > 4) {
                    name = name.substring(0,4) + '...';
                }
            }
            if(b){
                this._extraInfo += "\n[已同意] "+ name;
            }
            else{
                this._extraInfo += "\n[待确认] "+ name;
            }
        }
        this.closeAll();
        this._popuproot.active = true;
        this._dissolveNotice.active = true;;
    },
    
    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        if(this._endTime > 0){
            var lastTime = this._endTime - Date.now() / 1000;
            if(lastTime < 0){
                this._endTime = -1;
                // var gameType = cc.vv.userMgr.serverType;
                // if('SSS_SERVER_TYPE' === gameType){
                //     cc.vv.sssNet.send("dispress");
                // }
            }
            
            var m = Math.floor(lastTime / 60);
            var s = Math.ceil(lastTime - m*60);
            
            var str = "";
            if(m > 0){
                str += m + "分"; 
            }
            
            this._noticeLabel.string = str + s + "秒后房间将自动解散";
        }
        this._noticePlayerLabel.string = this._extraInfo + "\n  ";
    },
});
