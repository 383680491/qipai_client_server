"use strict";
cc._RF.push(module, '572a7Qfh69N9ZLXkNthANfi', 'Login');
// scripts/components/Login.js

"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

String.prototype.format = function (args) {
    if (arguments.length > 0) {
        var result = this;
        if (arguments.length == 1 && (typeof args === "undefined" ? "undefined" : _typeof(args)) == "object") {
            for (var key in args) {
                var reg = new RegExp("({" + key + "})", "g");
                result = result.replace(reg, args[key]);
            }
        } else {
            for (var i = 0; i < arguments.length; i++) {
                if (arguments[i] == undefined) {
                    return "";
                } else {
                    var reg = new RegExp("({[" + i + "]})", "g");
                    result = result.replace(reg, arguments[i]);
                }
            }
        }
        return result;
    } else {
        return this;
    }
};

//<script src="jquery.js"></script>
//<script src="https://code.jquery.com/jquery-3.2.1.min.js "></script>
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
        _mima: null,
        _mimaIndex: 0
    },

    // use this for initialization
    onLoad: function onLoad() {
        if (!cc.sys.isNative && cc.sys.isMobile) {
            var cvs = this.node.getComponent(cc.Canvas);
            cvs.fitHeight = true;
            cvs.fitWidth = true;
        }

        if (!cc.vv) {
            cc.director.loadScene("loading");
            return;
        }
        cc.vv.http.url = cc.vv.http.master_url;
        cc.vv.net.addHandler('push_need_create_role', function () {
            console.log("onLoad:push_need_create_role");
            cc.director.loadScene("createrole");
        });

        cc.vv.audioMgr.playBGM("bgMain.mp3");

        this._mima = ["A", "A", "B", "B", "A", "B", "A", "B", "A", "A", "A", "B", "B", "B"];

        // if(!cc.sys.isNative || cc.sys.os == cc.sys.OS_WINDOWS){
        //     cc.find("Canvas/btn_yk").active = true;
        //     cc.find("Canvas/btn_weixin").active = true;
        // }
        // else{
        //     cc.find("Canvas/btn_yk").active = true;
        //     cc.find("Canvas/btn_weixin").active = true;
        // }
        cc.find("Canvas/btn_yk").active = false;
        cc.find("Canvas/btn_weixin").active = false;

        this.jquery = window.jQuery;
        //公众号appid
        this.APPID = "wxc79611510593f0ca";
        this.SECRET = "897da32742b97e684d6fe1d78dac03ee";

        //网站appid
        this.NETAPPID = "wx7f3748cc28cd072c";
        this.NETSECRET = "4fc49e95d9e8cabfa749429fcda31974";

        //微信浏览器----公众号登录 
        if (cc.sys.browserType == "mqqbrowser" || "wechat" == cc.sys.browserType) {
            this.H5_WXGetToken();
        } else if (cc.sys.os == cc.sys.OS_ANDROID || cc.sys.os == cc.sys.OS_IOS) {}
        //其它浏览器----二维码扫码登录 
        else {
                this.H5_WXGetToken();
            }
    },

    start: function start() {
        var account = cc.sys.localStorage.getItem("wx_account");
        var sign = cc.sys.localStorage.getItem("wx_sign");
        if (account != null && sign != null) {
            var ret = {
                errcode: 0,
                account: account,
                sign: sign
            };
            cc.vv.userMgr.onAuth(ret);
        }

        //控制是否显示微信登录
        var self = this;
        var onGet = function onGet(ret) {
            if (ret.errcode !== 0) {
                console.log(ret.errmsg);
            } else {
                cc.find("Canvas/btn_yk").active = true;
                cc.find("Canvas/btn_weixin").active = true;
            }
        };

        var data = {
            account: cc.vv.userMgr.account,
            sign: cc.vv.userMgr.sign,
            type: "control",
            version: 20161128
        };
        cc.vv.http.sendRequest("/get_message", data, onGet.bind(this));
    },

    onBtnQuickStartClicked: function onBtnQuickStartClicked() {
        cc.vv.userMgr.guestAuth();
        // var self = this;
        // if(!self.user_plugin)
        // {
        //     return;
        // }
        // self.user_plugin.login();
    },

    onBtnWeichatClicked: function onBtnWeichatClicked() {
        // console.log("onBtnWeichatClicked");
        this.H5_WXGetCode();
    },
    H5_WXGetCode: function H5_WXGetCode() {

        //微信浏览器----公众号登录 
        if (cc.sys.browserType == "mqqbrowser" || "wechat" == cc.sys.browserType) {
            console.log("cc.sys.browserType == mqqbrowser || wechat == cc.sys.browserType");
            window.location.href = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxc79611510593f0ca&redirect_uri=http://game.doudouyule.wang&response_type=code&scope=snsapi_userinfo&state=111#wechat_redirect";
            //window.location.href = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxc79611510593f0ca&redirect_uri=game.doudouyule.wang&response_type=code&scope=snsapi_userinfo&state=111#wechat_redirect";
        } else if (cc.sys.os == cc.sys.OS_ANDROID || cc.sys.os == cc.sys.OS_IOS) {
            console.log("cc.sys.platform == cc.sys.OS_ANDROID || cc.sys.platform == cc.sys.OS_IOS");
            var agent = anysdk.agentManager;
            this.user_plugin = agent.getUserPlugin();
            console.log("user_plugin:" + this.user_plugin);

            if (!this.user_plugin) return;
            this.user_plugin.login();
            this.user_plugin.setListener(this.WeiChatCallBack, this);
        }
        //其它浏览器----二维码扫码登录 
        else {
                console.log("其它浏览器----二维码扫码登录");
                window.location.href = "https://open.weixin.qq.com/connect/qrconnect?appid=wx7f3748cc28cd072c&redirect_uri=http://game.doudouyule.wang&response_type=code&scope=snsapi_login&state=111#wechat_redirect";
            }
    },

    H5_WXGetToken: function H5_WXGetToken() {
        console.log('H5_WXGetToken');
        var self = this;
        var szCode = self.GetQueryString("code");
        console.log('szCode:' + szCode);
        //cc.find("Canvas/btn_weiCxin").active = false;
        //微信浏览器----公众号登录
        if (cc.sys.browserType == "mqqbrowser" || "wechat" == cc.sys.browserType) {
            console.log("cc.sys.browserType == mqqbrowser || wechat == cc.sys.browserType");
            var APPID = "wxc79611510593f0ca";
            var SECRET = "897da32742b97e684d6fe1d78dac03ee";
        }
        //其它浏览器----二维码扫码登录 
        else {
                console.log("其它浏览器----二维码扫码登录");
                var APPID = "wx7f3748cc28cd072c";
                var SECRET = "4fc49e95d9e8cabfa749429fcda31974";
            }
        if (szCode != null && szCode.length > 2) {
            var wxUrl = "http://game.doudouyule.wang/login.php?code=" + szCode + "&APPID=" + APPID + "&SECRET=" + SECRET;
            console.log("wxUrl:" + wxUrl);
            this.jquery.ajax({
                type: "POST",
                url: wxUrl,
                cache: false,
                //data:"appid"+self.APPID+"&appsecret="+self.SECRET+"&code="+szCode,
                success: function success(Data) {
                    console.log('H5_WXGetToken success:' + Data);
                    var Json_Data = JSON.parse(Data);
                    var errmsg = Json_Data.errmsg;
                    if (errmsg == undefined) {
                        var szAccess_token = Json_Data.access_token;
                        var szRfresh_token = Json_Data.refresh_token;
                        var szOpenid = Json_Data.openid;
                        console.log('szAccess_token:' + szAccess_token);
                        console.log('szRfresh_token:' + szRfresh_token);
                        console.log('szOpenid:' + szOpenid);
                        self.GetUserInfo(szAccess_token, szRfresh_token, szOpenid);
                    } else {
                        console.log('errmsg != undefined');
                        cc.find("Canvas/btn_weixin").active = true;
                    }
                },
                error: function error(data) {
                    console.log('error');
                    console.log(data);
                }
            });
        } else {
            cc.find("Canvas/btn_weixin").active = true;
        }
    },

    GetAccess_token: function GetAccess_token() {
        console.log("000000");
    },

    GetUserInfo: function GetUserInfo(access_token, refresh_token, openid) {
        console.log('GetUserInfo');
        var self = this;
        //保存rfresh_token
        cc.sys.localStorage.setItem("H5_wxrefreshToken", refresh_token);
        cc.sys.localStorage.setItem("H5_wxaccess_token", access_token);

        var wxUrl = "http://game.doudouyule.wang/getUserInfo.php?access_token=" + access_token + "&openid=" + openid;
        console.log("wxUrl#####" + wxUrl);
        this.jquery.ajax({
            type: "POST",
            url: wxUrl,
            cache: false,
            success: function success(Data) {
                console.log("@@@@@@@@@@@@@@@@@");
                console.log(Data);
                var Json_Data = JSON.parse(Data);
                console.log(Json_Data);

                var errmsg = Json_Data.errmsg;
                if (errmsg == undefined) {
                    console.log("openid" + Json_Data.openid);
                    console.log("nickname" + Json_Data.nickname);
                    console.log("sex" + Json_Data.sex);
                    console.log("headimgurl" + Json_Data.headimgurl);
                    var userData = {
                        unionid: Json_Data.unionid,
                        openid: Json_Data.openid,
                        nickname: Json_Data.nickname,
                        sex: Json_Data.sex,
                        headimgurl: Json_Data.headimgurl
                    };
                    cc.vv.anysdkMgr.onLoginResp(userData);
                    //self.GetQueryString(Json_Data);
                }
            },
            error: function error(data) {
                console.log(data);
            }
        });
    },

    GetQueryString: function GetQueryString(name) {
        console.log('GetQueryString');
        console.log('name:' + name);

        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]);
        return null;
    },

    WeiChatCallBack: function WeiChatCallBack(code, msg) {
        console.log("WeiChatCallBack");
        var self = this;
        console.log('11111111111111');
        console.log('code: ' + code);
        console.log('msg' + msg);
        console.log('11111111111111');
        switch (code) {
            case anysdk.UserActionResultCode.kLoginSuccess:
                //登陆成功回调
                //登陆成功后，游戏相关处理
                console.log("kLoginSuccess");
                var uid = this.user_plugin.getUserID();
                var info = JSON.parse(this.user_plugin.getUserInfo());

                var data = {
                    openid: uid,
                    nickname: info.nickName,
                    sex: info.sex,
                    headimgurl: info.avatarUrl,
                    unionid: info.unionid
                };
                console.log("unionid54545454:" + data.unionid);
                cc.vv.anysdkMgr.onLoginResp(data);

                console.log("unionid54545454:" + data.unionid);

                //cc.vv.userMgr.guestAuth(info["unionid"]);

                //cc.vv.userMgr.login(info["sex"],info["nickName"],info["unionid"]，info["avatarUrl"]);//性别 名字 ID 头像

                //cc.vv.anysdkMgr.onLoginResp(code);
                break;
            case anysdk.UserActionResultCode.kLoginNetworkError:
                //登陆网络出错回调
                console.log("kLoginNetworkError");
                break;
            case anysdk.UserActionResultCode.kLoginCancel:
                //登陆取消回调
                console.log("kLoginCancel");
                break;
            case anysdk.UserActionResultCode.kLoginFail:
                //登陆失败回调
                console.log("kLoginFail");

                //登陆失败后，游戏相关处理

                break;
        }
    },

    onBtnMIMAClicked: function onBtnMIMAClicked(event) {
        if (this._mima[this._mimaIndex] == event.target.name) {
            this._mimaIndex++;
            if (this._mimaIndex == this._mima.length) {
                cc.find("Canvas/btn_yk").active = true;
            }
        } else {
            console.log("oh ho~~~");
            this._mimaIndex = 0;
        }
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});

cc._RF.pop();