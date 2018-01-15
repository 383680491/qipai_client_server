var arithmetic = {}

//type: 0红,1白,2绿,3黄,4公侯伯子男
//value: 1:将,2:士,3:相,4:车,5:马,6:炮,7:卒
//value: 8:公,9:候,10:伯,11:子,12:男

//吃
arithmetic.getPai_chi = function(arrPai, pai){
	var arrResultPai = [];
	if(pai.value > 7){
		return arrResultPai;
	}

	var arrSame = arithmetic.getPai_same(arrPai, pai);
	if(3 == arrSame.length){
		return arrResultPai;
	}

	var isSuoPai = arithmetic.isSuoPai(arrPai, pai);
	if(isSuoPai){
		return arrResultPai;
	}

	//检测对子
	if(pai.value > 1){
		if(arrSame.length > 0){
			let arrDuiZi = [];
			for(let i = 0; i < 2; i++){
				arrDuiZi.push(pai);
			}
			arrResultPai.push(arrDuiZi);
		}
	}

	//检测顺子
	if(pai.value < 7){
		var arrShunZi = arithmetic.getPai_shun(arrPai, pai, 1);
		if(arrShunZi.length < 2){
			return arrResultPai;
		}
		//锁牌
		for(let i = 0; i < arrShunZi.length; i++){
			var arrSamePai = arithmetic.getPai_same(arrPai, arrShunZi[i]);
			if(3 == arrSamePai.length){
				return arrResultPai;
			}
		}

		arrShunZi.push(pai);
		arrResultPai.push(arrShunZi);
	}else{
		var arrZuShunZi = arithmetic.getPai_shun(arrPai, pai, 2);
		if(arrZuShunZi.length < 2){
			return arrResultPai;
		}
		//锁牌
		if(2 == arrZuShunZi.length){
			for(let i = 0; i < arrZuShunZi.length; i++){
				var arrSamePai = arithmetic.getPai_same(arrPai, arrZuShunZi[i]);
				if(3 == arrSamePai.length){
					return arrResultPai;
				}
			}
		}else if(3 == arrZuShunZi.length){
			for(let i = 0; i < arrZuShunZi.length; ){
				var arrSamePai = arithmetic.getPai_same(arrPai, arrZuShunZi[i]);
				if(3 == arrSamePai.length){
					arrZuShunZi.splice(i,1);
				}else{
					i++;
				}
			}
			if(arrZuShunZi.length < 2){
				return arrResultPai;
			}
		}
		
		if(2 == arrZuShunZi.length){
			arrZuShunZi.push(pai);
			arrResultPai.push(arrZuShunZi);
		}else if(3 == arrZuShunZi.length){
			for(let i = 0; i < 3; i++){
				let arr = [];
				arr.push(pai);
				arr.push(arrZuShunZi[i]);
				arr.push(arrZuShunZi[((i + 1) % 3)]);
				arrResultPai.push(arr);
			}
			arrZuShunZi.push(pai);
			arrResultPai.push(arrZuShunZi);
		}
	}

	return arrResultPai;
};

//碰
arithmetic.getPai_peng = function(arrPai, pai){
	var arrResultPai = [];
	if(pai.value < 2 || pai.value > 7){
		return arrResultPai;
	}

	var arrSame = arithmetic.getPai_same(arrPai, pai);
	if(arrSame.length != 2){
		return arrResultPai;
	}

	if(pai.value < 7){
		var arrShunZi = arithmetic.getPai_shun(arrPai, pai, 1);
	}else{
		var arrShunZi = arithmetic.getPai_shun(arrPai, pai, 2);
	}
	if(2 == arrShunZi.length){
		var isPeng = false;
		for(let i = 0; i < arrShunZi.length; i++){
			var arr = arithmetic.getPai_same(arrPai, arrShunZi[i]);
			if(arr.length != 1){
				isPeng = true;
			}
		}
		if(!isPeng){
			return arrResultPai;
		}
	}

	arrSame.push(pai);
	arrResultPai.push(arrSame);
	return arrResultPai;
};

//杠
arithmetic.getPai_gang = function(arrPai, pai){
	var arrResultPai = [];
	if(pai.value > 7){
		return arrResultPai;
	}

	var arrSame = arithmetic.getPai_same(arrPai, pai);
	if(arrSame.length < 3){
		return arrResultPai;
	}

	arrSame.push(pai);
	arrResultPai.push(arrSame);
	return arrResultPai;
};

//取同牌
arithmetic.getPai_same = function(arrPai, pai){
	var arrResultPai = [];
	var len = arrPai.length;
	for(let i = 0; i < len; i++){
		if(arrPai[i].value == pai.value && arrPai[i].type == pai.type){
			arrResultPai.push(arrPai[i]);
		}
	}
	return arrResultPai;
};

//取索引
arithmetic.getIndex = function(arrPai, pai){
	var len = arrPai.length;
	for(let i = 0; i < len; i++){
		if(arrPai[i].value == pai.value && arrPai[i].type == pai.type){
			return i;
		}
	}
	return -1;
};

//取顺子
arithmetic.getPai_shun = function(arrPai, pai, type){
	// 1: 将士象/车马炮 的顺子  2: 卒 的顺子
	var arrResultPai = [];
	if(1 == type){
		var value = 0;
		if(pai.value > 3 && pai.value < 7){
			value = 3;
		}
		for(let i = (1 + value); i < (4 + value); i++){
			if(i == pai.value){
				continue;
			}
			var card = {
				type: pai.type,
				value: i
			};
			var index = arithmetic.getIndex(arrPai, card);
			if(index > -1){
				arrResultPai.push(arrPai[index]);
			}
		}
	}
	else if(2 == type){
		for(let i = 0; i < 4; i++){
			if(i == pai.type){
				continue;
			}
			var card = {
				type: i,
				value: 7
			};
			var index = arithmetic.getIndex(arrPai, card);
			if(index > -1){
				arrResultPai.push(arrPai[index]);
			}
		}
	}

	return arrResultPai;
};

//取金龙
arithmetic.getPai_JL = function(arrPai){
	var arrJL = [];
	for(let i = 0; i < arrPai.length; i++){
		if(arrPai[i].value > 7){
			continue;
		}
		var isContinue = false;
		for(let j = 0; j < arrJL.length; j++){
			if(arrJL[j][0].type == arrPai[i].type && arrJL[j][0].value == arrPai[i].value){
				isContinue = true;
			}
		}
		if(isContinue){
			continue;
		}
		var arrSame = arithmetic.getPai_same(arrPai, arrPai[i]);
		if(4 == arrSame.length){
			arrJL.push(arrSame);
		}
	}
	return arrJL;
};

//取银龙
arithmetic.getPai_YL = function(arrPai){
	var arrYL = [];
	for(let i = 0; i < arrPai.length; i++){
		if(arrPai[i].value > 7){
			continue;
		}
		var isContinue = false;
		for(let j = 0; j < arrYL.length; j++){
			if(arrYL[j][0].type == arrPai[i].type && arrYL[j][0].value == arrPai[i].value){
				isContinue = true;
			}
		}
		if(isContinue){
			continue;
		}
		var arrSame = arithmetic.getPai_same(arrPai, arrPai[i]);
		if(3 == arrSame.length){
			arrYL.push(arrSame);
		}
	}
	return arrYL;
};

//判断锁牌
arithmetic.isSuoPai = function(arrPai, pai){
	if(pai.value > 0 && pai.value < 7){
		var value = 0;
		if(pai.value > 3 && pai.value < 7){
			value = 3;
		}
		var arrSameNum = [];
		for(let i = (1 + value); i < (4 + value); i++){
			let card = {
				type: pai.type,
				value: i
			};
			let arrSame = arithmetic.getPai_same(arrPai, card);
			arrSameNum.push(arrSame.length);
		}
		for(let j = 1; j < arrSameNum.length; j++){
			var isSuoPai = true;
			for(let i = 0; i < arrSameNum.length; i++){
				if(arrSameNum[i] != j){
					isSuoPai = false;
					break;
				}
			}
			if(isSuoPai){
				return true;
			}
		}
	}
	return false;
};

arithmetic.getPai_hu = function(holds, pai){
	holds.sort(function(a, b){
		return (a.value - b.value);
	});

	var arrPai = holds.concat();
	arrPai.push(pai);

	var arr_huPai = [];

	//过滤掉公候伯子男
	for(let i = 8; i < 13; i++){
		let card = {
			type: 4,
			value: i
		};
		let index = arithmetic.getIndex(arrPai, card);
		if(index > -1){
			let arr = [];
			arr.push(card);
			arr_huPai.push({
				pai: arr,
				type: 'null'
			});
			arrPai.splice(index,1);
		}
	}
	if(0 == arrPai.length){
		return arr_huPai;
	}

	//过滤掉杠的牌
	var arrGang = arithmetic.getPai_same(arrPai, pai);
	if(4 == arrGang.length){
		let gang = [];
		for(let i = 0; i < 4; i++){
			gang.push(pai);
			let index = arithmetic.getIndex(arrPai, pai);
			arrPai.splice(index,1);
		}
		arr_huPai.push({
			pai: gang,
			type: 'kaiYinLong'
		});
	}
	if(0 == arrPai.length){
		return arr_huPai;
	}

	//过滤掉顺子
	var isStop = false;
	while(!isStop){
		var len = arrPai.length;
		if(0 == len){
			return arr_huPai;
		}
		for(let i = 0; i < len; i++){
			if(arrPai[i].value < 7){
				var arrShunZi = arithmetic.getPai_shun(arrPai, arrPai[i], 1);
			}else{
				var arrShunZi = arithmetic.getPai_shun(arrPai, arrPai[i], 2);
			}

			if(arrShunZi.length < 2){
				let num = len - 1;
				if(num == i){
					isStop = true;
					break;
				}
				continue;
			}

			arrShunZi.push(arrPai[i]);

			for(let j = 0; j < arrShunZi.length; j++){
				if(1 == arrShunZi[j].value){
					var jiang = arrShunZi[j];
					arrShunZi.splice(j,1);
					break;
				}
			}

			var paiNum = [];
			for(let j = 0; j < arrShunZi.length; j++){
				let arrSame = arithmetic.getPai_same(arrPai, arrShunZi[j]);
				paiNum.push(arrSame.length);
			}
			paiNum.sort(function(a, b){
				return (a - b);
			});

			var target = 0;
			for(let j = 0; j < paiNum.length; j++){
				target = (target * 10 + paiNum[j]);
			}

			if(target < 100){
				if(12 == target){
					return null;
				}

				if(target < 22){
					let shunZi = [];
					for(let j = 0; j < 2; j++){
						let arrSame = arithmetic.getPai_same(arrPai, arrShunZi[j]);
						if(arrSame.length > 2){
							if(arrShunZi[j].value == pai.value && arrShunZi[j].type == pai.type){
								let duiZi = [];
								for(let t = 0; t < 2; t++){
									duiZi.push(arrShunZi[j]);
								}
								arr_huPai.push({
									pai: duiZi,
									type: 'null'
								});
							}else{
								return null;
							}
						}
						shunZi.push(arrShunZi[j]);
						for(let t = 0; t < arrSame.length; t++){
							let index = arithmetic.getIndex(arrPai, arrShunZi[j]);
							arrPai.splice(index,1);
						}
					}
					shunZi.push(jiang);
					let index = arithmetic.getIndex(arrPai, jiang);
					arrPai.splice(index,1);
					arr_huPai.push({
						pai: shunZi,
						type: 'null'
					});
					break;
				}else if(target > 13){
					for(let j = 0; j < 2; j++){
						let arrSame = arithmetic.getPai_same(arrPai, arrShunZi[j]);
						if(2 == arrSame.length){
							let duiZi = [];
							for(let t = 0; t < 2; t++){
								duiZi.push(arrShunZi[j]);
							}
							arr_huPai.push({
								pai: duiZi,
								type: 'null'
							});
						}else if(3 == arrSame.length){
							let san = [];
							for(let t = 0; t < 3; t++){
								san.push(arrShunZi[j]);
							}
							let type = 'yinLong';
							if(arrSame[0].value == pai.value && arrSame[0].type == pai.type){
								type = 'peng';
							}
							arr_huPai.push({
								pai: san,
								type: type
							});
						}
						for(let t = 0; t < arrSame.length; t++){
							let index = arithmetic.getIndex(arrPai, arrShunZi[j]);
							arrPai.splice(index,1);
						}
					}
					break;
				}
			}

			if(3 == arrShunZi.length){
				if(112 == target || 122 == target || 123 == target){
					return null;

				}else if(target < 222){

					let shunZi = [];
					for(let j = 0; j < 3; j++){
						let arrSame = arithmetic.getPai_same(arrPai, arrShunZi[j]);
						if(arrSame.length > 2){
							if(arrShunZi[j].value == pai.value && arrShunZi[j].type == pai.type){
								let duiZi = [];
								for(let t = 0; t < 2; t++){
									duiZi.push(arrShunZi[j]);
								}
								arr_huPai.push({
									pai: duiZi,
									type: 'null'
								});
							}else{
								return null;
							}
						}
						shunZi.push(arrShunZi[j]);
						for(let t = 0; t < arrSame.length; t++){
							let index = arithmetic.getIndex(arrPai, arrShunZi[j]);
							arrPai.splice(index,1);
						}
					}
					arr_huPai.push({
						pai: shunZi,
						type: 'null'
					});
					break;

				}else if(222 == target){

					for(let j = 0; j < 2; j++){
						let shunZi = [];
						for(let t = 0; t < 3; t++){
							shunZi.push(arrShunZi[t]);
							let index = arithmetic.getIndex(arrPai, arrShunZi[t]);
							arrPai.splice(index,1);
						}
						arr_huPai.push({
							pai: shunZi,
							type: 'null'
						});
					}
					break;

				}else if(target > 222){

					for(let j = 0; j < 3; j++){
						let arrSame = arithmetic.getPai_same(arrPai, arrShunZi[j]);
						if(2 == arrSame.length){
							let duiZi = [];
							for(let t = 0; t < 2; t++){
								duiZi.push(arrShunZi[j]);
							}
							arr_huPai.push({
								pai: duiZi,
								type: 'null'
							});
						}else if(3 == arrSame.length){
							let san = [];
							for(let t = 0; t < 3; t++){
								san.push(arrShunZi[j]);
							}
							let type = 'yinLong';
							if(arrSame[0].value == pai.value && arrSame[0].type == pai.type){
								type = 'peng';
							}
							arr_huPai.push({
								pai: san,
								type: type
							});
						}
						for(let t = 0; t < arrSame.length; t++){
							var index = arithmetic.getIndex(arrPai, arrShunZi[j]);
							arrPai.splice(index,1);
						}
					}
					break;
				}

			}else if(4 == arrShunZi.length){
				if(1123 == target || 1133 == target || 1223 == target || 1233 == target || 1333 == target){
					return null;

				}else if(1122 == target){

					let dan = [];
					let shuang = [];
					for(let j = 0; j < 4; j++){
						let arrSame = arithmetic.getPai_same(arrPai, arrShunZi[j]);
						if(1 == arrSame.length){
							dan.push(arrShunZi[j]);
						}else if(2 == arrSame.length){
							shuang.push(arrShunZi[j]);
						}
						for(let t = 0; t < arrSame.length; t++){
							let index = arithmetic.getIndex(arrPai, arrShunZi[j]);
							arrPai.splice(index,1);
						}
					}
					for(let j = 0; j < 2; j++){
						let array = [];
						array.push(dan[j]);
						array.push(shuang[0]);
						array.push(shuang[1]);
						arr_huPai.push({
							pai: array,
							type: 'null'
						});
					}
					break;

				}else if(1222 == target){

					let sanShunZi = [];
					let siShunZi = [];
					for(let j = 0; j < 4; j++){
						let arrSame = arithmetic.getPai_same(arrPai, arrShunZi[j]);
						if(arrSame.length > 1){
							sanShunZi.push(arrShunZi[j]);
						}
						siShunZi.push(arrShunZi[j]);
						
						for(let t = 0; t < arrSame.length; t++){
							let index = arithmetic.getIndex(arrPai, arrShunZi[j]);
							arrPai.splice(index,1);
						}
					}
					arr_huPai.push({
						pai: sanShunZi,
						type: 'null'
					});
					arr_huPai.push({
						pai: siShunZi,
						type: 'null'
					});
					break;

				}else if(target < 2222){

					let shunZi = [];
					for(let j = 0; j < 4; j++){
						let arrSame = arithmetic.getPai_same(arrPai, arrShunZi[j]);
						if(1 == arrSame.length){
							shunZi.push(arrShunZi[j]);

						}else if(2 == arrSame.length){
							let duiZi = [];
							for(let t = 0; t < 2; t++){
								duiZi.push(arrShunZi[j]);
							}
							arr_huPai.push({
								pai: duiZi,
								type: 'null'
							});

						}else if(3 == arrSame.length){
							let san = [];
							for(let t = 0; t < 3; t++){
								san.push(arrShunZi[j]);
							}
							let type = 'yinLong';
							if(arrShunZi[j].value == pai.value && arrShunZi[j].type == pai.type){
								type = 'peng';
							}
							arr_huPai.push({
								pai: san,
								type: type
							});
						}
						for(let t = 0; t < arrSame.length; t++){
							let index = arithmetic.getIndex(arrPai, arrShunZi[j]);
							arrPai.splice(index,1);
						}
					}
					arr_huPai.push({
						pai: shunZi,
						type: 'null'
					});
					break;

				}else if(2222 == target){
					for(let j = 0; j < 2; j++){
						let array = [];
						for(let t = 0; t < 4; t++){
							array.push(arrShunZi[t]);
							let index = arithmetic.getIndex(arrPai, arrShunZi[t]);
							arrPai.splice(index,1);
						}
						arr_huPai.push({
							pai: array,
							type: 'null'
						});
					}
					break;

				}else if(target > 2222){
					for(let j = 0; j < 4; j++){
						let arrSame = arithmetic.getPai_same(arrPai, arrShunZi[j]);
						if(2 == arrSame.length){
							let duiZi = [];
							for(let t = 0; t < 2; t++){
								duiZi.push(arrShunZi[j]);
							}
							arr_huPai.push({
								pai: duiZi,
								type: 'null'
							});
						}else if(3 == arrSame.length){
							let san = [];
							for(let t = 0; t < 3; t++){
								san.push(arrShunZi[j]);
							}
							let type = 'yinLong';
							if(arrSame[0].value == pai.value && arrSame[0].type == pai.type){
								type = 'peng';
							}
							arr_huPai.push({
								pai: san,
								type: type
							});
						}
						for(let t = 0; t < arrSame.length; t++){
							let index = arithmetic.getIndex(arrPai, arrShunZi[j]);
							arrPai.splice(index,1);
						}
					}
					break;
				}
			}
		}
	}
	if(0 == arrPai.length){
		return arr_huPai;
	}

	//过滤三张牌的
	var sanTongPai = arithmetic.getPai_YL(arrPai);
	for(let i = 0; i < sanTongPai.length; i++){
		if(1 == sanTongPai[i][0].value){
			continue;
		}
		let san = [];
		for(let j = 0; j < 3; j++){
			san.push(sanTongPai[i][0]);
			let index = arithmetic.getIndex(arrPai, sanTongPai[i][0]);
			arrPai.splice(index,1);
		}
		let type = 'yinLong';
		if(sanTongPai[i][0].value == pai.value && sanTongPai[i][0].type == pai.type){
			type = 'peng';
		}
		arr_huPai.push({
			pai: san,
			type: type
		});
	}
	if(0 == arrPai.length){
		return arr_huPai;
	}

	//过滤两张牌的
	for(let i = 0; i < arrPai.length; ){
		let arrSame = arithmetic.getPai_same(arrPai, arrPai[i]);
		if(2 == arrSame.length){
			if(1 == arrSame[0].value){
				i++;
				continue;
			}
			let duiZi = [];
			for(let j = 0; j < 2; j++){
				duiZi.push(arrSame[j]);
				let index = arithmetic.getIndex(arrPai, arrSame[j]);
				arrPai.splice(index,1);
			}
			arr_huPai.push({
				pai: duiZi,
				type: 'null'
			});
		}else{
			i++;
		}
	}
	if(0 == arrPai.length){
		return arr_huPai;
	}

	//过滤将
	for(let i = 0; i < arrPai.length; ){
		if(1 == arrPai[i].value){
			let index = arithmetic.getIndex(arrPai, arrPai[i]);
			let array = [];
			array.push(arrPai[i]);
			arr_huPai.push({
				pai: array,
				type: 'null'
			});
			arrPai.splice(index,1);
		}else{
			i++;
		}
	}
	if(0 == arrPai.length){
		return arr_huPai;
	}else{
		return null;
	}
};

arithmetic.computeScore = function(arrPai){
	if(!arrPai){
		return;
	}
	var score = {
		diFan: 3,
		fan: 0,
		yinLongFan: 0,
		jinLongFan: 0
	}
	for(let i = 0; i < arrPai.length; i++){
		var isArray = arrPai[i].pai instanceof Array;
		if(!isArray){
			continue;
		}
		if(1 == arrPai[i].pai.length){

			if(1 == arrPai[i].pai[0].value){
				score.fan += 1;
			}else{
				score.fan += 3;
			}

		}else if(2 == arrPai[i].pai.length){

			continue;

		}else if(3 == arrPai[i].pai.length){

			if('peng' == arrPai[i].type){
				score.fan += 1;
			}else if('yinLong' == arrPai[i].type){
				score.fan += 3;
			}else{
				score.fan += 1;
			}

		}else if(4 == arrPai[i].pai.length){

			if('kaiYinLong' == arrPai[i].type){

				score.yinLongFan += 6;

			}else if('jinLong' == arrPai[i].type){

				score.jinLongFan += 8;

			}else{
				score.fan += 2;
			}

		}
	}
	return score;
};

arithmetic.computeMultiple = function(arrPai){
	var multiple = 0;
	var jinLongNum = 0;
	var yinLongNum = 0;
	for(let i = 0; i < arrPai.length; i++){
		if('jinLong' == arrPai[i].type){
			jinLongNum++;
		}
		if('kaiYinLong' == arrPai[i].type){
			yinLongNum++;
		}
	}
	multiple = 1 + yinLongNum + (jinLongNum * 2);
	return multiple;
};

arithmetic.getType = function(data){
    if(data.type === 4){
        for(var i = 0;i < 5;i++){
            if(data.value === i + 8)
            {
                return i;
            }
        } 
    }else if(data.type === 0){
        for(var i = 5;i < 11;i++){
            if(data.value === i - 4)
            {
                return i;
            }
        }
        if(data.value === 7)
        {
            return 29;
        }
    }else if(data.type === 1){
        for(var i = 11;i < 17;i++){
            if(data.value === i - 10)
            {
                return i;
            }
        } 
        if(data.value === 7)
        {
            return 30;
        }
    }else if(data.type === 2){
        for(var i = 17;i < 23;i++){
            if(data.value === i - 16)
            {
                return i;
            }
        }
        if(data.value === 7)
        {
            return 31;
        }
    }else if(data.type === 3){
        for(var i = 23;i < 29;i++){
            if(data.value === i - 22)
            {
                return i;
            }
        }
        if(data.value === 7)
        {
            return 32;
        }
    }
};

arithmetic.sortSSP = function(arrPai){
    if(arrPai){
        arrPai.sort(function(a,b){
            var t1 = arithmetic.getType(a);
            var t2 = arithmetic.getType(b);
            return t1 - t2;
        });
    }
};

module.exports = arithmetic;