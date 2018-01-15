"use strict";
cc._RF.push(module, 'b1cc9yRd15CXqFg0vTGKZUk', 'Net');
// scripts/Net.js

"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

if (window.io == null) {
    window.io = require("socket-io");
}

var deepCopy = function deepCopy(source) {
    console.log("source:");
    console.log(source);
    var result = {};
    for (var key in source) {
        //result[key] = (typeof source[key] === 'object' ? deepCopy(source[key]) : source[key]);
        console.log("source[key]:");
        console.log("key:" + key);
        if (_typeof(source[key]) === 'object') {
            console.log("11111111111111111");
            result[key] = deepCopy(source[key]);
        } else {
            console.log("22222222222222222222222222");
            result[key] = source[key];
        }
    }
    console.log("result:");
    console.log(result);
    return result;
};

// var deepCopy = function(obj){
//     console.log("obj : ");
//     if(typeof obj != 'object'){
//         return obj;
//     }
//     var newobj = {};
//     for ( var key in obj) {
//         newobj[key] = deepCopy(obj[key]);
//         console.log("newobj[key]");
//         console.log(newobj[key]);
//     }
//     return newobj;
// }

var Global = cc.Class({
    extends: cc.Component,
    statics: {},

    ctor: function ctor() {
        console.log("Net ctor");
        this.ip = "";
        this.sio = null;
        this.isPinging = false;
        this.isReconnect = true;
        this.fnDisconnect = null;
        this.handlers = {};
        this.isExit = false;
        console.log("window.io:");
        console.log(window.io);
        //this.io = require("socket-io");
        //this.io = deepCopy(window.io);
        console.log("this.io:");
        console.log(this.io);
    },
    addHandler: function addHandler(event, fn) {
        if (this.handlers[event]) {
            console.log("event:" + event + "' handler has been registered.");
            return;
        }

        var handler = function handler(data) {
            //console.log(event + "(" + typeof(data) + "):" + (data? data.toString():"null"));
            if (event != "disconnect" && typeof data == "string") {
                data = JSON.parse(data);
            }
            fn(data);
        };

        this.handlers[event] = handler;
        if (this.sio) {
            console.log("register:function " + event);
            this.sio.on(event, handler);
        }
    },

    removeAllHandler: function removeAllHandler() {
        this.handlers = {};
        if (this.sio) {
            this.sio.off();
        }
    },

    connect: function connect(fnConnect, fnError) {
        var self = this;
        this.isExit = false;
        var opts = {
            'reconnection': false,
            'force new connection': true,
            'transports': ['websocket', 'polling']
        };
        console.log("this.io:" + this.io);
        //this.sio = this.io.connect(this.ip,opts);
        console.log("this.sio:" + this.sio);
        this.sio = window.io.connect(this.ip, opts);
        this.sio.on('reconnect', function () {
            console.log('reconnection');
        });
        this.sio.on('connect', function (data) {
            console.log("connect");
            self.sio.connected = true;
            fnConnect(data);
        });
        this.sio.on('disconnect', function (data) {
            console.log("disconnect");
            self.sio.connected = false;
            self.close();
        });
        this.sio.on('connect_failed', function () {
            console.log('connect_failed');
        });
        for (var key in this.handlers) {
            var value = this.handlers[key];
            if (typeof value == "function") {
                if (key == 'disconnect') {
                    this.fnDisconnect = value;
                } else {
                    console.log("register:function " + key);
                    this.sio.on(key, value);
                }
            }
        }
        this.startHearbeat();
    },

    startHearbeat: function startHearbeat() {
        this.sio.on('game_pong', function () {
            self.lastRecieveTime = Date.now();
            self.delayMS = self.lastRecieveTime - self.lastSendTime;
            console.log(self.delayMS);
        });
        this.lastRecieveTime = Date.now();
        var self = this;
        console.log(1);
        if (!self.isPinging) {
            self.isPinging = true;
            cc.game.on(cc.game.EVENT_HIDE, function () {
                self.ping();
            });

            setInterval(function () {
                if (self.sio) {
                    self.ping();
                }
            }.bind(this), 5000);
            setInterval(function () {
                if (self.sio) {
                    if (Date.now() - self.lastRecieveTime > 200000) {
                        //self.close();
                    }
                }
            }.bind(this), 500);
        }
    },
    send: function send(event, data) {
        if (this.sio && this.sio.connected) {
            if (data != null && (typeof data === "undefined" ? "undefined" : _typeof(data)) == "object") {
                data = JSON.stringify(data);
                //console.log(data);              
            }
            this.sio.emit(event, data);
        }
    },

    ping: function ping() {
        if (this.sio && !this.isExit) {
            console.log('this.lastSendTime' + this.lastSendTime);
            this.lastSendTime = Date.now();
            this.send('game_ping');
        }
    },

    close: function close() {
        console.log('close00000');
        this.delayMS = null;
        if (this.sio && this.sio.connected) {
            this.sio.connected = false;
            this.sio.disconnect();
        }
        this.sio = null;
        if (this.fnDisconnect) {
            this.fnDisconnect();
            this.fnDisconnect = null;
        }
    },

    test: function test(fnResult) {
        var xhr = null;
        var fn = function fn(ret) {
            fnResult(ret.isonline);
            xhr = null;
        };

        var arr = this.ip.split(':');
        var data = {
            account: cc.vv.userMgr.account,
            sign: cc.vv.userMgr.sign,
            serverType: cc.vv.userMgr.serverType,
            ip: arr[0],
            port: arr[1]
        };
        xhr = cc.vv.http.sendRequest("/is_server_online", data, fn);
        setTimeout(function () {
            if (xhr) {
                xhr.abort();
                fnResult(false);
            }
        }, 1500);
        /*
        var opts = {
            'reconnection':false,
            'force new connection': true,
            'transports':['websocket', 'polling']
        }
        var self = this;
        this.testsio = window.io.connect(this.ip,opts);
        this.testsio.on('connect',function(){
            console.log('connect');
            self.testsio.close();
            self.testsio = null;
            fnResult(true);
        });
        this.testsio.on('connect_error',function(){
            console.log('connect_failed');
            self.testsio = null;
            fnResult(false);
        });
        */
    }
});

cc._RF.pop();