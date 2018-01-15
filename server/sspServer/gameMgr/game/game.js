var include = require('../../include');
var BaseClass = include.getModel('BaseClass');
var Seat = include.getModel('Seat');
var userMgr = include.getModel('userMgr');
var roomMgr = include.getModel('roomMgr');
var GameState = include.getModel('DEFINE').GameState;
var ActionType = include.getModel('DEFINE').ActionType;
var arithmetic = require('./arithmetic');
var userDB = require('../../../DB/managers/userDBMgr');
var gameDB = require("../../../DB/managers/gamesDBMgr");
var roomDB = require("../../../DB/managers/roomDBMgr");
var archiveDB = require('../../../DB/managers/archiveDBMgr_SSP');
var crypto = require("../../../utils/crypto");

var Game = BaseClass.extend({
	Init:function(roomInfo){
		this.JS_Name = "Game";
		this.roomInfo = roomInfo;
		this.roomInfo.state = GameState.GAME_PREPARE;
		this.gameIndex = roomInfo.numOfGames;
		this.button = roomInfo.nextButton;
		this.conf = roomInfo.conf;
		this.forceEnd = false;
		this.closeTimer();

		//初始化参数
		this.initParam();
		//初始化房间信息
		this.initSeats();
	},

	initParam:function(){
		this._cards = [];      //牌组

		this.turn = 0;         //当前出牌人的座位编号
		this.currentIndex = 0; //摸到第几张牌
		this.chupaiTime = 0;   //最后一个出牌的时间戳
		this.canChuPai = true; //能否出牌

		this.gameSeats =  [];  //玩家

		this.diPai = null;     //记录断线重连 /底牌
		this.diPais = [];      //记录断线重连 /多张底牌
		this.chuPai = null;    //记录断线重连 /出的牌
		this.Operations = [];  //记录断线重连 /操作
		
		this.isGameOver = false;  //是否游戏结束
		this.isTianHu = false;    //是否天胡
		this.isFirstRound = true; //是否第一轮
		this.paiOfcalculate = []; //用来计算分数的牌组

		this.arr_guoIndex = []; //托管 /过操作的玩家座位
		this.guoPai = null;     //托管 /过掉的牌
		
		this.actionList = [];   //记录回放

		this.isPressHu = false; //是否按下胡
	},

	begin:function(){
		this.roomInfo.numOfGames++;
		this.roomInfo.state = GameState.GAME_START;

		//洗牌
		this.shuffle();
		//发牌
		this.fapai();

		this.construct_game_base_info();
	},

	construct_game_base_info:function(){
		var len = this.gameSeats.length;
	    var baseInfo = {
	        type:this.conf.type,
	        button:this.button,
	        index:this.gameIndex,
	        game_seats:new Array(len),
	        game_star:new Array(len)
	    }
	    for(var i = 0; i < len; ++i){
	    	var seatData = this.gameSeats[i];
	    	var holds = [];
	    	for(var j = 0; j < seatData.holds.length; j++){
	    		holds.push([seatData.holds[j].type,seatData.holds[j].value]);
	    	}
	        baseInfo.game_seats[i] = holds;
	        baseInfo.game_star[i] = seatData.star;
	    }
	    this.baseInfoJson = JSON.stringify(baseInfo);
	},

	shuffle:function(){
		if(!this._cards){
			this._cards = [];
		}
		var arrType = [];
		arrType = [0,1,2,3];
		var index = 0;

		//type: 0红,1白,2绿,3黄,4公侯伯子男
		//value: 1:将,2:士,3:相,4:车,5:马,6:炮,7:卒
		for(let i = 0; i < arrType.length; i++){
			for(var j = 1; j < 8; j++){
				for(var x = 0; x < 4; x++){
					var card = {
						type:arrType[i],
						value:j
					}
					this._cards.push(card);
				}
			}
		}
		//value: 8:公,9:候,10:伯,11:子,12:男
		for(let i = 8; i < 13; i++){
			var card = {
				type:4,
				value:i
			}
			this._cards.push(card);
		}

		var len = this._cards.length;
		for (var i = 0; i < len; i++) {
			var lastIndex = len - 1 - i;
	        var index = Math.floor(Math.random() * lastIndex);
	        var t = this._cards[index];
	        this._cards[index] = this._cards[lastIndex];
	        this._cards[lastIndex] = t;
		}
	},

	initSeats:function(){
		var seats = this.roomInfo.seats;
		var seatNum = 0;
		for(let i = 0; i < this.roomInfo.seats.length; i++){
			if(this.roomInfo.seats[i].userId > 0){
				seatNum++;
			}
		}
		for(let i = 0; i < seatNum; ++i){
	        var seat = (this.gameSeats[i] || new Seat());
			seat.initInfo(this.roomInfo.seats[i]);
			this.gameSeats[i] = seat;
			this.gameSeats[i].JS_Name = this.roomInfo.seats[i].name;
	    }
	},

	//断线重连数据下发
	playerComeBack:function(userId){
        var numofPai = this._cards.length - this.currentIndex;
        var data = {
            state: this.roomInfo.state,
            numofpai: numofPai,
            button:this.button,
            turn:this.turn,
            chuPai: this.chuPai,
			maxGames: this.roomInfo.conf.maxGames,
			numOfGames: this.roomInfo.numOfGames,
			dipai: this.diPai,
			dipais: this.diPais
        };
		data.seats = [];
		for(var i = 0; i < this.gameSeats.length; ++i){
			var rs = this.roomInfo.seats[i];
			this.gameSeats[i].isTuoGuan = false;
			var online = false;
			if(rs.userId > 0){
				online = userMgr.isOnline(rs.userId);
			}else{
				continue;
			}

			if(this.gameSeats[i].userId == userId){
				var holds = this.gameSeats[i].holds;
			}else{
				var holds = [];
			}
			var s = {
				userId: rs.userId,
				ip: rs.ip,
				score: rs.score,
				name: rs.name,
				online: online,
				seatindex: i,
				holds: this.gameSeats[i].holds.length,
				liangPai: this.gameSeats[i].liangPai,
				star: this.gameSeats[i].star,
				folds: this.gameSeats[i].folds
			}
			
			data.seats.push(s);
		}

		if(this.Operations.length > 0){
			for(var i = 0; i < this.Operations.length; i++){
				if(this.Operations[i].userId == userId){
					data.Operations = this.Operations[i].Operations;
				}
			}
		}

		if(this.roomInfo.state === GameState.GAME_PREPARE){
			
		}
		else if(this.roomInfo.state === GameState.GAME_START){
			let arrpai = this.getHolds(userId);
			let yinLong = arithmetic.getPai_YL(arrpai);
			data.holds = {
	        	holds: arrpai,
	        	longPai: yinLong
	        };
		}
		else if(this.roomInfo.state === GameState.GAME_OVER){
			
		}

        //同步整个信息给客户端
        userMgr.sendMsg(userId,'game_sync_push',data);
        userMgr.sendMsg(userId,'game_gameState_push',{gameState:this.roomInfo.state});
	},

	recordGameAction:function(si,action,arrPai){
		this.actionList.push(si);
	    this.actionList.push(action);
	    if(action > 9){
	    	this.actionList.push(arrPai);
	    }else{
	    	for(var i = 0; i < arrPai.length; i++){
				if(arrPai[i]){
					this.actionList.push({
						T: arrPai[i].type,
						V: arrPai[i].value
					})
				}else{
					this.actionList.push({
						T: 0,
						V: 1
					})
				}
	    	}
	    }
	},

	fapai:function(){
		var seatNum = this.gameSeats.length;
		var fapaiNum = seatNum * 20;
		var seatIndex = this.button;
		for(let i = 0; i < fapaiNum; ++i){
	        this.mopai(seatIndex, true);
	        seatIndex ++;
	        seatIndex %= seatNum;
	    }

	    //庄家多摸最后一张
	    var moPai = this.mopai(this.button, true);
	    
	    //当前轮设置为庄家
		this.turn = this.button;

	    this.chupaiTime = Math.ceil(Date.now() / 1000);
    	userMgr.broacastInRoom('game_begin_chupaiTime_push',{chupaiTime:this.chupaiTime},this.gameSeats[0].userId,true);
    	userMgr.broacastInRoom('game_gameState_push',{gameState:this.roomInfo.state},this.gameSeats[0].userId,true);

    	var numOfPai = this._cards.length - this.currentIndex;
    	for(let i = 0; i < seatNum; ++i){
    		var s = this.roomInfo.seats[i];

	        //通知手牌
	        var arrYL = arithmetic.getPai_YL(this.gameSeats[i].holds);
	        var data = {
	        	holds: this.gameSeats[i].holds,
	        	longPai: arrYL
	        };
	        userMgr.sendMsg(s.userId,'game_holds_push',data);

	        //通知还剩多少张牌
	        userMgr.sendMsg(s.userId,'ssp_count_push',numOfPai);

	        //通知还剩多少局
	        userMgr.sendMsg(s.userId,'game_num_push',this.roomInfo.numOfGames);

	        //通知游戏开始
	        userMgr.sendMsg(s.userId,'game_begin_push',this.button);

	        //记录玩家星星
	        this.gameSeats[i].star = this.gameSeats[i].YLNum = arrYL.length;
	    }

	    //通知玩家星星
	    var totalYLNum = 0;
	    var star = [];
	    for(let i = 0; i < seatNum; i++){
	    	let seat = {
		    	userId: this.gameSeats[i].userId,
		    	star: this.gameSeats[i].star
		    };
		    star.push(seat);
		    totalYLNum += this.gameSeats[i].star;
	    }
	    userMgr.broacastInRoom('game_star_notify_push',{star: star},this.gameSeats[0].userId,true);
	    this.recordGameAction(0,ActionType.ACTION_STAR,{star: star});

	    //通知玩家底牌
	    var index = this._cards.length - 1;
	    var dipai = this._cards[index];
	    this.diPai = dipai;
	    userMgr.broacastInRoom('game_dipai_notify_push',{pai: dipai},this.gameSeats[0].userId,true);

	    //有五个以上的银龙，翻七张底牌
	    if(totalYLNum > 4){
	    	var dipais = [];
	    	var _index = this._cards.length - 7;
	    	for(let i = _index; i < this._cards.length; i++){
	    		dipais.push(this._cards[i]);
	    		this.diPais.push(this._cards[i]);
	    	}
	    	userMgr.broacastInRoom('5yinlong_dipai_notify_push',{pai: dipais},this.gameSeats[0].userId,true);
	    	this.recordGameAction(0,ActionType.ACTION_DIPAI,{pai: dipais});
	    }

	    //取金龙
	    this.pushJinLong();
	    //初始算分
	    this.initScore();
	    //检测天胡
	    this.checkTianHu(this.turn);
	    //托管
		this.tuoGuan_chuPai();
	},

	pushJinLong:function(){
		for(let i = 0; i < this.gameSeats.length; i++){
	    	var seatData = this.gameSeats[i];
	    	var arrJL = arithmetic.getPai_JL(seatData.holds);
	    	seatData.JLNum = arrJL.length;
	    	for(let j = 0; j < arrJL.length; j++){
	    		seatData.liangPai.push({
	    			pai: arrJL[j],
	    			type: 'jinLong'
	    		});
	    		for(let t = 0; t < 4; t++){
					var index = arithmetic.getIndex(seatData.holds, arrJL[j][0]);
					seatData.holds.splice(index,1);
				}
	    	}
	    }
	},

	initScore:function(){
		for(let i = 0; i < this.gameSeats.length; i++){
			let seatData = this.gameSeats[i];
			if(seatData.YLNum > 0){
				for(let j = 0; j < this.gameSeats.length; j++){
					if(i == j){
						continue;
					}
					this.roomInfo.seats[j].score -= (seatData.YLNum * 1);
					this.roomInfo.seats[i].score += (seatData.YLNum * 1);
				}
			}
		}
		this.scoreNotify();
	},

	checkTianHu:function(seatIndex){
		var seatData = this.gameSeats[seatIndex];
		var index = seatData.holds.length - 1;
		var pai = seatData.holds[index];
		var holds = seatData.holds.concat();
		holds.splice(index, 1);
	    var arr_huPai = arithmetic.getPai_hu(holds, pai);
	    if(arr_huPai != null){
	    	this.isGameOver = true;
			this.isTianHu = true;
			seatData.holds = [];

        	this.paiOfcalculate = seatData.liangPai.concat();
	    	for(let i = 0; i < arr_huPai.length; i++){
				if(arr_huPai[i].type == 'peng'){
					arr_huPai[i].type = 'yinLong';
				}
	    		this.paiOfcalculate.push(arr_huPai[i]);
	    		seatData.liangPai.push(arr_huPai[i]);
        	}
        	this.hu(seatData.userId,null);
	    }
	},
	
	tuoGuan_chuPai:function(){
		this.closeTimer();
		this.lastTime = 60000;
		this.overplusTime = setInterval(function(self){
			if(self.lastTime > 0){
				self.lastTime -= 1000;
				userMgr.broacastInRoom('out_card_lastTime',self.lastTime,self.gameSeats[0].userId,true);
			}else{
				self.closeTimer();

				var seatData = self.gameSeats[self.turn];
				userMgr.sendMsg(seatData.userId,'game_tuoGuan_push');
				seatData.isTuoGuan = true;
				var holds = seatData.holds.concat();
				arithmetic.sortSSP(holds);
				for(let i = 0; i < holds.length; i++){
					self.chupai(seatData.userId, holds[i]);
					if(!self.canChuPai){
						return;
					}
				}
			}
		},1000,this);
	},

	tuoGuan_guo:function(){
		this.closeTimer();
		this.lastTime = 60000;
		this.overplusTime = setInterval(function(self){
			if(self.lastTime > 0){
				self.lastTime -= 1000;
				userMgr.broacastInRoom('out_card_lastTime',self.lastTime,self.gameSeats[0].userId,true);
			}else{
				self.closeTimer();
				for(let i = 0; i < self.arr_guoIndex.length; ){
					let index = self.arr_guoIndex[i];
					let seatData = self.gameSeats[index];
					userMgr.sendMsg(seatData.userId,'game_tuoGuan_push');
					seatData.isTuoGuan = true;
					self.guo(seatData.userId, self.guoPai);
				}
			}
		},1000,this);
	},

	tuoGuan_moPai:function(){
		this.closeTimer();
		this.lastTime = 1000;
		this.overplusTime = setInterval(function(self){
			if(self.lastTime > 0){
				self.lastTime -= 1000;
				userMgr.broacastInRoom('out_card_lastTime',self.lastTime,self.gameSeats[0].userId,true);
			}else{
				self.closeTimer();
				self.doUserMoPai();
			}
			
		},1000,this);
	},

	tuoGuan_huPai:function(userId, pai){
		this.closeTimer();
		this.lastTime = 15000;
		this.huUserId = userId;
		this.huPai = pai;
		this.overplusTime = setInterval(function(self){
			if(self.lastTime > 0){
				self.lastTime -= 1000;
				userMgr.broacastInRoom('out_card_lastTime',self.lastTime,self.gameSeats[0].userId,true);
			}else{
				self.closeTimer();
				self.hu(self.huUserId, self.huPai);
			}
		},1000,this);
	},

	closeTimer:function(){
		if(this.overplusTime){
			clearInterval(this.overplusTime);
		}
		this.overplusTime = null;
	},

	closeTimerOfMoPai:function(){
		if(this.timeoutAutoMoPai){
			clearTimeout(this.timeoutAutoMoPai);
		}
		this.timeoutAutoMoPai = null;
	},

	closeTimerOfHuPai:function(){
		if(this.overplusTimeOfHuPai){
			clearInterval(this.overplusTimeOfHuPai);
		}
		this.overplusTimeOfHuPai = null;
		
	},

	mopai:function(seatIndex, isPush){
	    if(this.currentIndex == this._cards.length){
	    	this.isGameOver = true;
	    	this.draw(false);
	        return -1;
	    }
	    var pai = this._cards[this.currentIndex];
	    this.currentIndex++;

	    if(isPush){
	    	this.gameSeats[seatIndex].holds.push(pai);
	    }
	    return pai;
	},

	chupai:function(userId, pai){
		var seatIndex = roomMgr.getUserSeat(userId);
	    var seatData = this.gameSeats[seatIndex];
	    if(seatData == null){
	        return;
	    }
		if(!this.canChuPai){
			return;
		}
		if(this.isGameOver){
	    	return;
	    }
	    //如果不该他出，则忽略
	    if(this.turn != seatIndex){
	        return;
		}

		//将,公,候,伯,子,男不能出
		if(pai.value < 2 || pai.value > 7){
			return;
		}

		//判断锁牌
		var isSuoPai = this.checkSuoPai(seatData.holds, pai);
		if(isSuoPai){
			return;
		}

		//关闭定时器
		this.closeTimer();

		//从此人牌中扣除
	    this.chupaiTime = Math.ceil(Date.now() / 1000);
	    var index = arithmetic.getIndex(seatData.holds, pai);
	    seatData.holds.splice(index,1);
	    this.canChuPai = false;
	    this.chuPai = pai;

	    this.recordGameAction(seatIndex,ActionType.ACTION_CHUPAI,[pai]);

	    userMgr.broacastInRoom('game_chupai_notify_push',{userId:seatData.userId,pai:pai,chupaiTime:this.chupaiTime},seatData.userId,true);
		//开金龙
		this.kaiJinLong(userId);
	    //检查是否有人要吃碰杠
	    var hasActions = this.checkOperations(1, pai);
	    if(this.isGameOver){
	    	return;
	    }
	    this.isFirstRound = false;
	    //如果没有人有操作，则向下一家发牌
	    if(!hasActions){
	    	this.chuPai = null;
	    	this.gameSeats[this.turn].folds.push(pai);
	    	this.moveToNextUser();
	    	let curUserId = this.gameSeats[this.turn].userId;
			userMgr.broacastInRoom('fapai_notify_push',{userId:curUserId,pai:pai},curUserId,true);
			this.recordGameAction(this.turn,ActionType.ACTION_GUO,[pai]);
	        this.tuoGuan_moPai();
	    }else{
	    	userMgr.broacastInRoom('game_wait_push',{userId:seatData.userId},seatData.userId,true);
	    }

	},

	checkOperations:function(type, pai){
		//type: 1 出牌的检测 ， 2 摸牌的检测
		var hasActions = false;
		var arrData = [];
		var arrHuPai = [];
		var seatNum = this.gameSeats.length;
		var Next = this.turn + 1;
		Next %= seatNum;
	    for(let i = 0; i < seatNum; i++){
	        let seat = this.gameSeats[i];
	        
	        if(this.turn == i){
	        	if(1 == type){
	        		arrData.push({
	        			chi: false,
						peng: false,
						gang: false,
						hu: false,
						pai: pai
	        		});
	        		continue;
	        	}else if(2 == type){
	        		if(seat.isTuoGuan){
	        			var data = this.checkDetailed(seat.holds, pai, i, 1);
	        		}else{
	        			var data = this.checkDetailed(seat.holds, pai, i, 3);
	        		}
	        	}
	        }else{
	        	//下家能吃碰杠，不是下家只能碰杠
	        	if(seat.isTuoGuan){
	        		var data = this.checkDetailed(seat.holds, pai, i, 1);
	        	}else if(i == Next){
		        	if(1 == pai.value){
		        		var data = this.checkDetailed(seat.holds, pai, i, 2);
		        	}else{
		        		var data = this.checkDetailed(seat.holds, pai, i, 3);
		        	}
		        }else{
		        	var data = this.checkDetailed(seat.holds, pai, i, 2);
		        }
	        }
	        arrData.push(data);
	        if(data.hu){
	        	arrHuPai.push({
	        		index: i,
	        		huPai: data.huPai
	        	});
	        }
		}
		var huIndex = this.checkManyHu(arrData, arrHuPai, pai);

		this.arr_guoIndex = [];
		this.guoPai = null;
		for(let i = 0; i < arrData.length; i++){
			let seat = this.gameSeats[i];
			userMgr.sendMsg(seat.userId,'game_action_push',arrData[i]);
			
	        if(arrData[i].chi || arrData[i].peng || arrData[i].gang){
	        	hasActions = true;

	        	this.Operations.push({
					userId: seat.userId,
					Operations: arrData[i]
				});
	        	
	        	this.arr_guoIndex.push(i);

	        	if(arrData[i].peng || arrData[i].gang){
	        		seat.actionType = 2;
	        	}else if(arrData[i].chi){
	        		seat.actionType = 1;
	        	}
	        }
		}

		if(this.isGameOver){
			let huSeat = this.gameSeats[huIndex];
			if(huSeat.isTuoGuan){
				this.hu(huSeat.userId, pai);
			}else{
				this.tuoGuan_huPai(huSeat.userId, pai);
			}
			return false;
		}

		if(hasActions){
			this.guoPai = pai;
			this.tuoGuan_guo();
		}

		return hasActions;
	},

	checkDetailed:function(arrPai, pai, index, type){
		//type: 1 检测胡牌 ；2 检测碰和杠 ； 3 检测吃碰杠
		var canChi = false;
		var canPeng = false;
		var canGang = false;

		if(type > 2){
			let chiPai = arithmetic.getPai_chi(arrPai,pai);
			if(chiPai.length > 0){
				canChi = true;
			}
		}

		if(type != 1){
			let pengPai = arithmetic.getPai_peng(arrPai,pai);
			if(pengPai.length > 0){
				canPeng = true;
			}
			let gangPai = arithmetic.getPai_gang(arrPai,pai);
			if(gangPai.length > 0){
				canGang = true;
			}

			if(canGang){
				canChi = false;
				canPeng = false;
			}
		}

		var data = {
			chi: canChi,
			peng: canPeng,
			gang: canGang,
			hu: false,
			pai: pai
		};

		let huPai = arithmetic.getPai_hu(arrPai, pai);
        if(huPai != null){
        	data.hu = true;
        	data.huPai = huPai;
        	this.isGameOver = true;
        }
		return data;
	},

	checkManyHu:function(arrData, arrHuPai, pai){
		if(!this.isGameOver){
			return null;
		}
		var index = 0;
		var isClear = false;
		var huIndex = 0;
		for(let i = 0; i < arrData.length; i++){
			var seatindex = this.turn + index;
			seatindex %= arrData.length;
			if(isClear){
				arrData[seatindex].hu = false;
			}
			if(arrData[seatindex].hu){
				isClear = true;
				huIndex = seatindex;
			}
			index++;
		}
		var seatData = this.gameSeats[huIndex];
		for(let t = 0; t < arrHuPai.length; t++){
			if(arrHuPai[t].index != huIndex){
				continue;
			}

			var huPai = arrHuPai[t].huPai;
			this.paiOfcalculate = seatData.liangPai.concat();
			for(let i = 0; i < huPai.length; i++){
        		this.paiOfcalculate.push(huPai[i]);
        		if(huPai[i].type == 'kaiYinLong'){
        			for(let j = 0; j < this.gameSeats.length; j++){
				    	if(j == huIndex){
				    		continue;
				    	}
				    	this.roomInfo.seats[j].score -= 2;
						this.roomInfo.seats[huIndex].score += 2;
				    }
        		}
        	}
			
			for(let i = 0; i < huPai.length; i++){
        		var isFind = false;
        		for(let j = 0; j < huPai[i].pai.length; j++){
        			if(huPai[i].pai[j].type == pai.type && huPai[i].pai[j].value == pai.value){
        				let array = huPai[i].pai.concat();
        				index = arithmetic.getIndex(array, pai);
        				array.splice(index, 1);
        				seatData.liangPai.push({
        					pai: array,
        					type: huPai[i].type
						});
						this.removePai(this.gameSeats[huIndex].userId, huPai[i].pai, pai);
        				isFind = true;
        				break;
        			}
        		}
        		if(isFind){
        			break;
        		}
        	}

        	return huIndex;
		}
	},

	checkSuoPai:function(arrPai, pai){
		var isSuoPai = arithmetic.isSuoPai(arrPai, pai);
		if(isSuoPai){
			return true;
		}
		var seatData = this.gameSeats[this.turn];
		var YLNum = seatData.YLNum;
		if(YLNum > 0){
			var arrYL = arithmetic.getPai_YL(arrPai);
			for(let i = 0; i < arrYL.length; i++){
				if(arrYL[i][0].type == pai.type && arrYL[i][0].value == pai.value){
					return true;
				}
			}
		}

		if(this.isFirstRound){
			for(let i = 0; i < seatData.liangPai.length; i++){
				let liangPai = seatData.liangPai[i];
				if(liangPai.type == 'jinLong'){
					if(liangPai.pai[0].type == pai.type && liangPai.pai[0].value == pai.value){
						return true;
					}
				}
			}
		}
		return false;
	},

	kaiJinLong:function(userId){
		if(this.isFirstRound){
			var len = this.gameSeats.length;
			for(let i = 0; i < len; i++){
				var seatData = this.gameSeats[i];
				var liangPai  = seatData.liangPai;
				var array = [];
				for(let j = 0; j < liangPai.length; j++){
					if(liangPai[j].type == 'jinLong'){
						array.push(liangPai[j].pai);
						this.recordGameAction(i,ActionType.ACTION_KAIJINLONG,liangPai[j].pai);
					}
				}
				if(array.length < 1){
					continue;
				}
				userMgr.broacastInRoom('jinlong_notify_push',{userId:seatData.userId,pai:array},seatData.userId,true);
			}
			//通知客户端更新分数
			for(let i = 0; i < len; i++){
				var seatData = this.gameSeats[i];
				if(seatData.JLNum > 0){
					for(let j = 0; j < len; j++){
						if(i == j){
							continue;
						}
						this.roomInfo.seats[j].score -= (seatData.JLNum * 4);
						this.roomInfo.seats[i].score += (seatData.JLNum * 4);
					}
				}
			}
	    	this.scoreNotify();
		}
	},

	scoreNotify:function(){
		var userId = this.gameSeats[this.turn].userId;
		var arrScore = [];
		for(let i = 0; i < this.gameSeats.length; i++){
			let rs = this.roomInfo.seats[i];
			arrScore.push({
				userId: rs.userId,
				score: rs.score
			});
		}
		this.recordGameAction(0,ActionType.ACTION_SCORE,{score: arrScore});
		userMgr.broacastInRoom('score_notify_push',{score: arrScore},userId,true);
	},

	moveToNextUser:function(){
	    this.turn ++;
	    this.turn %= this.gameSeats.length;
	},

	doUserMoPai:function(){
		var seatData = this.gameSeats[this.turn];
		var pai = this.mopai(this.turn, false);
		var numOfPai = this._cards.length - this.currentIndex;
		this.chuPai = pai;

		this.recordGameAction(this.turn,ActionType.ACTION_MOPAI,[pai]);

		//通知前端剩余的牌
	    userMgr.broacastInRoom('ssp_count_push',numOfPai,seatData.userId,true);

	    //通知前端新摸的牌
	    userMgr.broacastInRoom('game_mopai_push',{userId:seatData.userId,pai:pai},seatData.userId,true);

	    //检查是否有人要吃 要碰 要杠
	    var hasActions = this.checkOperations(2, pai);
	    if(this.isGameOver){
	    	return;
	    }
	    //如果没有人有操作，则向下一家发牌
	    if(!hasActions){
	    	//摸到的是单张的将公候伯子男
	    	if(pai.value < 2 || pai.value > 7){
	    		var array = [];
	    		array.push(pai);
	    		var data = {
	    			pai: pai,
	    			arr: array
	    		};
				this.canChuPai = true;
				this.chuPai = null;
	    		var type = 'dan';
	    		userMgr.broacastInRoom('game_liangPai_push',{userId:seatData.userId,pai:data,type:type},seatData.userId,true);
	    		seatData.liangPai.push({
	    			pai: array,
	    			type: 'null'
	    		});
	    		this.recordGameAction(this.turn,ActionType.ACTION_DANCHI,[pai]);
	    		this.tuoGuan_chuPai();

	    	}else{
	    		this.chuPai = null;
	    		this.gameSeats[this.turn].folds.push(pai);
	    		this.moveToNextUser();
	    		let curUserId = this.gameSeats[this.turn].userId;
				userMgr.broacastInRoom('fapai_notify_push',{userId:curUserId,pai:pai},curUserId,true);
				this.recordGameAction(this.turn,ActionType.ACTION_GUO,[pai]);
				this.tuoGuan_moPai();
	    	}
	    }else{
	    	userMgr.broacastInRoom('game_wait_push',{userId:seatData.userId},seatData.userId,true);
	    }
	},

	chi:function(userId, pai){
		if(this.isGameOver){
			return;
		}
		var seatIndex = roomMgr.getUserSeat(userId);
	    var seatData = this.gameSeats[seatIndex];

	    if(0 == seatData.actionType){
	    	return;
	    }

	    var index = this.arr_guoIndex.indexOf(seatIndex);
	    if(index > -1){
	    	this.arr_guoIndex.splice(index, 1);
	    }

	    var isWaitingState = this.checkWaitingState(userId);
	    if(isWaitingState){
	    	return;
	    }

	    this.clearActionType();
	    
		var arrChi = arithmetic.getPai_chi(seatData.holds, pai);

		if(1 == arrChi.length){
			var data = {
				pai: pai,
				arr: arrChi[0]
			};
			this.turn = seatIndex;
			this.canChuPai = true;
			this.chuPai = null;
			this.Operations = [];
			var type = 'chi';
			userMgr.broacastInRoom('game_liangPai_push',{userId:seatData.userId,pai:data,type:type},seatData.userId,true);
			seatData.liangPai.push({
				pai: arrChi[0],
				type: 'null'
			});
			this.recordGameAction(seatIndex,ActionType.ACTION_CHI,arrChi[0]);
			this.removePai(userId, arrChi[0], pai);
			this.tuoGuan_chuPai();

		}else if(arrChi.length > 1){
			var data = {
				pai: pai,
				arr: arrChi
			};
			userMgr.sendMsg(seatData.userId,'game_selectChiPai_push',data);
		}
		
	},

	checkWaitingState:function(userId){
		var seatIndex = roomMgr.getUserSeat(userId);
	    var seatData = this.gameSeats[seatIndex];
		
	    if(!seatData.WaitingState){
	    	if(seatIndex != this.turn){
		    	if(this.gameSeats[this.turn].actionType > 0){
		    		seatData.WaitingState = true;
		    		userMgr.sendMsg(seatData.userId,'game_waitChi_push');
		    		return true;
		    	}
		    }
		    for(let i = 0; i < this.gameSeats.length; i++){
		    	if(i != seatIndex && 2 == this.gameSeats[i].actionType){
		    		seatData.WaitingState = true;
		    		userMgr.sendMsg(seatData.userId,'game_waitChi_push');
					return true;
				}
		    }
	    }
	    return false;
	},
               
	peng:function(userId, pai){
		if(this.isGameOver){
			return;
		}
		var seatIndex = roomMgr.getUserSeat(userId);
	    var seatData = this.gameSeats[seatIndex];

	    this.clearActionType();

	    var arrPeng = arithmetic.getPai_peng(seatData.holds, pai);

		var data = {
			pai: pai,
			arr: arrPeng[0]
		};

		this.turn = seatIndex;
		this.canChuPai = true;
		this.chuPai = null;
		this.Operations = [];
		var type = 'peng';
		userMgr.broacastInRoom('game_liangPai_push',{userId:seatData.userId,pai:data,type:type},seatData.userId,true);
		seatData.liangPai.push({
			pai: arrPeng[0],
			type: 'peng'
		});
		this.recordGameAction(seatIndex,ActionType.ACTION_PENG,arrPeng[0]);
		this.removePai(userId, arrPeng[0], pai);
		this.tuoGuan_chuPai();
		
	},

	gang:function(userId, pai){
		if(this.isGameOver){
			return;
		}
		var seatIndex = roomMgr.getUserSeat(userId);
	    var seatData = this.gameSeats[seatIndex];
	    seatData.YLNum--;
	    for(let i = 0; i < this.gameSeats.length; i++){
	    	if(i == seatIndex){
	    		continue;
	    	}
	    	this.roomInfo.seats[i].score -= 2;
			this.roomInfo.seats[seatIndex].score += 2;
	    }
	    this.scoreNotify();
	    this.clearActionType();

	    var arrGang = arithmetic.getPai_gang(seatData.holds, pai);

		var data = {
			pai: pai,
			arr: arrGang[0]
		};
		
		this.turn = seatIndex;
		this.canChuPai = true;
		this.chuPai = null;
		this.Operations = [];
		var type = 'gang';
		userMgr.broacastInRoom('game_liangPai_push',{userId:seatData.userId,pai:data,type:type},seatData.userId,true);
		seatData.liangPai.push({
			pai: arrGang[0],
			type: 'kaiYinLong'
		});
		this.recordGameAction(seatIndex,ActionType.ACTION_GANG,arrGang[0]);
		this.removePai(userId, arrGang[0], pai);
		this.tuoGuan_chuPai();
		
	},

	guo:function(userId, pai){
		if(this.isGameOver){
			return;
		}
		var seatIndex = roomMgr.getUserSeat(userId);
	    var seatData = this.gameSeats[seatIndex];

	    var index = this.arr_guoIndex.indexOf(seatIndex);
	    if(index > -1){
	    	this.arr_guoIndex.splice(index, 1);
	    }
	    if(0 == this.arr_guoIndex.length){
	    	this.closeTimer();
	    }

	    if(pai.value == 1){
			var array = [];
    		array.push(pai);
    		var data = {
    			pai: pai,
    			arr: array
    		};
    		this.canChuPai = true;
    		this.chuPai = null;
    		var type = 'dan';
    		userMgr.broacastInRoom('game_liangPai_push',{userId:seatData.userId,pai:data,type:type},seatData.userId,true);
    		seatData.liangPai.push({
    			pai: array,
    			type: 'null'
    		});
    		this.recordGameAction(seatIndex,ActionType.ACTION_DANCHI,[pai]);
    		this.clearActionType();
    		this.tuoGuan_chuPai();
    		return;
		}

		var numOfGuo = 0;
	    for(let i = 0; i < this.gameSeats.length; i++){
	    	if(this.gameSeats[i].actionType > 0){
				numOfGuo++;
			}
	    }

	    if(numOfGuo < 2){
	    	this.chuPai = null;
	    	this.Operations = [];
	    	this.gameSeats[this.turn].folds.push(pai);
	    	this.clearActionType();
	    	this.moveToNextUser();
	    	let curUserId = this.gameSeats[this.turn].userId;
			userMgr.broacastInRoom('fapai_notify_push',{userId:curUserId,pai:pai},curUserId,true);
			this.recordGameAction(this.turn,ActionType.ACTION_GUO,[pai]);
	        this.tuoGuan_moPai();
		}else{
			var Next = this.turn + 1;
			Next %= this.gameSeats.length;
			
			if(this.gameSeats[this.turn].WaitingState){
				if(seatIndex != this.turn){
					if(2 == this.gameSeats[seatIndex].actionType){
						let userid = this.gameSeats[this.turn].userId;
						this.chi(userid, pai);
						return;
					}
				}
			}else if(this.gameSeats[Next].WaitingState){
				if(seatIndex != Next){
					if(seatIndex != this.turn){
						if(0 == this.gameSeats[this.turn].actionType){
							let userid = this.gameSeats[Next].userId;
							this.chi(userid, pai);
							return;
						}
					}else{
						let chi = true;
						for(let i = 0; i < this.gameSeats.length; i++){
							if(i == this.turn || i == Next){
								continue;
							}
							if(2 == this.gameSeats[i].actionType){
					    		chi = false;
							}
						}
						if(chi){
							let userid = this.gameSeats[Next].userId;
							this.chi(userid, pai);
							return;
						}
					}
				}
			}
			seatData.actionType = 0;
			userMgr.sendMsg(seatData.userId,'guo_notify_push');
		}
	},

	confirmChi:function(userId, data){
		var seatIndex = roomMgr.getUserSeat(userId);
	    var seatData = this.gameSeats[seatIndex];

	    this.turn = seatIndex;
	    this.canChuPai = true;
	    this.chuPai = null;
	    this.Operations = [];
	    var type = 'chi';
		userMgr.broacastInRoom('game_liangPai_push',{userId:seatData.userId,pai:data,type:type},seatData.userId,true);
		seatData.liangPai.push({
			pai: data.arr,
			type: 'null'
		});
		this.recordGameAction(seatIndex,ActionType.ACTION_CHI,data.arr);
		this.removePai(userId, data.arr, data.pai);
		this.tuoGuan_chuPai();
	},

	removePai:function(userId, arrPai, pai){
		var seatIndex = roomMgr.getUserSeat(userId);
	    var seatData = this.gameSeats[seatIndex];

		var array = arrPai.concat();
	    var index = arithmetic.getIndex(array, pai);
	    array.splice(index,1);
	    for(let i = 0; i < array.length; i++){
	    	index = arithmetic.getIndex(seatData.holds, array[i]);
	    	seatData.holds.splice(index,1);
	    }
	},

	clearActionType:function(){
		for(let i = 0; i < this.gameSeats.length; i++){
			this.gameSeats[i].actionType = 0;
			this.gameSeats[i].WaitingState = false;
		}
	},

	draw:function(isOver){
		var results = [];
		for(let i = 0; i < this.gameSeats.length; i++){
			var longPai = arithmetic.getPai_YL(this.gameSeats[i].holds);
    		var holds = {
    			holds: this.gameSeats[i].holds,
	        	longPai: longPai
    		}
			results.push({
				userId: this.gameSeats[i].userId,
	    		name: this.gameSeats[i].name,
	    		singleScore: 0,
	    		totalScore: this.roomInfo.seats[i].score,
	    		score: null,
	    		multiple: 0,
	    		type: 'draw',
	    		successive: 0,
	    		holds: holds,
	    		liangPai: this.gameSeats[i].liangPai,
	    		huPai: null
			});
			this.roomInfo.seats[i].draw++;
		}

		if(isOver){
			var isEnd = true;
		}
		else{
			var isEnd = (this.roomInfo.numOfGames >= this.roomInfo.conf.maxGames);
		}
        var drawId = this.gameSeats[this.turn].userId;
	    this.doGameOver(drawId, isEnd, results);
	},

	hu:function(userId, pai){
		if(!this.isPressHu){
			this.isPressHu = true;
		}
		else{
			return;
		}
		var seatIndex = roomMgr.getUserSeat(userId);
		var seatData = this.gameSeats[seatIndex];

		var results = [];
		var dbresult = [];
		this.computeResult(userId, results, dbresult, pai);

		this.recordGameAction(seatIndex,ActionType.ACTION_HU,[pai]);
		
		//保存游戏
        var self = this;
        var roomId = this.roomInfo.id;
        this.store_game(function(ret){
            gameDB.update_game_result(self.roomInfo.uuid,self.gameIndex,dbresult);
            //记录玩家操作
            var str = JSON.stringify(self.actionList);
            gameDB.update_game_action_records(self.roomInfo.uuid,self.gameIndex,str); 
        
            //保存游戏局数
            roomDB.update_num_of_turns(roomId,self.roomInfo.numOfGames);
        }); 

        var isEnd = (this.roomInfo.numOfGames >= this.roomInfo.conf.maxGames);
	    this.doGameOver(userId, isEnd, results);
	},

	store_game:function(callback){
		var self = this;
		gameDB.create_game(self.roomInfo.uuid,self.gameIndex,self.baseInfoJson,callback);
	},

	store_single_history:function(userId,history){
		userDB.get_user_history(userId,function(data){
			if(data == null){
				data = [];
			}
			while(data.length >= 10){
				data.shift();
			}
			if(userId != 0){
				data.push(history);
				userDB.update_user_history(userId,data);
			}
		});
	},

 	store_history:function(roomInfo){
		var seats = roomInfo.seats;
		var history = {
			uuid:roomInfo.uuid,
			id:roomInfo.id,
			time:roomInfo.createTime,
			seats:new Array(4)
		};

		for(var i = 0; i < seats.length; ++i){
			var rs = seats[i];
			var hs = history.seats[i] = {};
			hs.userid = rs.userId;
			hs.name = crypto.toBase64(rs.name);
			hs.score = rs.score;
		}

		for(var i = 0; i < seats.length; ++i){
			var s = seats[i];
			this.store_single_history(s.userId,history);
		}
	},

	doGameOver:function(userId, isEnd, results){
		this.Operations = [];
		this.closeTimer();

		var seatNum = this.gameSeats.length;
		var self = this;

		var roomId = this.roomInfo.id;
		if(this.forceEnd){
			return;
		}
		if(isEnd){
			this.forceEnd = true;
		}

		var endinfo = null;
		
        if(isEnd){
            endinfo = [];
            for(let i = 0; i < self.roomInfo.seats.length; i++){
            	if(self.roomInfo.seats[i].userId > 0){
            		var rs = self.roomInfo.seats[i];
	                endinfo.push({
	                	userId: rs.userId,
	                	name: rs.name,
	                    win: rs.win,
	                    lose: rs.lose,
	                    draw: rs.draw,
	                    score: rs.score
	                });
            	}
            }
        }
        userMgr.broacastInRoom('game_over_push',{results:results,endinfo:endinfo},userId,true);
        var roomid = roomMgr.getUserRoom(userId);
        roomMgr.clearReady(roomid);
        self.roomInfo.state = GameState.GAME_OVER;
        
        self.roomInfo.nextButton++;
        self.roomInfo.nextButton %= seatNum;
        //如果局数已够，则进行整体结算，并关闭房间
        if(isEnd){
            setTimeout(function(){
            	if(self.roomInfo.numOfGames >= 1){
                    self.store_history(self.roomInfo);
                }
            	for(var i = 0; i < self.roomInfo.seats.length; ++i){
					var rs = self.roomInfo.seats[i];
					if(rs.userId <= 0){
						continue;
					}
					if(self.roomInfo.conf.koufeixuanze){	//0是房主付费, 1是AA付费
						userDB.cost_gems(rs.userId, 1);
					}
					else{
						userDB.cost_gems(self.roomInfo.seats[0].userId, 1);
					}
				}
                userMgr.kickAllInRoom(roomId);
                roomMgr.destroy(roomId);
                archiveDB.archive_games(self.roomInfo.uuid);
            },1500);
        }
	},

	computeResult:function(userId, result, dbresult, pai){
		var seatIndex = roomMgr.getUserSeat(userId);
		var seatData = this.gameSeats[seatIndex];

		var score = arithmetic.computeScore(this.paiOfcalculate);

		var arrScore = [];
		var ScoreOfHu = 0;
		var Multiple = arithmetic.computeMultiple(seatData.liangPai);
		for(let i = 0; i < this.gameSeats.length; i++){
			if(i == seatIndex){
				continue;
			}
			let multiple = arithmetic.computeMultiple(this.gameSeats[i].liangPai);
			multiple = Multiple - (multiple - 1);
			if(multiple < 0){
				multiple = 0;
			}

			let totalScore = score.diFan + score.fan + score.yinLongFan + score.jinLongFan;
			let calculative = multiple * totalScore;
			this.roomInfo.seats[i].score -= calculative;
			this.roomInfo.seats[seatIndex].score += calculative;
			ScoreOfHu += calculative;
			arrScore.push({
				index: i,
				score: (0 - calculative)
			});
		}
		arrScore.push({
			index: seatIndex,
			score: ScoreOfHu
		});

		for(let i = 0; i < this.gameSeats.length; i++){
	    	if(i == seatIndex){
	    		if(this.isTianHu){
	    			var huPaiType = 'tianHu';
	    		}
	    		else if(this.isFirstRound){
	    			var huPaiType = 'diHu';
	    		}
	    		else if(Multiple > 1){
	    			var huPaiType = 'daHu';
	    		}
	    		else{
	    			var huPaiType = 'pingHu';
	    		}
	    	}
	    	else{
	    		var huPaiType = null;
	    	}

	    	var longPai = arithmetic.getPai_YL(this.gameSeats[i].holds);
    		var holds = {
    			holds: this.gameSeats[i].holds,
	        	longPai: longPai
    		}

			var numOfWin = 1; //连胜场数
	    	for(let j = 0; j < arrScore.length; j++){
	    		if(arrScore[j].index == i){
	    			var singleScore = arrScore[j].score;
	    			let rs = this.roomInfo;
	    			if(0 == singleScore){
	    				rs.seats[i].draw++;
	    			}
	    			else if(singleScore > 0){
	    				rs.seats[i].win++;
	    				rs.successive.push(i);
	    				if(rs.successive.length > 1){
	    					for(let t = 1; t < rs.successive.length; t++){
	    						if(rs.successive[0] == rs.successive[t]){
	    							numOfWin++;
	    						}else{
	    							numOfWin = 1;
	    							let len = rs.successive.length - 1;
	    							rs.successive.splice(0,len);
	    							break;
	    						}
	    					}
	    				}
	    			}
	    			else if(singleScore < 0){
	    				rs.seats[i].lose++;
	    			}
	    			break;
	    		}
	    	}

	    	result.push({
	    		userId: this.gameSeats[i].userId,
	    		name: this.gameSeats[i].name,
	    		singleScore: singleScore,
	    		totalScore: this.roomInfo.seats[i].score,
	    		score: score,
	    		multiple: Multiple,
	    		type: huPaiType,
	    		successive: numOfWin,
	    		holds: holds,
	    		liangPai: this.gameSeats[i].liangPai,
	    		huPai: pai
	    	});
	    	dbresult.push(singleScore);
	    }
	},

	closeTuoGuan:function(userId){
		var seatIndex = roomMgr.getUserSeat(userId);
		var seatData = this.gameSeats[seatIndex];
		seatData.isTuoGuan = false;
	},

	//发送解散房间剩余时间
	sendTime:function(){
		if(this.dispressRoomTimeId){
			return;
		}
		var disTime = 200000;
		var self = this;
		var roomId = this.roomInfo.id;
		this.dispressRoomTimeId = setInterval(function(self){
			var userId = self.roomInfo.seats[0].userId;
			if(disTime > 0){
				disTime -= 1000;
				userMgr.broacastInRoom('out_dissolutionTime',disTime,userId,true);
			}
			else{
				self.stopTime();
				userMgr.kickAllInRoom(roomId);
	            roomMgr.destroy(roomId);
			}
		},1000,this);
	},

	stopTime:function(){
		if(this.dispressRoomTimeId){
			clearInterval(this.dispressRoomTimeId);
		}
		this.dispressRoomTimeId = null;
	},

	getHolds:function(userId){
		var len = this.gameSeats.length;
		for(var i = 0; i < len; i++){
			if(this.gameSeats[i].userId === userId){
				return this.gameSeats[i].holds;
			}
		}
		return null;
	},

	getGameState:function() {
		if (this.roomInfo.state !== GameState.GAME_START) {
			return false;
		}
		else {
			return true;
		}
	}
});

module.exports = Game;