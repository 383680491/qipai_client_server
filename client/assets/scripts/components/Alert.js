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
        PromptAtlas:{
            default:null,
            type:cc.SpriteAtlas
        },
        _alert:null,
        _btnOK:null,
        _btnCancel:null,
        _title:null,
        _content:null,
        _onok:null,
        _cancel:null,
    },

    onLoad: function () {
        if(cc.vv == null){
            return;
        }
        this._alert = cc.find("Canvas/alert");
        this._title = cc.find("Canvas/alert/title");
        this._content = cc.find("Canvas/alert/content").getComponent(cc.Label);
        
        this._btnOK = cc.find("Canvas/alert/btn_ok");
        this._btnCancel = cc.find("Canvas/alert/btn_cancel");
        
        cc.vv.utils.addClickEvent(this._btnOK,this.node,"Alert","onBtnClicked");
        cc.vv.utils.addClickEvent(this._btnCancel,this.node,"Alert","onBtnClicked");

        this._alert.active = false;
        cc.vv.alert = this;
    },
    
    onBtnClicked:function(event){
        if(event.target.name == "btn_ok"){
            if(this._onok){
                this._onok();
            }
        }
        else if(event.target.name == "btn_cancel"){
            if(this._cancel){
                this._cancel();
            }
        }
        this._alert.active = false;
        this._onok = null;
        this._cancel = null;
    },
    
    show:function(title,content,onok,needcancel){
        this._alert.active = true;
        this._onok = onok;

        var node = this.node;

        var spriteFrame = this.getPromptImage(title);
        var titleSprite = this._title.getComponent(cc.Sprite);
        titleSprite.spriteFrame = spriteFrame;

        this._content.string = content;
        if(needcancel){
            this._btnCancel.active = true;
            this._btnOK.x = -150;
            this._btnCancel.x = 150;
        }
        else{
            this._btnCancel.active = false;
            this._btnOK.x = 0;
        }
    },

    showEx:function(title,content,onok,onCancel){
        this._alert.active = true;
        this._onok = onok;
        this._cancel = onCancel;
        this._title.string = title;
        this._content.string = content;

        var spriteFrame = this.getPromptImage(title);
        var titleSprite = this._title.getComponent(cc.Sprite);
        titleSprite.spriteFrame = spriteFrame;

        this._btnCancel.active = true;
        this._btnOK.x = -150;
        this._btnCancel.x = 150;
    },
    
    closeShowEx:function(){
        this._alert.active = false;
    },

    onDestory:function(){
        if(cc.vv){
            cc.vv.alert = null;    
        }
    },

    getPromptImage: function(title){
        switch(title){
            case "提示":
                var spriteFrame = this.PromptAtlas.getSpriteFrame("icon_prompt");
                return spriteFrame;
            case "解散房间":
                var spriteFrame = this.PromptAtlas.getSpriteFrame("icon_dissolveroom");
                return spriteFrame;
            case "返回大厅":
                var spriteFrame = this.PromptAtlas.getSpriteFrame("icon_prompt");
                return spriteFrame;
            case "霸王庄提示":
                var spriteFrame = this.PromptAtlas.getSpriteFrame("icon_BWZprompt");
                return spriteFrame;
            case "注意":
                var spriteFrame = this.PromptAtlas.getSpriteFrame("icon_prompt");
                return spriteFrame;
            default:
                break;
        }
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
