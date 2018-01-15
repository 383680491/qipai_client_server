var include = require('../../include');
var GAME_TYPE = include.getModel('DEFINE').GAME_TYPE;
var BaseClass = include.getModel('BaseClass');
var Player = include.getModel('Player');
var userMgr = include.getModel('userMgr');
var roomMgr = include.getModel('roomMgr');
var PaiType = include.getModel('DEFINE').PaiType;
var GameState = include.getModel('DEFINE').GameState;
var Compare = require('./compare');
var userDB = require('../../../DB/managers/userDBMgr');
var crypto = require("../../../utils/crypto");
this.mapaiData = null;
this.chupaidata = null;

var Game = BaseClass.extend({
	Init:function(roomInfo){
		this.JS_Name = "Game";
		this.roomInfo = roomInfo;
		this.conf = roomInfo.conf;
		this.compareCount = 0;
		this.arrTSPInfo = [];
		this._cards = [];
		this.forceEnd = false;

		this.initParam();
		//初始化房间信息
		this.initPlayer();
		//初始化牌
		//this.initCard();
		//洗牌
		this.shuffle();
		//this.kaiBaiBian();
		this.fapai();
	},
	startAgain:function(){
		if(this.roomInfo.conf.numOfGames < this.roomInfo.conf.maxGames){
			return;
		}
		this.initParam();
		this.initPlayer();
		this.shuffle();
		this.fapai();
		var seats = this.roomInfo.seats;
		for(let i = 0; i < seats.length; ++i){
			//开局时，通知前端必要的数据
			let s = seats[i];
			//通知当前是第几局
			userMgr.sendMsg(s.userId,'game_num_push',this.roomInfo.numOfGames);
			//通知游戏开始
			userMgr.sendMsg(s.userId,'game_begin_push');
		}
	},
	initInfo:function(){
		this.initPlayer();

	},
	initParam:function(roomInfo){
		this.state = GameState.GAME_PREPARE;
		//设置游戏状态为准备
		this.roomInfo.state = GameState.GAME_PREPARE;
		if(this.arrComparePai){
			this.arrComparePai.length = 0
		}
		if(this.result){
			delete this.result;
		}
		if(this.arrTSPInfo){
			this.arrTSPInfo.length = 0;
		}
		this.arrComparePai = [];
		this.arrTSPInfo = [];
		this.arrComparePlayer = [];
		if(!this.allResult)
		{
			this.allResult = [];
		}
		this.compareCount = 0;
	},

	////洗牌
	shuffle:function(){
		if(!this._cards){
			this._cards = [];
		}
		this._cards.length = 0;
		var arrType = [];
		var countPlayer = 0;
		arrType = [0,1,2,3];

		for(let i = 0;i < this.roomInfo.seats.length;i++){
			if(this.roomInfo.seats[i].userId > 0){
				countPlayer++;
			}
		}
		if(countPlayer >= 5){
			var type = 2;
			type = 2;
			arrType.push(type);
		}
		if(countPlayer >= 6){
			var type = 3;
			type = 3;
			arrType.push(type);
		}

		//0草花,1黑桃,2红心,3方块
		for(let i = 0;i < arrType.length;i++){
			for(var j = 2; j < 15; j++){
				var card = {
					type:arrType[i],
					value:j
				}
				this._cards.push(card);
			}
		}

		var length = this._cards.length;
		for (var i = 0; i < length; i++) {
			var lastIndex = this._cards.length - 1 - i;
	        var index = Math.floor(Math.random() * lastIndex);
	        var t = this._cards[index];
	        this._cards[index] = this._cards[lastIndex];
	        this._cards[lastIndex] = t;
		}
	},
	initPlayer:function(){
		this.arrPlayers||(this.arrPlayers = []);
		var bCreate = (this.arrPlayers.length === 0);
		//创建玩家
		var len = this.roomInfo.seats.length;
		for (var i = 0; i < len; i++) {
			var player = (this.arrPlayers[i] || new Player());
			player.initInfo(this.roomInfo.seats[i]);
			this.arrPlayers[i] = player;
			this.arrPlayers[i].JS_Name = this.roomInfo.seats[i].name;
			this.arrPlayers[i].score = 0;
		}
	},
	//断线重连数据下发
	playerComeBack:function(userId){
        var data = {
            state:this.state,
			maxGames:this.roomInfo.conf.maxGames,
			numOfGames:this.roomInfo.numOfGames,
			wanfa:this.roomInfo.conf.wanfa,
        };
		data.seats = [];
		for(var i = 0; i < this.roomInfo.seats.length; ++i){
			var rs = this.roomInfo.seats[i];
			var online = false;
			if(rs.userId > 0){
				online = userMgr.isOnline(rs.userId);
			}
			var s = {
				userId:rs.userId,
				ip:rs.ip,
				score:rs.score,
				name:rs.name,
				online:online,
				seatindex:i
			}
			
			data.seats.push(s);
		}
		if(this.state === GameState.GAME_PREPARE){
			
		}
		if(this.state === GameState.GAME_COMPARE){
			if(this.chupaidata){
				data.chupaidata = this.chupaidata;
			}
		}
		//
		if(this.state === GameState.GAME_START){
			data.holds = this.getHolds(userId);
		}
		//下发比牌数据和比牌结果
		if(this.state === GameState.GAME_OVER){
			data.comparePai = this.arrComparePai;
			data.result = this.result;
			if(this.roomInfo.conf.maxGames <= this.roomInfo.numOfGames){
				data.singleResult = this.singleResult;
				data.totalResult = this.totalResult;
			}
			else{
				data.singleResult = this.singleResult;
			}
		}
		//马牌
		if(this.roomInfo.conf.wanfa === GAME_TYPE.GAME_MP){
			data.mapaiData = this.mapaiData;
		}

        //同步整个信息给客户端
        userMgr.sendMsg(userId,'game_sync_push',data);
	},
	getPlayers:function(userId){
		var len = this.arrPlayers.length;
		for(let i = 0; i < len; ++i){
			if(this.arrPlayers[i].userId === userId){
				return this.arrPlayers[i];
			}
		}
		return null;
	},
	fapai:function(){
		//发牌之前开马牌
		if(this.roomInfo.conf.wanfa === GAME_TYPE.GAME_MP){
			this.kaiMaPai();
		}
		
		var cardLen = this._cards.length;
		var playerLen = cardLen/13;
		for(let i = 0;i < playerLen;i++){
			this.arrPlayers[i]._holds = [];
		}
		for (var i = 0; i < cardLen;) {
			for (var j = 0; j < playerLen; j++) {
				for (var z = 0; z < 13;z++) {
					this.arrPlayers[j]._holds.push(this._cards[i]);
					++i;
				}
			}
		}
		//对玩家的牌进行快速排序
		for(var i = 0; i <  playerLen; i++){
			this.arrPlayers[i]._holds.sort(function(a, b){
				return (b.value - a.value);
			})
		}

		for (var i = 0; i < playerLen; i++) {
			var player = this.arrPlayers[i];
			if(player.userId === 0){
				continue;
			}
			player.type = Compare.getType(player._holds);
			if(this.roomInfo.conf.wanfa === GAME_TYPE.GAME_BWZ){
				if(player.type === PaiType.TZP || player.type === PaiType.THSBD || player.type === PaiType.WTZ){
					player.type = PaiType.WL;
				}
			}
			var data = {
				type:player.type,
				holds:player._holds
			};
			userMgr.sendMsg(player.userId,'game_holds_push', data);
			userMgr.sendMsg(player.userId,'game_start');
		}

		for(let i = 0;i<this.arrPlayers.length;i++){
			if(this.arrPlayers[i].userId != 0){
				this.arrPlayers[i].isChuPai = false;
			}
		}
		
		//在发牌的时候就确定比牌玩家数量
		var playerCount = 0;
		for(let i = 0;i < this.arrPlayers.length;i++){
			if(this.arrPlayers[i].userId > 0){
				playerCount++;
			}
		}
		this.compareCount = playerCount;
		//设置游戏状态为开始
		this.roomInfo.state = GameState.GAME_START;
		this.state = GameState.GAME_START;
		//倒计时出牌
		this.lastTime = 103000;//99秒理牌时间
		this.timeoutId = setTimeout(this.outMaxPai,this.lastTime,this);
		//每秒发送当前剩余时间
		this.timeId = setInterval(function(self){
			self.lastTime -= 1000;
			for(let i = 0;i<self.arrPlayers.length;i++){
				if(self.arrPlayers[i].userId != 0){
					let userId = self.arrPlayers[i].userId;
					userMgr.sendMsg(userId,'out_card_lastTime',self.lastTime);
				}
			}
		},1000,this);

	},

	kaiMaPai:function(){
		this.mapaiData = {};
		this.mapaiData.value = Math.floor(Math.random()*13+2);

		var playerLen = 0;
		for (var i = 0; i < this.arrPlayers.length; i++) {
			if(this.arrPlayers[i].userId > 0){
				playerLen++;
			}
		}
		if(playerLen === 4){  //4个人玩
			var n = Math.floor(Math.random()*52);//取第n张牌为马牌
			this.mapaiData.value = this._cards[n].value;
			this.mapaiData.type = this._cards[n].type;
		}
		else if(playerLen > 4){  //大于4副牌
			this.mapaiData.type = Math.floor(Math.random()*2);
		}
		else{
			this.mapaiData.type = Math.floor(Math.random()*4);
		}

		var playerLen = this.arrPlayers.length;
		for (var i = 0; i < playerLen; i++) {
			var player = this.arrPlayers[i];
			userMgr.sendMsg(player.userId,'game_mapai_push', this.mapaiData);
		}
	},

	//特殊牌处理
	setSpecialCard:function(userId){
		var playerLen = this.arrPlayers.length;
		for (var i = 0; i < playerLen; i++) {
			var player = this.arrPlayers[i];
			if(player.userId === userId){
				player.isSpecial = true;
				this.arrTSPInfo.push(player);
				break;
			}
		}
		var chuPaiData = [];
		for(let i = 0;i<this.arrPlayers.length;i++){
			if(this.arrPlayers[i].userId === userId){
				this.arrPlayers[i].isChuPai = true;
			}
			if(this.arrPlayers[i].userId > 0){
				var tempChuPai = {};
				tempChuPai.userId = this.arrPlayers[i].userId;
				tempChuPai.isChuPai = this.arrPlayers[i].isChuPai;
				chuPaiData.push(tempChuPai);
			}
		}
		for(let i = 0;i<chuPaiData.length;i++){
			userMgr.sendMsg(chuPaiData[i].userId,'player_outCard', chuPaiData);
		}
		
		var comparePaiLen = this.arrComparePai.length;
		var TSPUserCount = this.arrTSPInfo.length;
		if (comparePaiLen + TSPUserCount >= this.compareCount) {
			this.compare();
		}
	},
	//获取特殊牌
	getTSPUserCount:function(){
		var count = 0;
		var playerLen = this.arrPlayers.length;
		for (var i = 0; i < playerLen; i++) {
			var player = this.arrPlayers[i];
			if((player.userId !==0) && player.isSpecial){
				count++;
			}
		}
		return count;
	},

	getComData:function(userId){
		let len = this.arrComparePai.length;
		for(let i = 0; i < len; ++i){
			var data = this.arrComparePai[i];
			if(data.userId === userId){
				return data;
			}
		}
		for(let i = 0;i<this.arrTSPInfo.length;i++){
			if(this.arrTSPInfo[i].userId === userId){
				var data = this.arrTSPInfo[i];
				data.data = this.arrTSPInfo[i]._holds;
				return data;
			}
		}
		return null;
	},
	//快速摆牌
	quickSwing:function(userId,bOutMax){
		var holds = [];
		var data = [];
		//普通玩法的快速摆牌
		for(let i = 0;i<this.arrPlayers.length;i++){
			if(userId === this.arrPlayers[i].userId){
				holds = this.arrPlayers[i]._holds;
				data = Compare.quickSwing(holds);
				break;
			}
		}

		if(bOutMax){
			var comData = {};
			comData.data = data;
			comData.userId = userId;
			this.setCompareData(comData);
		}
		else{
			userMgr.sendMsg(userId, 'quick_swing_push', data);
		}
	},

	outMaxPai:function(self){
		for(let i = 0;i<self.compareCount;i++){
			if(!self.arrPlayers[i].isChuPai){
				var userId = self.arrPlayers[i].userId;
				self.quickSwing(userId,true);
				userMgr.sendMsg(userId, 'out_maxPai_push');
			}
		}

	},

	setCompareData:function(data){
		//设置游戏状态为compare比较牌
		this.roomInfo.state = GameState.GAME_COMPARE;
		this.state = GameState.GAME_COMPARE;
		//如果已经比过牌则return
		for(let i = 0;i<this.arrComparePlayer.length;i++){
			if(data.userId === this.arrComparePlayer[i]){
				return;
			}
		}
		this.arrComparePlayer.push(data.userId);

		var chuPaiData = [];
		for(let i = 0;i<this.arrPlayers.length;i++){
			if(this.arrPlayers[i].userId === data.userId){
				this.arrPlayers[i].isChuPai = true;
			}
			if(this.arrPlayers[i].userId > 0){
				var tempChuPai = {};
				tempChuPai.userId = this.arrPlayers[i].userId;
				tempChuPai.isChuPai = this.arrPlayers[i].isChuPai;
				chuPaiData.push(tempChuPai);
			}
		}
		this.chupaidata = chuPaiData;
		for(let i = 0;i<chuPaiData.length;i++){
			userMgr.sendMsg(chuPaiData[i].userId,'player_outCard', chuPaiData);
		}
		//排序牌
		for(var i = 0; i < 3; i++){
			var arrDun = data.data[i];
			arrDun.sort(function(a,b){return (b.value-a.value);})
		}

		this.arrComparePai.push(data);
		this.compare();
	},

	compare:function(){
		var comparePaiLen = this.arrComparePai.length;
		//获取参与比较玩家数量(拥有特殊牌，且用户确认使用该特殊牌不参与比较)
		var TSPUserCount = this.arrTSPInfo.length;
		if (comparePaiLen + TSPUserCount !== this.compareCount) {
			return;
		}
		//向客户端发送手牌
		var size = this.arrComparePai.length;
		
		this.singleResult = [];
		
		this.dealResult();

		//把自动出牌的定时器关掉
		clearInterval(this.timeId);
		clearTimeout(this.timeoutId);

		for(let i = 0; i < this.singleResult.length; i++){
			//输赢局数
			if(this.singleResult[i].score > 0)
			{
				this.singleResult[i].win = 1;
				this.singleResult[i].flat = 0;
				this.singleResult[i].lose = 0;
			}
			else if(this.singleResult[i].score === 0)
			{
				this.singleResult[i].win = 0;
				this.singleResult[i].flat = 1;
				this.singleResult[i].lose = 0;
			}
			else if(this.singleResult[i].score < 0)
			{
				this.singleResult[i].win = 0;
				this.singleResult[i].flat = 0;
				this.singleResult[i].lose = 1;
			}

			//添加每个人的分数
			for(let j = 0;j<this.roomInfo.seats.length;j++){
				if(this.roomInfo.seats[j].userId === this.singleResult[i].userId){
					this.roomInfo.seats[j].score += this.singleResult[i].score;
				}
			}
		}

		//处理每个玩家的准备状态
		for(let i = 0;i < this.roomInfo.seats.length;i++){
			let userId = this.roomInfo.seats[i].userId;
			roomMgr.setReady(userId,false);
		}

		//输赢局数，总分
		this.allResult.push(
			this.singleResult
		);

		if(this.roomInfo.conf.maxGames - this.roomInfo.numOfGames > 0){
			this.roomInfo.numOfGames++;
			this.singleOver(this.singleResult);
		}
		else
		{
			this.singleOver(this.singleResult);
			this.doGameOver();
		}
		//设置游戏状态为结束
		this.roomInfo.state = GameState.GAME_OVER;
		this.state = GameState.GAME_OVER;
	},
	//根据玩法处理算法
	dealResult:function(){},
	//墩比较
	dunCompare:function(Res,dunIndex){},
	//处理打枪信息
	dealShootInfo:function(res){},
	//处理特殊牌信息
	dealTSPInfo:function(res,TSPInfo,TSPData){},

	//计算总结果
	calculateResult:function(){
		this.totalResult = [];//总结果
		var len = this.allResult.length;
		var allResult = this.allResult[0];
		if(allResult){	//如果有第一局数据，则计算总结果
			
			for(var i = 0; i < this.roomInfo.seats.length; i++){
				var temp = {};
				let userId = this.roomInfo.seats[i].userId;
				if(userId <= 0){
					continue;
				}
				temp.userId = userId;
				temp.userName = this.roomInfo.seats[i].name;
				temp.score = 0;
				temp.win = 0;
				temp.flat = 0;
				temp.lose = 0;
				this.totalResult.push(temp);
			}
			for(var i = 0; i < this.allResult.length; i++){
				for(let j = 0;j<this.allResult[i].length;j++){
					for(let m = 0;m<this.totalResult.length;m++){
						if(this.totalResult[m].userId === this.allResult[i][j].userId){
							this.totalResult[m].score += this.allResult[i][j].score;
							this.totalResult[m].win += this.allResult[i][j].win;
							this.totalResult[m].flat += this.allResult[i][j].flat;
							this.totalResult[m].lose += this.allResult[i][j].lose;
						}
					}
				}
			}
		}

		for (var i = 0; i < this.arrPlayers.length; i++) {
			let userId = this.arrPlayers[i].userId;
			userMgr.sendMsg(userId,'game_result',this.totalResult);
		}
		//如果局数已够，则进行整体结算,记录战绩
		if(allResult){
			if (this.forceEnd) {
				return;
			}
			this.forceEnd = true;
            if(this.roomInfo.numOfGames > 1){
                this.store_history(this.roomInfo);    
            } 
        }
		this.allResult = [];
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
			seats:new Array(6)
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

	singleOver:function(result){
		//添加每个人的分数
		for(let i = 0;i<result.length;i++){
			for(let j = 0;j<this.roomInfo.seats.length;j++){
				if(result[i].userId === this.roomInfo.seats[j].userId){
					result[i].allScore = this.roomInfo.seats[j].score;
				}
			}
		}
		//通知客户端单局游戏结束
		for (var i = 0; i < this.arrPlayers.length; i++) {
			let userId = this.arrPlayers[i].userId;
			userMgr.sendMsg(userId,'game_over_push',result);
		}
	},

	//退出房间
	exitRoom:function(userId){
		var havePlayer = false;
		var roomId = roomMgr.getUserRoom(userId);
		if(roomId === null){
			return;
		}
		for(let i = 0;i<this.arrPlayers.length;i++){
			if(this.arrPlayers[i].userId === userId){
				this.arrPlayers[i].userId = 0;
			}
			if(this.arrPlayers[i].userId > 0){
				havePlayer = true;
			}
		}
		userMgr.sendMsg(userId,'dispress_push');
		userMgr.kickUserInRoom(userId);
	},

	allExitRoom:function(roomId){
		userMgr.kickAllInRoom(roomId);
        roomMgr.destroy(roomId);
	},

	//扣除钻石
	doGameOver:function(){
		//把自动出牌的定时器关掉
		clearInterval(this.timeId);
		clearTimeout(this.timeoutId);

		this.calculateResult();
		var roomId = roomMgr.getUserRoom(this.arrPlayers[0].userId);
		var roomInfo = roomMgr.getRoom(roomId);
		var self = this;
		if(roomId == null){
			return;
		}
		if(roomInfo == null){
			return;
		}

		setTimeout(function(){
			//通知客户端房间解散
			for (var i = 0; i < self.roomInfo.seats.length; i++) {
				let userId = self.roomInfo.seats[i].userId;
				let koufeiId = 0;
				if(userId === 0){
					continue;
				}
				if(roomInfo.conf.koufeixuanze === 0){ //房主自费
					koufeiId = self.roomInfo.seats[0].userId;
				}
				else{
					koufeiId = userId;
				}
				//扣除房卡，每人一钻
				let cost = 1;
				userDB.cost_gems(koufeiId,cost);
			}
			for (var i = 0; i < self.roomInfo.seats.length; i++) {
				var userId = self.roomInfo.seats[i].userId;
				self.exitRoom(userId);
			}
			roomMgr.destroy(roomId);
        },0);
	},

	getHolds:function(userId){
		var len = this.arrPlayers.length;
		for(var i = 0; i < len; i++){
			if(this.arrPlayers[i].userId === userId){
				return this.arrPlayers[i]._holds;
			}
		}
		return null;
	}
});

module.exports = Game;