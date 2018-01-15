var radix = 12;
var base = 128 - radix;
function crypto(value){
    value -= base;
    var h = Math.floor(value/radix) + base;
    var l = value%radix + base;
    return String.fromCharCode(h) + String.fromCharCode(l);
}

var encodermap = {}
var decodermap = {}
for(var i = 0; i < 256; ++i){
    var code = null;
    var v = i + 1;
    if(v >= base){
        code = crypto(v);
    }
    else{
        code = String.fromCharCode(v);    
    }
    
    encodermap[i] = code;
    decodermap[code] = i;
}

function encode(data){
    var content = "";
    var len = data.length;
    var a = (len >> 24) & 0xff;
    var b = (len >> 16) & 0xff;
    var c = (len >> 8) & 0xff;
    var d = len & 0xff;
    content += encodermap[a];
    content += encodermap[b];
    content += encodermap[c];
    content += encodermap[d];
    for(var i = 0; i < data.length; ++i){
        content += encodermap[data[i]];
    }
    return content;
}

function getCode(content,index){
    var c = content.charCodeAt(index);
    if(c >= base){
        c = content.charAt(index) + content.charAt(index + 1);
    }
    else{
        c = content.charAt(index);
    }
    return c;
}
function decode(content){
    var index = 0;
    var len = 0;
    for(var i = 0; i < 4; ++i){
        var c = getCode(content,index);
        index += c.length;
        var v = decodermap[c];
        len |= v << (3-i)*8;
    }
    
    var newData = new Uint8Array(len);
    var cnt = 0;
    while(index < content.length){
        var c = getCode(content,index);
        index += c.length;
        newData[cnt] = decodermap[c];
        cnt++;
    }
    return newData;
}

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
        onPlayCallback:null,
        _voiceMediaPath:null,
        _Time:null,
    },

    // use this for initialization
    init: function () {
        
    },
    
    prepare:function(){
        
    },
    
    stopRecord:function(state){
        
    },

    upLoadFile:function(){
        
    },

    upLoadUrl:function(url){
        
    },

    playFromUrl:function(url){
        
    },
    
    getVoiceLevel:function(maxLevel){
        
    },
    stop:function(){
        
    },
});
