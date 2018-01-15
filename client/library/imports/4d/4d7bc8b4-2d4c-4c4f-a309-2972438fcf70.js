"use strict";
cc._RF.push(module, '4d7bci0LUxMT6MJKXJDj89w', 'History');
// scripts/components/History.js

"use strict";

var Buffer = require('buffer').Buffer;

cc.Class({
    extends: cc.Component,

    properties: {
        HistoryItemPrefab: {
            default: null,
            type: cc.Prefab
        },
        // foo: {
        //    default: null,
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
        _history: null,
        _viewlist: null,
        _content: null,
        _viewitemTemp: null,
        _historyData: null,
        _curRoomInfo: null,
        _emptyTip: null,
        _gameType: null
    },

    // use this for initialization
    onLoad: function onLoad() {
        this._history = this.node.getChildByName("history");
        this._history.active = false;

        this._emptyTip = this._history.getChildByName("emptyTip");
        this._emptyTip.active = true;

        this._viewlist = this._history.getChildByName("viewlist");
        this._content = cc.find("view/content", this._viewlist);

        this._viewitemTemp = this._content.children[0];
        this._content.removeChild(this._viewitemTemp);

        var node = cc.find("Canvas/bottom_center/btn_zhanji");
        this.addClickEvent(node, this.node, "History", "onBtnHistoryClicked");

        var node = cc.find("Canvas/history/btn_back");
        this.addClickEvent(node, this.node, "History", "onBtnBackClicked");
    },

    addClickEvent: function addClickEvent(node, target, component, handler) {
        var eventHandler = new cc.Component.EventHandler();
        eventHandler.target = target;
        eventHandler.component = component;
        eventHandler.handler = handler;

        var clickEvents = node.getComponent(cc.Button).clickEvents;
        clickEvents.push(eventHandler);
    },

    onBtnBackClicked: function onBtnBackClicked() {
        if (this._curRoomInfo == null) {
            this._historyData = null;
            this._history.active = false;
        } else {
            this.initRoomHistoryList(this._historyData);
        }
    },

    onBtnHistoryClicked: function onBtnHistoryClicked() {
        this._history.active = true;
        var self = this;
        cc.vv.userMgr.getHistoryList(function (data) {
            data.sort(function (a, b) {
                return a.time < b.time;
            });
            self._historyData = data;
            for (var i = 0; i < data.length; ++i) {

                if (data[i].id <= 299999 && data[i].id > 199999) {
                    //十三水
                    var len = 6;
                } else if (data[i].id <= 399999 && data[i].id > 299999) {
                    //四色牌
                    var len = 4;
                }

                for (var j = 0; j < len; ++j) {
                    var s = data[i].seats[j];
                    s.name = new Buffer(s.name, 'base64').toString();
                }
            }
            self.initRoomHistoryList(data);
        });
    },

    dateFormat: function dateFormat(time) {
        var date = new Date(time);
        var dateday = "{0}-{1}-{2}";
        var datetime = "{0}:{1}:{2}";
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        month = month >= 10 ? month : "0" + month;
        var day = date.getDate();
        day = day >= 10 ? day : "0" + day;
        var h = date.getHours();
        h = h >= 10 ? h : "0" + h;
        var m = date.getMinutes();
        m = m >= 10 ? m : "0" + m;
        var s = date.getSeconds();
        s = s >= 10 ? s : "0" + s;
        dateday = dateday.format(year, month, day);
        datetime = datetime.format(h, m, s);
        var date = [];
        date.push(dateday);
        date.push(datetime);
        return date;
    },

    initRoomHistoryList: function initRoomHistoryList(data) {
        for (var i = 0; i < data.length; ++i) {
            var node = this.getViewItem(i);
            var planLen = 0;
            node.idx = i;
            var titleId = "" + (i + 1);
            //node.getChildByName("title").getComponent(cc.Label).string = titleId;
            node.getChildByName("roomNo").getComponent(cc.Label).string = data[i].id;
            if (data[i].id <= 299999 && data[i].id > 199999) {
                //十三水
                node.getChildByName("game").getComponent(cc.Label).string = "十三水";
                planLen = 6;
            } else if (data[i].id <= 399999 && data[i].id > 299999) {
                //四色牌
                node.getChildByName("game").getComponent(cc.Label).string = "四色牌";
                planLen = 4;
            }
            var datetime = this.dateFormat(data[i].time * 1000)[1];
            var dateday = this.dateFormat(data[i].time * 1000)[0];
            node.getChildByName("day").getComponent(cc.Label).string = dateday;
            node.getChildByName("time").getComponent(cc.Label).string = datetime;

            var btnOp = node.getChildByName("btnOp");
            btnOp.idx = i;
            //btnOp.getChildByName("Label").getComponent(cc.Label).string = "详情";

            for (var j = 0; j < planLen; ++j) {
                var s = data[i].seats[j];
                var info = s.name;
                var len = info.length;
                if (len > 2) {
                    var str = info.substring(0, 2);
                    node.getChildByName("info" + j).getComponent(cc.Label).string = str + "...";
                } else {
                    node.getChildByName("info" + j).getComponent(cc.Label).string = info;
                }
            }
            for (var j = 0; j < planLen; ++j) {
                var s = data[i].seats[j];
                var infoScore = s.score;
                if (s.name == "") {
                    infoScore = "";
                }
                //console.log(info);
                node.getChildByName("infoScore" + j).getComponent(cc.Label).string = infoScore;
            }
            if (data[i].id <= 399999 && data[i].id > 299999) {
                //四色牌第5人第6人为空
                node.getChildByName("infoScore" + 4).getComponent(cc.Label).string = "";
                node.getChildByName("info" + 4).getComponent(cc.Label).string = "";
                node.getChildByName("infoScore" + 5).getComponent(cc.Label).string = "";
                node.getChildByName("info" + 5).getComponent(cc.Label).string = "";
            }
        }
        this._emptyTip.active = data.length == 0;
        this.shrinkContent(data.length);
        this._curRoomInfo = null;
    },

    initSSPGameHistoryList: function initSSPGameHistoryList(roomInfo, data) {
        data.sort(function (a, b) {
            return a.create_time < b.create_time;
        });
        for (var i = 0; i < data.length; ++i) {
            var node = this.getViewItem(i);
            var idx = data.length - i - 1;
            node.idx = idx;
            var titleId = "" + (idx + 1);
            node.getChildByName("roomNo").getComponent(cc.Label).string = roomInfo.id;
            node.getChildByName("game").getComponent(cc.Label).string = "四色牌";
            var datetime = this.dateFormat(data[i].create_time * 1000)[1];
            var dateday = this.dateFormat(data[i].create_time * 1000)[0];
            node.getChildByName("day").getComponent(cc.Label).string = dateday;
            node.getChildByName("time").getComponent(cc.Label).string = datetime;

            var btnOp = node.getChildByName("btnOp");
            btnOp.idx = idx;

            var result = JSON.parse(data[i].result);
            for (var j = 0; j < 4; ++j) {
                var s = roomInfo.seats[j];
                var info = s.name;
                var len = info.length;
                if (len > 2) {
                    var str = info.substring(0, 2);
                    node.getChildByName("info" + j).getComponent(cc.Label).string = str + "...";
                } else {
                    node.getChildByName("info" + j).getComponent(cc.Label).string = info;
                }
            }
            for (var j = 0; j < 4; ++j) {
                var s = roomInfo.seats[j];
                if (s.name === "") {
                    node.getChildByName("infoScore" + j).getComponent(cc.Label).string = "";
                    node.getChildByName("info" + j).getComponent(cc.Label).string = "";
                    continue;
                }
                var infoScore = result[j];
                if (!infoScore) {
                    var infoScore = 0;
                }
                //console.log(info);
                node.getChildByName("infoScore" + j).getComponent(cc.Label).string = infoScore;
            }
            if (roomInfo.id <= 399999 && roomInfo.id > 299999) {
                //四色牌第5人第6人为空
                node.getChildByName("infoScore" + 4).getComponent(cc.Label).string = "";
                node.getChildByName("info" + 4).getComponent(cc.Label).string = "";
                node.getChildByName("infoScore" + 5).getComponent(cc.Label).string = "";
                node.getChildByName("info" + 5).getComponent(cc.Label).string = "";
            }
        }
        this.shrinkContent(data.length);
        this._curRoomInfo = roomInfo;
    },

    getViewItem: function getViewItem(index) {
        var content = this._content;
        if (content.childrenCount > index) {
            return content.children[index];
        }
        var node = cc.instantiate(this._viewitemTemp);
        content.addChild(node);
        return node;
    },
    shrinkContent: function shrinkContent(num) {
        while (this._content.childrenCount > num) {
            var lastOne = this._content.children[this._content.childrenCount - 1];
            this._content.removeChild(lastOne, true);
        }
    },

    getGameListOfRoom: function getGameListOfRoom(idx) {
        var self = this;
        var roomInfo = this._historyData[idx];
        cc.vv.userMgr.getSSPGamesOfRoom(roomInfo.uuid, function (data) {
            if (data != null && data.length > 0 && roomInfo.id > 299999 && roomInfo.id <= 399999) {
                //四色牌
                self.initSSPGameHistoryList(roomInfo, data);
                self._gameType = 3;
            }
        });
    },

    getSSPDetailOfGame: function getSSPDetailOfGame(idx) {
        var self = this;
        var roomUUID = this._curRoomInfo.uuid;
        cc.vv.userMgr.getSSPDetailOfGame(roomUUID, idx, function (data) {
            data.base_info = JSON.parse(data.base_info);
            data.action_records = JSON.parse(data.action_records);

            // var PlaneLen = 0;//游戏人数
            // for(var i = 0; i < self._curRoomInfo.seats.length; ++i){
            //     if(self._curRoomInfo.seats[i].userid > 0){
            //         PlaneLen++;
            //     }
            // }
            // if(data.base_info.game_seats[PlaneLen-1] === null && cc.vv.userMgr.userId === self._curRoomInfo.seats[PlaneLen-1].userid){ //如果是观察者 看不了回放
            //     return;
            // }

            cc.vv.sspNetMgr.prepareReplay(self._curRoomInfo, data);
            cc.vv.replayMgr.init(data);
            cc.vv.sspNetMgr.gamestate = 'replay';
            cc.vv.sspNetMgr.numOfMJ = 0;
            cc.vv.sspNetMgr.numOfGames = 0;
            cc.vv.sspNetMgr.maxNumOfGames = 0;
            cc.director.loadScene("sspgame");
        });
    },

    onViewItemClicked: function onViewItemClicked(event) {
        var idx = event.target.idx;
        console.log(idx);
        var roomInfo = this._historyData[idx];
        if (this._curRoomInfo == null) {
            this.getGameListOfRoom(idx);
        } else if (this._gameType === 3) {
            //四色牌
            this.getSSPDetailOfGame(idx);
        }
    },

    onBtnOpClicked: function onBtnOpClicked(event) {
        var idx = event.target.parent.idx;
        console.log(idx);
        var roomInfo = this._historyData[idx];
        if (this._curRoomInfo == null) {
            this._gameType = 0;
            this.getGameListOfRoom(idx);
        } else if (this._gameType === 3) {
            //四色牌
            this.getSSPDetailOfGame(idx);
        }
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});

cc._RF.pop();