"use strict";
cc._RF.push(module, 'b717fzww0hNzIqvNbb1t9wx', 'Utils');
// scripts/Utils.js

'use strict';

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

    addClickEvent: function addClickEvent(node, target, component, handler) {
        console.log(component + ":" + handler);
        var eventHandler = new cc.Component.EventHandler();
        eventHandler.target = target;
        eventHandler.component = component;
        eventHandler.handler = handler;

        var clickEvents = node.getComponent(cc.Button).clickEvents;
        clickEvents.push(eventHandler);
    },

    addSlideEvent: function addSlideEvent(node, target, component, handler) {
        var eventHandler = new cc.Component.EventHandler();
        eventHandler.target = target;
        eventHandler.component = component;
        eventHandler.handler = handler;

        var slideEvents = node.getComponent(cc.Slider).slideEvents;
        slideEvents.push(eventHandler);
    },

    addEscEvent: function addEscEvent(node) {
        cc.eventManager.addListener({
            event: cc.EventListener.KEYBOARD,
            onKeyPressed: function onKeyPressed(keyCode, event) {},
            onKeyReleased: function onKeyReleased(keyCode, event) {
                if (keyCode == cc.KEY.back) {
                    cc.vv.alert.show('提示', '确定要退出游戏吗？', function () {
                        cc.game.end();
                    }, true);
                }
            }
        }, node);
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});

cc._RF.pop();