var include = require('../../include');
var BaseClass = include.getModel('BaseClass');
var Compare = require('./compare');

var Player = BaseClass.extend({
	Init:function(){
		this.JS_Name = "Player";
		this._holds = [];
		//this.paiType = Define.NONE;
	},
	initInfo:function(data){
		if(data.disconnectOutTime){
			this.userId = 0;
			return;
		}
		this.userId = data.userId;
	},
})

module.exports = Player;