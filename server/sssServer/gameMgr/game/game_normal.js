var include = require('../../include');

var BaseClass = include.getModel('BaseClass');
var Player = include.getModel('Player');
var userMgr = include.getModel('userMgr');
var roomMgr = include.getModel('roomMgr');
var PaiType = include.getModel('DEFINE').PaiType;
var GameState = include.getModel('DEFINE').GameState;
var GAME_TYPE = include.getModel('DEFINE').GAME_TYPE;
var Game = include.getModel('Game');

var Compare = require('./compare');

var Game_Normal = Game.extend({
    Init:function(roomInfo){
		this.JS_Name = "Game_Normal";
		this.roomInfo = roomInfo;
		this.conf = roomInfo.conf;

		this.initParam();
		//初始化房间信息
		this.initPlayer();
		//初始化牌
		//this.initCard();
		//洗牌
		this.shuffle();
		//开百变
		//this.kaiBaiBian();
		//发牌
		this.fapai();
	},
	dealResult:function(){
		//this._super.dealResult();
		this.compareResult = {
			tdRes:[],
			zdRes:[],
			wdRes:[]
		};
		this.userInfo = [];
		this.result = {};
		this.result.shootResult = {};
		this.result.TSPResult = [];
		//前中后墩牌进行比较
		this.dunCompare(this.compareResult.tdRes, 0);
		this.dunCompare(this.compareResult.zdRes, 1);
		this.dunCompare(this.compareResult.wdRes, 2);

		for(let i = 0; i < this.arrComparePai.length; i++){
			let temp = {};
			temp.userId = this.arrComparePai[i].userId;
			for(let j = 0;j<this.arrPlayers.length;j++){
				if(this.arrPlayers[j].userId === temp.userId){
					temp.userName = this.arrPlayers[j].JS_Name;
				}
			}
			temp.score = this.compareResult.tdRes[i].score + this.compareResult.zdRes[i].score + this.compareResult.wdRes[i].score;
			temp.win = 0;
			temp.flat = 0;
			temp.lose = 0;
			temp.arrPai = this.arrComparePai[i].data;
			this.userInfo.push(temp);
		}

		//处理并下发打枪信息
		this.dealShootInfo(this.userInfo,this.result.shootResult);

		//处理特殊牌并下发信息
		this.dealTSPInfo(this.userInfo,this.arrTSPInfo,this.result.TSPResult);

		this.singleResult = this.userInfo;
		this.result.compareResult = this.compareResult;
		this.result.userInfo = this.userInfo;
		
		for (var i = 0; i < this.arrPlayers.length; i++) {
			let userId = this.arrPlayers[i].userId;
			userMgr.sendMsg(userId,'compare_result_push', this.result);
		}
	},

	//墩比较
	dunCompare:function(Res,dunIndex){
		var size = this.arrComparePai.length;
		for(let i = 0;i < size;i++){
			var temp = {};
			temp.userId = this.arrComparePai[i].userId;
			temp.arrPai = this.arrComparePai[i].data[dunIndex];
			temp.score = 0;
			
			for(let j = 0;j<size;j++){
				var arrPai = this.arrComparePai[j].data[dunIndex];
				if(i !== j){
					var ret = Compare.comparPai(temp.arrPai, arrPai);
					var ismapai = this.mapaiJudge(this.arrComparePai[i].data,this.arrComparePai[j].data);
					if(ret > 0){
						temp.score += this.scoreInfo(temp.arrPai,dunIndex,ismapai);
					}
					else if(ret < 0){
						temp.score -= this.scoreInfo(arrPai,dunIndex,ismapai);
					}
					
				}
			}
			Res.push(temp);
		}
	},

	//是否有马牌
	mapaiJudge:function(paiData0,paiData1){
		//是否有马牌
		var b_mapai = false;
		if(this.roomInfo.conf.wanfa === GAME_TYPE.GAME_MP){
			for(let x = 0;x < paiData0.length;x++){
				for(let m = 0;m < paiData0[x].length;m++){
					if(paiData0[x][m].type === this.mapaiData.type &&
					paiData0[x][m].value === this.mapaiData.value){
						b_mapai = true;
					}
				}
			}
			if(!b_mapai){
				for(let y = 0;y < paiData1.length;y++){
					for(let k = 0;k < paiData1[y].length;k++){
						if(paiData1[y][k].type === this.mapaiData.type &&
						paiData1[y][k].value === this.mapaiData.value){
							b_mapai = true;
						}
					}
				}
			}
		}
		return b_mapai;
	},

	//特殊牌是否有马牌
	TSPmapaiJudge:function(paiData0){
		//是否有马牌
		var b_mapai = false;
		if(this.roomInfo.conf.wanfa === GAME_TYPE.GAME_MP){
			for(var x = 0;x < paiData0.length;x++){
				if(paiData0[x].type === this.mapaiData.type &&
				paiData0[x].value === this.mapaiData.value){
					b_mapai = true;
				}
			}
		}
		return b_mapai;
	},

	//牌组，墩索引，是否是最大
	scoreInfo:function(arrPai,dunIndex,ismapai){
		var score = 0;
		switch(dunIndex){
			case 0://头道
				score = this.TDScoreInfo(arrPai);
				break;
			case 1://中道
				score = this.ZDScoreInfo(arrPai);
				break;
			case 2://尾道
				score = this.WDScoreInfo(arrPai);
				break;
			default:
				break;
		}
		if(ismapai){
			score = score*2;
		}
		return score;
	},
	//头墩分数处理,把最大和最小牌型的玩家传进来
	TDScoreInfo:function(arrPai){
		//冲三特殊处理，加三分
		var type = Compare.getType(arrPai);
		if(type === PaiType.ST){
			return 3;
		}
		else{
			return 1;
		}
	},

	//头墩分数处理,把最大和最小的牌型传进来，
	ZDScoreInfo:function(arrPai){
		//中墩葫芦加两分，中墩铁支加8分，同花顺加10分，五同16分，
		var type = Compare.getType(arrPai);
		if(type === PaiType.HL){
			return 2;
		}
		else if(type === PaiType.TZ){
			return 8;
		}
		else if(type === PaiType.THS){
			return 10;
		}
		else if(type === PaiType.WT){
			return 16;
		}
		else{
			return 1;
		}
	},

	//头墩分数处理,把最大和最小的牌型传进来，
	WDScoreInfo:function(arrPai){
		//尾道铁支加4分，同花顺加5分,五同8分
		var type = Compare.getType(arrPai);
		if(type === PaiType.TZ){
			return 4;
		}
		else if(type === PaiType.THS){
			return 5;
		}
		else if(type === PaiType.WT){
			return 8;
		}
		else{
			return 1;
		}
	},

	//处理打枪信息
	dealShootInfo:function(res,shoot){
		shootInfo = {};
		var size = this.arrComparePai.length;
		var swatUserId = 0;
		var mapaiShootScore = 0;
		var ismapai = false;
		for(var i = 0; i < size; ++i){
			//是否是全垒打
			var tspCount = this.getTSPUserCount();
			var isSwat = true;
			if(tspCount > 0 || size < 3){
				isSwat = false;
			}	
			for(var j = 0; j < size; ++j){
				if(i === j){
					continue;
				}
				var shootScore = 0;
				
				var userId1 = this.arrComparePai[i].userId;
				var userId2 = this.arrComparePai[j].userId;
				//分别比较每一墩
				var isShoot = true; 
				for(var m = 0; m < 3; m++){
					var arrPai1 = this.arrComparePai[i].data[m];
					var arrPai2 = this.arrComparePai[j].data[m];
					var comRet = Compare.comparPai(arrPai1, arrPai2);
					ismapai = this.mapaiJudge(this.arrComparePai[i].data,this.arrComparePai[j].data);
					shootScore += this.scoreInfo(arrPai1,m,ismapai);
					
					if(comRet < 1){
						isShoot = false;
						break;
					}
				}
				
				if(isShoot){
					if(ismapai){
						var len = res.length - 1;
						mapaiShootScore = shootScore/len;
					}
					shootInfo[userId1] = shootInfo[userId1]||[];
					shootInfo[userId1].push(userId2);
					//处理打枪算分问题
					for(var n = 0;n < res.length;n++){
						if(res[n].userId === userId1){
							res[n].score += shootScore;
						}
						else if(res[n].userId === userId2){
							res[n].score -= shootScore;
						}
					}
				}
				else{
					isSwat = false;
				}
			}
			if(isSwat){
				swatUserId = this.arrComparePai[i].userId;
				var swaMapai = this.mapaiJudge(this.arrComparePai[i].data,this.arrComparePai[i].data);
				if(mapaiShootScore != 0 && !swaMapai){
					var len = res.length;
					shootScore = mapaiShootScore*len;
				}
				else{
					shootScore = shootScore*2;
				}	
				//全垒打算分
				for(let m = 0;m < shootInfo[swatUserId].length;m++){
					for(var n = 0;n < res.length;n++){
						if(res[n].userId === shootInfo[swatUserId][m]){
							if(mapaiShootScore != 0 && !swaMapai){ //有马牌
								var ismapai = this.mapaiJudge(this.arrComparePai[n].data,this.arrComparePai[n].data);
								var len = res.length - 1;
								var score = (shootScore * len)/res.length;//基础分
								if(ismapai){ //有马牌的玩家
									res[n].score -= score*2;
								}
								else{
									res[n].score -= score;
								}
							}
							else{
								res[n].score -= shootScore;
							}
						}
					}
				}
				for(var n = 0;n < res.length;n++){
					var len = res.length - 1;
					if(res[n].userId === swatUserId){
						res[n].score += shootScore * len;
					}
				}
			}
		}

		shoot.shootScore = [];
		for(let i = 0;i<res.length;i++){
			var temp = {};
			temp.userId = res[i].userId;
			temp.score = res[i].score;
			shoot.shootScore.push(temp);
		}
		shoot.shootInfo = shootInfo;
		shoot.swatUserId = swatUserId;
	},

	dealTSPInfo:function(res,TSPInfo,TSPResult){
		var MaxType = 0;
		var maxScore = 0;
		var MaxIndex = 0;
		var arrMaxIndex = [];
		var arrMinIndex = [];
		var arrTemp = [];
		for(let i = 0;i<TSPInfo.length;i++){
			maxScore = (this.dealTSPScore(TSPInfo[i].type) > maxScore) ? (this.dealTSPScore(TSPInfo[i].type)):(maxScore);
		}
		for(let i = 0;i<TSPInfo.length;i++){
			if(this.dealTSPScore(TSPInfo[i].type) === maxScore){
				MaxIndex = i;
				break;
			}
		}
		for(let i = 0;i<TSPInfo.length;i++){
			//player.type = Compare.getType(player._holds);
			var TSPType = TSPInfo[i].type;
			var score = this.dealTSPScore(TSPType);
			var temp = {};
			temp.userId = TSPInfo[i].userId;
			temp.userName = TSPInfo[i].JS_Name;
			temp.arrPai = TSPInfo[i]._holds;
			temp.score = 0;
			temp.win = 0;
			temp.flat = 0;
			temp.lose = 0;
			for(let j = 0;j<res.length;j++){
				var ismapai = this.mapaiJudge(this.arrComparePai[j].data,this.arrComparePai[j].data);
				var TSPismapai = this.TSPmapaiJudge(temp.arrPai);
				if(ismapai || TSPismapai){  //特殊牌或玩家有马牌
					var mapaiScore = score*2;
					res[j].score -= mapaiScore;
					temp.score += mapaiScore;
				}
				else{
					res[j].score -= score;
					temp.score += score;
				}
			}
			if(score === maxScore){
				arrMaxIndex.push(i);
			}
			else{
				var maxTSPismapai = this.TSPmapaiJudge(TSPInfo[MaxIndex]._holds);//特殊牌最大玩家是否有马牌
				var tempismapai = this.TSPmapaiJudge(temp.arrPai);
				if(tempismapai || maxTSPismapai){  
					var mapaiScore = maxScore*2;
					temp.score -= mapaiScore;
				}
				else{
					temp.score -= maxScore;
				}
				arrMinIndex.push(i);
				
			}
			arrTemp.push(temp);
			var tempInfo = {};
			tempInfo.userId = TSPInfo[i].userId;
			tempInfo.type = TSPType;
			tempInfo.holds = TSPInfo[i]._holds;
			TSPResult.push(tempInfo);
		}

		for(let i = 0;i<arrTemp.length;i++){
			res.push(arrTemp[i]);
		}
		for(let i = 0;i<arrMaxIndex.length;i++){
			let maxIndex = arrMaxIndex[i];
			let len = arrMinIndex.length;

			var maxTSPismapai = this.TSPmapaiJudge(TSPInfo[MaxIndex]._holds);//特殊牌最大玩家是否有马牌
			var TSPismapai = false;
			for(var z = 0;z<TSPInfo.length;z++){ //所有特殊牌里面是否有马牌
				var ismapai = this.TSPmapaiJudge(TSPInfo[z]._holds);
				if(ismapai){
					TSPismapai = true;
					break;
				}
			}

			if(maxTSPismapai){  
				var mapaiScore = maxScore*2;
				score = len * mapaiScore;
			}
			else if(TSPismapai){
				var k = len+1;
				score = k * maxScore;
			}
			else{
				score = len * maxScore;
			}

			
			for(let j = 0;j<res.length;j++){
				if(TSPInfo[maxIndex].userId === res[j].userId){
					res[j].score += score;
				}
			}
		}
	},

	dealTSPScore:function(TSPType){
		var score = 0;
		switch(TSPType){
			case PaiType.STH:
				score = 6;
				break;
			case PaiType.SSZ:
				score = 6;
				break;
			case PaiType.LDB:
				score = 6;
				break;
			case PaiType.STST:
				score = 18;
				break;
			case PaiType.TZP:
				score = 8;
				break;
			case PaiType.THSBD:
				score = 10;
				break;
			case PaiType.WTZ:
				score = 13;
				break;
			case PaiType.QX:
				score = 8;
				break;
			case PaiType.QD:
				score = 8;
				break;
			case PaiType.CYS:
				score = 8;
				break;
			case PaiType.SFTX:
				score = 36;
				break;
			case PaiType.STHS:
				score = 40;
				break;
			case PaiType.YTL:
				score = 52;
				break;
			case PaiType.ZZQL:
				score = 108;
				break;
			default:
				break;	
		}
		return score;
	}
	
});

module.exports = Game_Normal;