"use strict";
cc._RF.push(module, '7ceb0BjiWpNE5ffQxrE+Yto', 'infoBar');
// scripts/sssgame/infoBar.js

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
        roomIdTxt: {
            type: cc.Label,
            default: null
        }
    },

    // use this for initialization
    onLoad: function onLoad() {
        this.refreshInfo();
    },
    refreshInfo: function refreshInfo() {
        var roomid = cc.vv.sssNetMgr.roomId;
        this.roomIdTxt.string = roomid;
    }
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});

cc._RF.pop();