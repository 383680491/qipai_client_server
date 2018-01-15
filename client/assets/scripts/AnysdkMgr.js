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
        _isCapturing:false,
    },

    // use this for initialization
    onLoad: function () {
        this.jquery = window.jQuery;
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
    
    init:function(){
        this.ANDROID_API = "com/babykylin/NativeAPI";
        this.IOS_API = "AppController";

        //if(cc.sys.browserType == "mqqbrowser" || "wechat" == cc.sys.browserType){
            //this.getsignature();
        //}
        
    },

    getBatteryPercent:function(){
        if(cc.sys.isNative){
            if(cc.sys.os == cc.sys.OS_ANDROID){
                //return jsb.reflection.callStaticMethod(this.ANDROID_API, "getBatteryPercent", "()F");
            }
            else if(cc.sys.os == cc.sys.OS_IOS){
                //return jsb.reflection.callStaticMethod(this.IOS_API, "getBatteryPercent");
            }            
        }
        return 0.9;
    },
    
    login:function(){
        if(cc.sys.os == cc.sys.OS_ANDROID){ 
            //jsb.reflection.callStaticMethod(this.ANDROID_API, "Login", "()V");
        }
        else if(cc.sys.os == cc.sys.OS_IOS){
            //jsb.reflection.callStaticMethod(this.IOS_API, "login");
        }
        else{
            console.log("platform:" + cc.sys.os + " dosn't implement share.");
        }
    },
    
    share:function(title,desc){
        if(cc.sys.os == cc.sys.OS_ANDROID){
            //jsb.reflection.callStaticMethod(this.ANDROID_API, "Share", "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)V",cc.vv.SI.appweb,title,desc);
        }
        else if(cc.sys.os == cc.sys.OS_IOS){
            //jsb.reflection.callStaticMethod(this.IOS_API, "share:shareTitle:shareDesc:",cc.vv.SI.appweb,title,desc);
        }
        else{
            console.log("platform:" + cc.sys.os + " dosn't implement share.");
        }
    },
    
    // shareResult:function(){
    //     if(this._isCapturing){
    //         return;
    //     }
    //     this._isCapturing = true;
    //     var size = cc.director.getWinSize();
    //     var currentDate = new Date();
    //     var fileName = "result_share.jpg";
    //     var fullPath = jsb.fileUtils.getWritablePath() + fileName;
    //     if(jsb.fileUtils.isFileExist(fullPath)){
    //         jsb.fileUtils.removeFile(fullPath);
    //     }
    //     var texture = new cc.RenderTexture(Math.floor(size.width), Math.floor(size.height));
    //     texture.setPosition(cc.p(size.width/2, size.height/2));
    //     texture.begin();
    //     cc.director.getRunningScene().visit();
    //     texture.end();
    //     texture.saveToFile(fileName, cc.IMAGE_FORMAT_JPG);
    //     console.log('fullPath: ' + fullPath);
    //     var self = this;
    //     var tryTimes = 0;
    //     var fn = function(){
    //         if(jsb.fileUtils.isFileExist(fullPath)){
    //             var height = 100;
    //             var scale = height/size.height;
			 //    var width = Math.floor(size.width * scale);
    //             console.log('SSSSSSSSSSSSSSSS: ' + fullPath);
    //             if(cc.sys.os == cc.sys.OS_ANDROID){
    //                 //jsb.reflection.callStaticMethod(self.ANDROID_API, "ShareIMG", "(Ljava/lang/String;II)V",fullPath,width,height);
    //             }
    //             else if(cc.sys.os == cc.sys.OS_IOS){
    //                 jsb.reflection.callStaticMethod(self.IOS_API, "shareIMG:width:height:",fullPath,width,height);
    //             }
    //             else{
    //                 console.log("platform:" + cc.sys.os + " dosn't implement share.");
    //             }
    //             self._isCapturing = false;
    //         }
    //         else{
    //             tryTimes++;
    //             if(tryTimes > 10){
    //                 console.log("time out...");
    //                 return;
    //             }
    //             setTimeout(fn,50); 
    //         }
    //     }
    //     setTimeout(fn,50);
    // },
    shareResult:function(to){
        if(this._isCapturing){
            return;
        }
        this._isCapturing = true;
        var size = cc.director.getWinSize();
        var fileName = "result_share.jpg";
        var fullPath = jsb.fileUtils.getWritablePath() + fileName;
        if(jsb.fileUtils.isFileExist(fullPath)){
            jsb.fileUtils.removeFile(fullPath);
        }
        var texture = new cc.RenderTexture(Math.floor(size.width), Math.floor(size.height));
        texture.setPosition(cc.p(size.width/2, size.height/2));
        texture.begin();
        cc.director.getRunningScene().visit();
        texture.end();
        texture.saveToFile(fileName, cc.IMAGE_FORMAT_JPG);
        console.log('fullPath: ' + fullPath);
        
        
        var Name = "share.jpg";
        var origin = cc.director.getVisibleOrigin();
        var tex = new cc.RenderTexture(Math.floor(size.width), Math.floor(size.height));
        var fullRect = new cc.Rect(origin.x, origin.y, size.width*0.5, size.height*0.5); 
        var virtualViewPort = new cc.Rect(size.width*0.25, size.height*0.25, size.width*0.5, size.height*0.5); 
        tex.setVirtualViewport(cc.p(size.width*0.25, size.height*0.25),fullRect,virtualViewPort); 
        tex.begin();
        cc.director.getRunningScene().visit();
        tex.end();
        tex.saveToFile(Name, cc.IMAGE_FORMAT_JPG);
        
        
        var self = this;
        var tryTimes = 0;
        var fn = function(){
            if(jsb.fileUtils.isFileExist(fullPath)){
                self.shareImg(fullPath,to);
                self._isCapturing = false;
            }
            else{
                tryTimes++;
                if(tryTimes > 10){
                    console.log("time out...");
                    return;
                }
                setTimeout(fn,50); 
            }
        }
        setTimeout(fn,50);
    },

    //分享url事件
    shareUrlEvent:function(to){
        var agent = anysdk.agentManager;
        this.share_plugin = agent.getSharePlugin();
        this.share_plugin.setListener(this.onShareResult, this);
        this.shareUrl("斗斗棋牌","斗斗棋牌，包含了福州麻将、十三水等多种玩法。","www.doudouyule.wang/wap/page/share",'http://game.doudouyule.wang/icon.png',to);
    },
    /*
    /*
    onLoginResp:function(code){
        var fn = function(ret){
            if(ret.errcode == 0){
                cc.sys.localStorage.setItem("wx_account",ret.account);
                cc.sys.localStorage.setItem("wx_sign",ret.sign);
            }
            console.log('ret123: ' + ret);
            console.log('errcode: ' + ret.errcode);
            console.log('errmsg: ' + ret.errmsg);
            console.log('account: ' + ret.account);
            console.log('halladdr: ' + ret.halladdr);
            console.log('sign: ' + ret.sign);
            cc.vv.userMgr.onAuth(ret);
        }
        
        cc.vv.http.sendRequest("/wechat_auth",{code:code,os:cc.sys.os},fn);
    },
    */
   
    onLoginResp:function(data){
        var fn = function(ret){
            if(ret.errcode == 0){
                cc.sys.localStorage.setItem("wx_account",ret.account);
                cc.sys.localStorage.setItem("wx_sign",ret.sign);
            }

            cc.vv.userMgr.onAuth(ret);
        }
        
        cc.vv.http.sendRequest("/wechat_auth",data,fn);
    },

    shareImg:function(imgPath,to){
        console.log('分享图片: ');
        var agent = anysdk.agentManager;
        this.share_plugin = agent.getSharePlugin();
        this.share_plugin.setListener(this.onShareResult, this);
        
        if(jsb.fileUtils.isFileExist(imgPath)){
            console.log("isFileExist3333333333333");
            //jsb.fileUtils.removeFile(fullPath);
        }
        console.log('imgPath: ' + imgPath);
        var map ={
            mediaType : '1',//分享类型
            shareTo : to,//分享至 0 聊天 1 朋友圈 2 收藏
            imagePath : imgPath,//图片路径
            thumbImage : jsb.fileUtils.getWritablePath() +'share.jpg',//图片路径
            title : '斗斗福建十三水',//标题
            url   : 'http://120.77.56.190:3000/web-mobile/index.html',//链接
            text  : '棋牌'//文本
        }
        this.share_plugin.share(map);
    },
    //分享事件
    onShareResult:function(code, msg){
        console.log('111111111111111111111111111111111111');
        console.log("share result, resultcode:"+code+", msg: "+msg);
        switch ( code ) {
            case anysdk.ShareResultCode.kShareSuccess:
                //do something
                console.log('分享成功');
                break;
            case anysdk.ShareResultCode.kShareFail:
                //do something
                console.log('分享失败');
                break;
            case anysdk.ShareResultCode.kShareCancel:
                //do something
                console.log('分享取消');
                break;
            case anysdk.ShareResultCode.kShareNetworkError:
                //do something
                console.log('分享错误');
                break;
        }
    },
    //分享URL
    shareUrl:function(title,text,url,imagePath,to){
        console.log('分享URL: ');
        console.log('title: ' + title);
        console.log('text: ' + text);
        console.log('url: ' + url);
        console.log('imagePath: ' + imagePath);
        console.log('to: ' + to);
        var map ={
            title : title,//标题
            text  : text,//文本
            url   : url,//链接
            mediaType : '2',//分享类型
            shareTo : to,//分享至 0 聊天 1 朋友圈 2 收藏
            imagePath : imagePath,//图片路径
            thumbSize : '64',//安卓用
            thumbImage: jsb.fileUtils.getWritablePath() +'share.jpg',//苹果用
        }
        this.share_plugin.share(map);
    },

    getAccess_token:function(desc,roomid){ //获取签名
        this.jquery = window.jQuery;
        var self = this;
        var fn = function(ret){
            if(ret){
               var isgetToken = ret.errcode.isgetToken;
               console.log('isgetToken: ' + isgetToken);
               self.token(isgetToken,desc,roomid);
            }
        }
        var data = {
            
        };
        
        cc.vv.http.sendRequest("/H5getToken",data,fn);//获取分享的access_token   
        
    },

    token:function(isgetToken,desc,roomid){
        var self = this;

        if(!self.access_token ||　isgetToken){
            if(cc.sys.browserType == "mqqbrowser" || "wechat" == cc.sys.browserType){
                console.log("cc.sys.browserType == mqqbrowser || wechat == cc.sys.browserType");
                var APPID = "wxc79611510593f0ca";
                var SECRET = "897da32742b97e684d6fe1d78dac03ee";
            }
            //其它浏览器----二维码扫码登录 
            else{
                console.log("其它浏览器----二维码扫码登录");
                var APPID = "wx7f3748cc28cd072c";
                var SECRET = "4fc49e95d9e8cabfa749429fcda31974";
            }
            var wxUrl = "http://game.doudouyule.wang/getH5shareToken.php?APPID="+APPID+"&SECRET="+SECRET;
            console.log("H5shawxUrl:"+wxUrl);
            this.jquery.ajax({
                type:"POST",
                url:wxUrl,
                cache:false,
                success:function(Data){
                    console.log('H5_WXshareGetToken success:'+Data);
                    var Json_Data = JSON.parse(Data);
                    var errmsg = Json_Data.errmsg;
                    if(errmsg == undefined){
                        self.access_token = Json_Data.access_token;
                        var expires_in = Json_Data.expires_in;//有效时间
                        console.log('self.H5access_token:'+self.access_token);
                        console.log('expires_in:'+expires_in);
                        self.getsignature(self.access_token,desc,roomid);
                    }
                    else{
                        console.log('errmsg != undefined');
                    }
                },
                error:function(data){
                    console.log('error');
                    console.log(data);
                }
            });
        }
        else{
            self.getsignature(self.access_token,desc,roomid);
        }
    },

    getsignature:function(access_token,desc,roomid){
        var self = this;
        var sha1 = require("sha1");
        this.timestamp = Math.floor(Date.now()/1000); //精确到秒
        var timestamp = this.timestamp;
        console.log('timestamp: ' + timestamp);
        var noncestr = "Wm3WZYTPz0wzccnW";
        if(timestamp > 0){
            var wxUrl = "http://game.doudouyule.wang/getticket.php?access_token="+access_token;
            console.log("wxUrl:"+wxUrl);
            this.jquery.ajax({
                type:"POST",
                url:wxUrl,
                cache:false,
                success:function(Data){
                    console.log('H5_WXGetToken success12:'+Data);

                    // var starStr = Data.indexOf('{');
                    // var endStr = Data.indexOf('}');
                    // var Data = Data.slice(starStr-1);
                    // console.log('Data.slice12:'+Data);

                    var Json_Data = JSON.parse(Data);
                    self.jsapi_ticket = Json_Data.ticket;
                    console.log('jsapi_ticket:'+self.jsapi_ticket);
                    var url = location.href.split('#')[0];

                    var string1 = "jsapi_ticket="+self.jsapi_ticket+"&noncestr="+noncestr+"&timestamp="+timestamp+"&url="+url;

                    console.log('&noncestr=: ' + noncestr);
                    console.log('&timestamp: ' + timestamp);
                    console.log('&url: ' + url);

                    var signature = sha1(string1);
                    console.log('signature: ' + signature);
                    self.signature =  signature;
                    self.H5share(desc,"http://game.doudouyule.wang/icon.png",roomid);
                },
                error:function(data){
                    console.log('error');
                    console.log(data);
                }
            });
        }
    },

    H5share:function(desc,imgUrl,roomid){
        console.log('this.timestamp:'+this.timestamp);
        console.log('this.signature:'+this.signature);
        console.log('分享.roomid:'+roomid);
        
        var jssdk = document.createElement('script');  //分享
        jssdk.async = true;
        jssdk.src ='http://res.wx.qq.com/open/js/jweixin-1.2.0.js';
        document.body.appendChild(jssdk);
        /*---------JSSDK初始化-----------*/
        
        var data = {
            appId:'wxc79611510593f0ca',
            timestamp:this.timestamp,
            nonceStr:"Wm3WZYTPz0wzccnW",
            signature:this.signature,
        }

        jssdk.addEventListener('load',function(){
            wx.config({
                debug: false,
                appId: data.appId, // 必填，公众号的唯一标识
                timestamp: data.timestamp, // 必填，生成签名的时间戳
                nonceStr: data.nonceStr, // 必填，生成签名的随机串
                signature: data.signature, // 必填，签名，见附录1
                jsApiList: [
                    'checkJsApi',
                    'onMenuShareTimeline',//分享到朋友圈
                    'onMenuShareAppMessage',//发送给朋友
                ] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
            });
            wx.ready(function(){
                console.log('1111444444444');
               console.log('1分享给朋友');
                wx.onMenuShareAppMessage({  //分享给朋友
                    title: "斗斗福建十三水", // 分享标题
                    desc: desc, // 分享描述
                    link: "http://game.doudouyule.wang/?roomId="+roomid, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
                    imgUrl: imgUrl, // 分享图标
                    type: "", // 分享类型,music、video或link，不填默认为link
                    dataUrl: "", // 如果type是music或video，则要提供数据链接，默认为空
                    success: function () { 
                        console.log('1分享给朋友success');
                        // 用户确认分享后执行的回调函数
                    },
                    cancel: function () { 
                        console.log('1分享给朋友cancel');
                        // 用户取消分享后执行的回调函数
                    },
                    fail: function (res) {
                        console.log('1分享给朋友fail'+res);
                    }
                });
                console.log('1分享到朋友圈');
                wx.onMenuShareTimeline({   //分享到朋友圈
                    title: '斗斗福建十三水', // 分享标题
                    link: "http://game.doudouyule.wang/", // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
                    imgUrl: imgUrl, // 分享图标
                    success: function () { 
                        // 用户确认分享后执行的回调函数
                    },
                    cancel: function () { 
                        // 用户取消分享后执行的回调函数
                    }
                });    
            });
            wx.error(function(res){
                console.log('111144444444455');
                console.log('res: ' + res);
                console.log('111144444444455');
                var i = 0;
            });
        });

    },
});
