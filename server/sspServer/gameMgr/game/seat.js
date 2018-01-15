var include = require('../../include');
var BaseClass = include.getModel('BaseClass');

var Seat = BaseClass.extend({
	Init:function(){
		this.JS_Name = "Seat";
		
		this.holds = [];           //持有的牌
		this.star = 0;             //星星
		this.liangPai = [];        //亮出来的牌
		this.JLNum = 0;            //金龙数量
		this.YLNum = 0;            //银龙数量
		this.actionType = 0;       //操作类型 0:无 1:吃 2:碰或者杠
		this.WaitingState = false; //等待状态
		this.isTuoGuan = false;    //是否托管
		this.folds = [];           //出过的牌
	},

	initInfo:function(data){
		if(data.disconnectOutTime){
			this.userId = 0;
			return;
		}
		this.userId = data.userId;
		this.name = data.name;
	},
});

module.exports = Seat;