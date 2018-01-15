"use strict";
cc._RF.push(module, 'fe4f16CAmpBlZphnpsH1ETv', 'UserInfoShow');
// scripts/components/UserInfoShow.js

"use strict";

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
        _userinfo: null
    },

    // use this for initialization
    onLoad: function onLoad() {
        if (cc.vv == null) {
            return;
        }

        this._userinfo = cc.find("Canvas/userinfo");
        this._userinfo.active = false;
        this._money = cc.find("Canvas/userinfo/money");
        this.moneyInfo = this._money.getComponent('cc.Label');
        cc.vv.utils.addClickEvent(this._userinfo, this.node, "UserInfoShow", "onClicked");

        cc.vv.userinfoShow = this;
        this._userId = null;
        this.initView();
    },

    initView: function initView() {
        var self = this;
        var onGet = function onGet(ret) {
            if (ret.errcode !== 0) {
                console.log(ret.errmsg);
            } else {
                if (ret.gems != null) {
                    this.moneyInfo.string = ret.gems;
                }
            }
        };

        var data = {
            account: cc.vv.userMgr.account,
            sign: cc.vv.userMgr.sign
        };
        cc.vv.http.sendRequest("/get_user_status", data, onGet.bind(this));
    },

    show: function show(name, userId, iconSprite, sex, ip) {
        if (userId != null && userId > 0) {
            this._userinfo.active = true;
            this._userinfo.getChildByName("icon").getComponent(cc.Sprite).spriteFrame = iconSprite.spriteFrame;
            var str = null;
            if (name) {
                var len = name.length;
                if (len > 4) {
                    str = name.substring(0, 4) + '...';
                } else {
                    str = name;
                }
            }
            this._userinfo.getChildByName("name").getComponent(cc.Label).string = str;
            //this._userinfo.getChildByName("ip").getComponent(cc.Label).string = "IP: " + ip.replace("::ffff:","");
            this._userinfo.getChildByName("id").getComponent(cc.Label).string = "ID: " + userId;
            this._userId = userId;
            // var sex_female = this._userinfo.getChildByName("sex_female");
            // sex_female.active = false;

            // var sex_male = this._userinfo.getChildByName("sex_male");
            // sex_male.active = false;
            var sex = this._userinfo.getChildByName("sex");
            var sex = cc.vv.userMgr.sex;
            if (sex == 1) {
                sex.getComponent(cc.Label).string = "性别：男";
            } else if (sex == 2) {
                sex.getComponent(cc.Label).string = "性别：女";
            }
        }
    },

    onClicked: function onClicked() {
        this._userinfo.active = false;
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});

cc._RF.pop();