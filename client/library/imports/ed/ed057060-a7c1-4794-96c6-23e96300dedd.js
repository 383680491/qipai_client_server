"use strict";
cc._RF.push(module, 'ed057Bgp8FHlJbGI+ljAN7d', 'ImageLoader');
// scripts/components/ImageLoader.js

'use strict';

function loadImage(url, code, callback) {
    /*
    if(cc.vv.images == null){
        cc.vv.images = {};
    }
    var imageInfo = cc.vv.images[url];
    if(imageInfo == null){
        imageInfo = {
            image:null,
            queue:[],
        };
        cc.vv.images[url] = imageInfo;
    }
    
    cc.loader.load(url,function (err,tex) {
        imageInfo.image = tex;
        var spriteFrame = new cc.SpriteFrame(tex, cc.Rect(0, 0, tex.width, tex.height));
        for(var i = 0; i < imageInfo.queue.length; ++i){
            var itm = imageInfo.queue[i];
            itm.callback(itm.code,spriteFrame);
        }
        itm.queue = [];
    });
    if(imageInfo.image != null){
        var tex = imageInfo.image;
        var spriteFrame = new cc.SpriteFrame(tex, cc.Rect(0, 0, tex.width, tex.height));
        callback(code,spriteFrame);
    }
    else{
        imageInfo.queue.push({code:code,callback:callback});
    }*/

    // var size = cc.director.getWinSize();
    // var fileName = url;
    // var fullPath = jsb.fileUtils.getWritablePath() + fileName;
    // if(jsb.fileUtils.isFileExist(fullPath)){
    //     jsb.fileUtils.removeFile(fullPath);
    // }
    // var texture = new cc.RenderTexture(Math.floor(size.width), Math.floor(size.height));
    // texture.setPosition(cc.p(size.width/2, size.height/2));
    // texture.saveToFile(fileName, cc.IMAGE_FORMAT_JPG);
    // console.log('fullPath: ' + fullPath);

    //cc.sys.localStorage.setItem("avatarUrl",url);

    // console.log('loadImage'+url);
    // console.log('loadImage'+code);
    // console.log('loadImage'+callback);
    // console.log('loadImage1111'+cc.sys.localStorage.getItem('avatarUrl'));
    //cc.loader.load({url: url, type: 'png'}, function (err, tex) {
    //cc.loader.load(cc.sys.localStorage.getItem(url) + ".png", function (err, tex) {
    //cc.loader.loadImg(url, {isCrossOrigin : false}, function(err,img){
    //
    //cc.loader.load(cc.sys.localStorage.getItem("avatarUrl") + ".png", function (err, tex) {
    cc.loader.load({ url: url, type: "png" }, function (err, tex) {
        console.log('1111load' + err); //tex为null
        console.log('1111load' + tex);
        var spriteFrame = new cc.SpriteFrame(tex, cc.Rect(0, 0, tex.width, tex.height));
        callback(code, spriteFrame);
    });
};

function getBaseInfo(userid, callback) {
    if (cc.vv.baseInfoMap == null) {
        cc.vv.baseInfoMap = {};
    }

    if (cc.vv.baseInfoMap[userid] != null) {
        callback(userid, cc.vv.baseInfoMap[userid]);
    } else {
        cc.vv.http.sendRequest('/base_info', { userid: userid }, function (ret) {
            var url = null;
            if (ret.headimgurl) {
                url = ret.headimgurl;
                //url = ret.headimgurl + ".png";
                console.log('1111111111177777777777' + ret.headimgurl);
            }
            var info = {
                name: ret.name,
                sex: ret.sex,
                url: url
            };
            cc.vv.baseInfoMap[userid] = info;
            callback(userid, info);
        }, cc.vv.http.master_url);
    }
};

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
    onLoad: function onLoad() {
        this.setupSpriteFrame();
    },

    setUserID: function setUserID(userid) {
        // if(cc.sys.isNative == false ){
        //     return;
        // }
        if (!userid) {
            return;
        }
        if (cc.vv.images == null) {
            cc.vv.images = {};
        }

        console.log('1111setUserID' + userid);
        var self = this;
        getBaseInfo(userid, function (code, info) {
            console.log('1111getBaseInfo' + info);
            console.log('1111getBaseInfo' + info.url);
            if (info && info.url) {
                loadImage(info.url, userid, function (err, spriteFrame) {
                    console.log('111111err' + err);
                    console.log('111spriteFrame' + spriteFrame);
                    self._spriteFrame = spriteFrame;
                    self.setupSpriteFrame();
                    console.log('1111111111177777777777info' + info.url);
                });
            }
        });
    },

    setupSpriteFrame: function setupSpriteFrame() {
        console.log('111111setupSpriteFrame' + this._spriteFrame);
        if (this._spriteFrame) {
            var spr = this.getComponent(cc.Sprite);
            console.log('111111setupSpriteFramespr' + spr);
            if (spr) {
                spr.spriteFrame = this._spriteFrame;
            }
        }
    }
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});

cc._RF.pop();