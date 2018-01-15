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
        bgmVolume:1.0,
        sfxVolume:1.0,
        
        bgmAudioID:-1,
        hallAudioID:null,
        roomAudioID:null,
    },

    // use this for initialization
    init: function () {
        var t = cc.sys.localStorage.getItem("bgmVolume");
        if(t != null){
            this.bgmVolume = parseFloat(t);
        }
        
        var t = cc.sys.localStorage.getItem("sfxVolume");
        if(t != null){
            this.sfxVolume = parseFloat(t);    
        }
        
        cc.game.on(cc.game.EVENT_HIDE, function () {
            console.log("cc.audioEngine.pauseAll");
            cc.audioEngine.pauseAll();
        });
        cc.game.on(cc.game.EVENT_SHOW, function () {
            console.log("cc.audioEngine.resumeAll");
            cc.audioEngine.resumeAll();
        });
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
    
    getUrl:function(url){
        return cc.url.raw("resources/sounds/" + url);
    },
    
    playBGM(url){
        var audioUrl = this.getUrl(url);
        if(url == "bgFight.mp3"){
            //切歌的时候暂停之前的歌
            if (this.hallAudioID != null) {
                cc.audioEngine.pause(this.hallAudioID);
            }
            //如果没有这首歌就播放
            if(this.roomAudioID == null){
                this.roomAudioID = cc.audioEngine.play(audioUrl,true,this.bgmVolume);
            }
            else {
                cc.audioEngine.resume(this.roomAudioID);
            }
            this.bgmAudioID = this.roomAudioID;
        }
        else if(url == "bgMain.mp3"){
            if (this.roomAudioID != null) {
                cc.audioEngine.pause(this.roomAudioID);
            }
            if(this.hallAudioID == null){
                this.hallAudioID = cc.audioEngine.play(audioUrl,true,this.bgmVolume);
            }
            else {
                cc.audioEngine.resume(this.hallAudioID);
            }
            this.bgmAudioID = this.hallAudioID;
        }
        cc.audioEngine.setVolume(this.bgmAudioID,this.bgmVolume);
        console.log(audioUrl);
        // if(this.bgmAudioID >= 0){
        //     cc.audioEngine.stop(this.bgmAudioID);
        // }
        // this.bgmAudioID = cc.audioEngine.play(audioUrl,true,this.bgmVolume);
    },

    pause:function(){
        cc.audioEngine.pause(this.roomAudioID);
    },

    resume:function(){
        cc.audioEngine.resume(this.roomAudioID);
    },
    
    playSFX(url){
        var audioUrl = this.getUrl(url);
        if(this.sfxVolume > 0){
            var audioId = cc.audioEngine.play(audioUrl,false,this.sfxVolume);    
        }
    },
    
    setSFXVolume:function(v){
        if(this.sfxVolume != v){
            cc.sys.localStorage.setItem("sfxVolume",v);
            this.sfxVolume = v;
        }
    },
    
    setBGMVolume:function(v,force){
        if(this.bgmAudioID >= 0){
            if(v > 0){
                cc.audioEngine.resume(this.bgmAudioID);
            }
            else{
                cc.audioEngine.pause(this.bgmAudioID);
            }
            //cc.audioEngine.setVolume(this.bgmAudioID,this.bgmVolume);
        }
        if(this.bgmVolume != v || force){
            cc.sys.localStorage.setItem("bgmVolume",v);
            this.bgmVolume = v;
            cc.audioEngine.setVolume(this.bgmAudioID,v);
        }
    },
    
    pauseAll:function(){
        cc.audioEngine.pauseAll();
    },
    
    resumeAll:function(){
        cc.audioEngine.resumeAll();
    }
});
