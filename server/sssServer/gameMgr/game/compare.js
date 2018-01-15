var PaiType = require("../../Define").PaiType;
var Compare = {}

//说明：拿到牌马上进行排序，以下函数均针对排序后的数组

//顺子
Compare.isShunZi = function(arrPai){
	var len = arrPai.length;
	if(len === 5){
		if(arrPai[0].value === 14 &&
			arrPai[1].value === 5 &&
			arrPai[2].value === 4 &&
			arrPai[3].value === 3 &&
			arrPai[4].value === 2){
			return true;
		}
	}
	for(var i = 0; i < len-1; i++){
		var value1 = arrPai[i].value;
		var value2 = arrPai[i+1].value;
		if (value1 - value2 !== 1) {
			return false;
		}
	}
	return true;
};

//同花
Compare.isTongHua = function(arrPai){
	var len = arrPai.length;
	var type = arrPai[0].type;
	for(var i = 1; i < len; i++){
		if(arrPai[i].type !== type){
			return false;
		}
	}
	return true;
};

//判断是否为三顺子，或者三同花顺，或者是同花顺报道
Compare.isSSZ = function(arrPai, bTongHua, bTHSBD){
	var len = arrPai.length;
	if(len !== 13){
		return false;
	}
	//用于存放顺子的数组
	var arrTemp = [];
	//每次取完顺子后剩余的牌
	var arrResPai = [];
	//是否是同花顺报道
	var isTHSBD = false;
	//是否进行同花顺判断
	var isTHS = false;
	arrResPai = arrPai.concat();
	//移除arrResPai内包含arrRemove的元素
	var removeArr = function(arrRemove){
		var removeLen = arrRemove.length;
		for(var i = 0; i < removeLen; ++i){
			var resLen = arrResPai.length;
			for(var j = 0; j < resLen; ++j){
				if(arrRemove[i].type === arrResPai[j].type
				&& arrRemove[i].value === arrResPai[j].value){
					arrResPai.splice(j,1);
					break;
				}
			}
		}
	}
	//判断剩余的牌内是否能取到长度为szCount的顺子
	var getShunZi = function(szCount){
		var success = false;
		arrTemp.push(arrResPai[0]);
		for(var i = 1; i < arrResPai.length; i++){
			if(arrTemp[arrTemp.length-1].value - arrResPai[i].value === 1){
				if (bTongHua) {
					if (arrTemp[0].type === arrResPai[i].type) {
						arrTemp.push(arrResPai[i]);
					}
				}
				else{
					if(bTHSBD){
						if(!isTHS){
							for(var j = 0; j < 9;j++){
								var len = arrResPai.length;
								if(!arrResPai[j].type){
									break;
								}
								var type = arrResPai[j].type;
								//用于存放同花的数组
								//var tonghua = [];
								arrTemp = [];
								var k = 0;
								arrTemp.push(arrResPai[j]);
								for(let n = 1; n < len; n++){
									if(arrPai[n].type == type && 
										arrTemp[0+k].value - arrPai[n].value === 1){
										arrTemp.push(arrResPai[n]);
										k++;
									}

									if(arrTemp.length === 5){
										isTHS = true;
										isTHSBD = isTHS;
										break;
									}
								}
								if(arrTemp.length === 5){
									break;
								}
							}
						}
						else{
							arrTemp.push(arrResPai[i]);
						}
					}
					else{
						arrTemp.push(arrResPai[i]);
					}
				}
				//12345顺子
				if(arrTemp[0].value === 5 && arrTemp.length === 4){
					for(var k = 0;k < arrResPai.length;k++){
						if(arrResPai[k].value == 14){
							if(bTongHua){
                                if(arrTemp[0].type === arrResPai[k].type){
                                    arrTemp.push(arrResPai[k]);
                                    break;
                                }
                            }
                            else{
                                arrTemp.push(arrResPai[k]);
                                break;
                            }
						}
					}
				}
				if(arrTemp.length>=szCount){
					break;
				}
			}
			if(arrTemp[arrTemp.length-1].value - arrResPai[i].value > 1){
				arrTemp.length = 0;
				if(i > len - szCount){
					break;
				}
				arrTemp.push(arrResPai[i]);
			}
		}

		//取到数字长度是否为szCount
		success = (arrTemp.length >= szCount);
		
		if(success){
			//
			removeArr(arrTemp);
		}
		arrTemp.length = 0;
		return success;
	};

	if(getShunZi(5)&&getShunZi(5)&&getShunZi(3)){
		if(bTHSBD){
			if(isTHSBD){
				return true;
			}
		}
		else{
			return true;
		}
	}
	else{
		isTHS = false;
		arrResPai.length = 0;
		arrResPai = arrPai.concat();
		if(getShunZi(3)&&getShunZi(5)&&getShunZi(5)){
			if(bTHSBD){
				if(isTHSBD){
					return true;
				}
			}
			else{
				return true;
			}
		}
		else{
			isTHS = false;
			arrResPai.length = 0;
			arrResPai = arrPai.concat();
			if(getShunZi(5)&&getShunZi(3)&&getShunZi(5)){
				if(bTHSBD){
					if(isTHSBD){
						return true;
					}
					else
					{
						return false;
					}
				}
				else{
					return true;
				}
			}
			else
			{
				return false;
			}
		}
	}
};
//获取牌类型
Compare.getType = function(arrPai){
	var isSTST = function(tongPai){
		for (var i = 0; i < tongPai.length; i++) {
			if(tongPai[i].count !== 3){
				return false;
			}
		}
		return true;
	};
	
	var isSTH = function(arrPai){
		var len = arrPai.length;
		if(len !== 13){
			return false;
		}
		var result = [];
		
		for(var i = 0; i < 4; i++){
			var count = 0;
			for(var j = 0; j < len; j++){
				if(arrPai[j].type === i){
					++count;
				}
			}
			if(count > 0){
				result.push({type:i, count:count});
			}
		}
		
		result.sort(function(a, b){
			return (a.count - b.count);
		});

		if(result.length >= 4){
			return false;
		}
		else if(result.length === 3){
			if(result[0].count === 3 
			&& result[1].count === 5
			&& result[2].count === 5){
				return true;
			}
			return false;
		}
		else if(result.length === 2){
			if(result[0].count === 3 
			&& result[1].count === 10){
				return true;
			}
			return false;
		}
		else{
			return false;
		}
	}
	var isST = function(arrTPInfo){
		for (var i = 0; i < arrTPInfo.length; i++) {
			if(arrTPInfo[i].count === 3){
				return true;
			}
		}
		return false;
	}

	var isWTZ = function(arrPai){
		var analyseData = analysePai(arrPai);
		var tongPai = analyseData.tongPai;
		var sanPai = analyseData.sanPai;
		if(sanPai.length >= 1)
		{
			return false;
		}
		for (var i = 0; i < tongPai.length; i++) {
			if(tongPai[i].count === 5){
				return true;
			}
		}
		return false;
	}

	var isTZP = function(tongPai){
		var bZhaDan = false;
		for (var i = 0; i < tongPai.length; i++) {
			if(tongPai[i].count === 4){
				bZhaDan = true;
			}
		}
		if(!bZhaDan)
		{
			return false;
		}
		var duiziCount = 0;
		for (var i = 0; i < tongPai.length; i++) {
			if(tongPai[i].count >= 2){
				duiziCount++;
			}
		}
		if(bZhaDan && duiziCount === 5)
		{
			return true;
		}
		else
		{
			return false;
		}
	}
	//三分天下
	var isSFTX = function(arrTPInfo){
		var count = 0;
		for (var i = 0; i < arrTPInfo.length; i++) {
			if(arrTPInfo[i].count === 4){
				count++;
			}
		}
		return count === 3? true:false;
	}
	
	var type = 0;
	var analyseData = analysePai(arrPai);
	var tongPai = analyseData.tongPai;
	var sanPai = analyseData.sanPai;
	var paiLen = arrPai.length;
	var tpLen = tongPai.length;
	var spLen = sanPai.length;
	var bTonhua = Compare.isTongHua(arrPai);
	var bShunzi = Compare.isShunZi(arrPai);
	var bSSZ = Compare.isSSZ(arrPai,false,false);
	var bSTHS = Compare.isSSZ(arrPai,true,false);
	var bTHSBD = Compare.isSSZ(arrPai,false,true);
	if(3 === paiLen){
		if(tpLen === 1 && spLen === 0){
			type = PaiType.ST;
		}
		else if(tpLen === 1 && spLen === 1){
			type = PaiType.YD;
		}
		else{
			type = PaiType.WL;
		}
	}
	else if (5 === paiLen) {
		if(tpLen === 1 && spLen === 0){	//是否五同？
			return PaiType.WT;
		}
		else if(bTonhua&&bShunzi){
			return PaiType.THS;
		}
		else if(spLen === 1 && tpLen === 1){
			return PaiType.TZ;
		}
		else if(tpLen === 2 && spLen === 0){
			type = PaiType.HL;
		}
		else if(bTonhua){
			type = PaiType.TH;
		}
		else if(bShunzi){
			type = PaiType.SZ;
		}
		else if (isST(tongPai)) {
			type = PaiType.ST;
		}
		else if (2 === tpLen && 1 === spLen) {
			type = PaiType.ED;
		}
		else if (1 === tpLen && 3 === spLen) {
			type = PaiType.YD;
		}
		else{
			type = PaiType.WL;
		}
	}
	else if(13 === arrPai.length){
		if (bTonhua&&bShunzi) {
			type = PaiType.ZZQL;
		}
		else if(bShunzi){
			type = PaiType.YTL;
		}
		//三同花顺
		else if(bSTHS){
			type = PaiType.STHS;
		}
		else if (isSFTX(tongPai)) {
			type = PaiType.SFTX;
		}
		else if(isWTZ(arrPai,true)){
			type = PaiType.WTZ;
		}
		else if(bTHSBD){
			type = PaiType.THSBD;
		}
		else if (bSSZ) {
			type = PaiType.SSZ;
		}
		else if(isTZP(tongPai,true)){
			type = PaiType.TZP;
		}
		else if (bTonhua) {
			type = PaiType.CYS;
		}
		else if (arrPai[paiLen - 1].value >= 8) {
			type = PaiType.QD;
		}
		else if (arrPai[0].value < 8) {
			type = PaiType.QX;
		}
		else if (isSTST(arrPai)) {
			type = PaiType.STST;
		}
		else if (tpLen === 6&&(spLen === 1)) {
			type = PaiType.LDB;
		}
		else if(isSTH(arrPai)){
			type = PaiType.STH;
		}
		else{
			type = PaiType.WL;
		}
	}
	else{
		type = PaiType.WL;
	}
	return type;
};

//快速摆牌接口
//对子
Compare.getDuiZi = function(arrPai){
    var analyseData = QuickAnalysePai(arrPai);
    var tongPai = analyseData.arrTongPai;
    var arrResultPai = [];
    for (var i = 0; i < tongPai.length; i++) {
        var arrDuiZi = [];
        arrDuiZi.push(tongPai[i][0]);
        arrDuiZi.push(tongPai[i][1]);
        arrResultPai.push(arrDuiZi);
		return arrResultPai[0];
    }
};
//两对
Compare.getLiangDui = function(arrPai){
    var analyseData = QuickAnalysePai(arrPai);
    var tongPai = analyseData.arrTongPai;
    var arrResultPai = [];
    for (var i = 0; i < tongPai.length; i++) {
        var arrDuiZi = [];
        arrDuiZi.push(tongPai[i][0]);
        arrDuiZi.push(tongPai[i][1]);
        arrResultPai.push(arrDuiZi);
		return arrResultPai[0];
    }
};
//三条
Compare.getSanTiao = function(arrPai){
    var analyseData = QuickAnalysePai(arrPai);
    var tongPai = analyseData.arrTongPai;
    var arrResultPai = [];
    for (var i = 0; i < tongPai.length; i++) {
        var arrSanTiao = [];
        if(tongPai[i].length > 2){
            arrSanTiao.push(tongPai[i][0]);
            arrSanTiao.push(tongPai[i][1]);
            arrSanTiao.push(tongPai[i][2]);
            arrResultPai.push(arrSanTiao);
			return arrResultPai[0];
        }
    }
};

//顺子
Compare.getShunZi = function(arrPai,bTongHua){
    var analyseData = QuickAnalysePai(arrPai);
    var arrResultPai = [];

    for(var i = 0;i<arrPai.length;i++){
        var arrShunZi = [];
        var shunziLen = 1;
        arrShunZi.push(arrPai[i]);    //把第一张先存进去
        for(var j = i;j<arrPai.length;j++){
            if(Math.abs(arrPai[j].value - arrShunZi[arrShunZi.length-1].value) === 1){
				if (bTongHua) {
					if (arrShunZi[0].type === arrPai[j].type) {
						arrShunZi.push(arrPai[j]);
					}
				}
				else{
					arrShunZi.push(arrPai[j]);
				}
				if(arrShunZi[0].value === 5 && arrShunZi.length === 4){   //12345顺子
                    for(var k = 0;k < arrPai.length;k++){
                        if(arrPai[k].value == 14){
                            if(bTongHua){
                                if(arrShunZi[0].type === arrPai[k].type){
                                    arrShunZi.push(arrPai[k]);
                                    break;
                                }
                            }
                            else{
                                arrShunZi.push(arrPai[k]);
                                break;
                            }
                        }
                    }
                }
				if(arrShunZi.length >= 5){
					if(arrResultPai[0] && arrShunZi[0].value === 5 && arrShunZi[4].value === 14 
						&& arrResultPai[0][0].value === 14){ //第零项为10 11 12 13 1 顺子  调整12345的位置
                        var Data = arrResultPai[1];
                        arrResultPai[1] = arrShunZi;
                        arrResultPai.push(Data);
                        break;
                    }
                    else if(arrResultPai[0] && arrShunZi[0].value === 5 && arrShunZi[4].value === 14){
                        var Data = arrResultPai[0];
                        arrResultPai[0] = arrShunZi;
                        arrResultPai.push(Data);
                        break;
                    }
                    arrResultPai.push(arrShunZi);
					break;
				}
			}
			if(arrPai[j].value - arrShunZi[arrShunZi.length-1].value > 1){
				arrShunZi = [];
				break;
			}
        }
	}
	return arrResultPai[0];
};

//同花
Compare.getTongHua = function(arrPai){
    var len = arrPai.length;
    var arrHeitao = [];
    var arrHongtao = [];
    var arrMeihua = [];
    var arrFangkuai = [];
    var arrResultPai = [];
    for(var i = 0; i < len; i++){
        if(arrPai[i].type === 1){
            arrHeitao.push(arrPai[i]);
        }
        if(arrPai[i].type === 2){
            arrHongtao.push(arrPai[i]);
        }
        if(arrPai[i].type === 0){
            arrMeihua.push(arrPai[i]);
        }
        if(arrPai[i].type === 3){
            arrFangkuai.push(arrPai[i]);
        }
    }
    if(arrHeitao.length > 4){
        for(var i = 0;i < arrHeitao.length - 4;i++){
            var arrTemp = [];
            for(var j = 0;j<5;j++){
                arrTemp.push(arrHeitao[j + i]);
            }
            arrResultPai.push(arrTemp);
        }
    }
    if(arrHongtao.length > 4){
        for(var i = 0;i < arrHongtao.length - 4;i++){
            var arrTemp = [];
            for(var j = 0;j<5;j++){
                arrTemp.push(arrHongtao[j + i]);
            }
            arrResultPai.push(arrTemp);
        }
    }
    if(arrMeihua.length > 4){
        for(var i = 0;i < arrMeihua.length - 4;i++){
            var arrTemp = [];
            for(var j = 0;j<5;j++){
                arrTemp.push(arrMeihua[j + i]);
            }
            arrResultPai.push(arrTemp);
        }
    }
    if(arrFangkuai.length > 4){
        for(var i = 0;i < arrFangkuai.length - 4;i++){
            var arrTemp = [];
            for(var j = 0;j<5;j++){
                arrTemp.push(arrFangkuai[j + i]);
            }
            arrResultPai.push(arrTemp);
        }
    }

	for(let i = 0;i < arrResultPai.length;i++){
		var isMax = true;
		for(let j = 0;j < arrResultPai.length;j++){
			if(i == j){
				continue;
			}
			if(arrResultPai[i][0].value < arrResultPai[j][0].value){
				isMax = false;
				break;
			}
		}
		if(isMax){
			if(arrResultPai.length > 1){
				for(var x = 1;x < arrResultPai.length;x++){  //同花最大牌一样
					for(var y = 0;y < arrResultPai[0].length;y++){ 
						if(arrResultPai[0][y].value > arrResultPai[x][y].value){
							break;
						}
						else if(arrResultPai[0][y].value < arrResultPai[x][y].value){
							var head = arrResultPai[x];
							arrResultPai[x] = arrResultPai[0];
							arrResultPai[0] = head;
							break;
						}
					}
				}
			}
			return arrResultPai[0];
		}
	}
};

//葫芦
Compare.getHuLu = function(arrPai){
    var analyseData = QuickAnalysePai(arrPai);
    var arrTongPai = analyseData.arrTongPai;
    var arrResultPai = [];
    var arrHuLu = [];
    for(var i = 0; i < arrTongPai.length; i++){
        if(arrTongPai[i].length > 2){
            for(var j = 0; j < arrTongPai.length; j++){
                if(i === j){
                    continue;
                }
                arrHuLu.push(arrTongPai[i][0]);
                arrHuLu.push(arrTongPai[i][1]);
                arrHuLu.push(arrTongPai[i][2]);
                if(arrTongPai[j].length > 1){
                    arrHuLu.push(arrTongPai[j][0]);
                    arrHuLu.push(arrTongPai[j][1]);
                    arrResultPai.push(arrHuLu);
					return arrResultPai[0];
                }
                arrHuLu = [];
            }
        }
    }
};

//铁支
Compare.getTieZhi = function(arrPai){
    var analyseData = QuickAnalysePai(arrPai);
    var arrTongPai = analyseData.arrTongPai;
    var arrResultPai = [];
    var arrTieZhi = [];
    for(var i = 0; i < arrTongPai.length; i++){
        if(arrTongPai[i].length === 4){
            arrTieZhi.push(arrTongPai[i][0]);
            arrTieZhi.push(arrTongPai[i][1]);
            arrTieZhi.push(arrTongPai[i][2]);
            arrTieZhi.push(arrTongPai[i][3]);
            arrResultPai.push(arrTieZhi);
			return arrResultPai[0];
        }
    }
};

//五同
Compare.getWuTong = function(arrPai){
    var analyseData = QuickAnalysePai(arrPai);
    var arrTongPai = analyseData.arrTongPai;
    var arrResultPai = [];
    var arrWuTong = [];
    for(var i = 0; i < arrTongPai.length; i++){
        if(arrTongPai[i].length === 5){
            arrWuTong.push(arrTongPai[i][0]);
            arrWuTong.push(arrTongPai[i][1]);
            arrWuTong.push(arrTongPai[i][2]);
            arrWuTong.push(arrTongPai[i][3]);
            arrWuTong.push(arrTongPai[i][4]);
			arrResultPai.push(arrWuTong);
			return arrResultPai[0];
        }
    }
    
};

//快速摆牌
Compare.quickSwing = function(arrPai){
	//剩余牌
	var surplusPai = [];
	for(let i = 0;i<arrPai.length;i++){
		var temp = {};
        temp.type = arrPai[i].type;
        temp.value = arrPai[i].value;
        surplusPai.push(temp);
	}
	var maxArr = [];
	var data = [];
	var tdPai = [];
	var zdPai = [];
	var wdPai = [];
	var tdIndex = 0;
	var zdIndex = 0;
	var wdIndex = 0;

	var fn = function(arrSurplusPai){
		if(surplusPai.length <= 0){
			return;
		}
		maxArr = [];
		maxArr = Compare.getMaxType(surplusPai);
		if(wdIndex + maxArr.length <= 5){
			for(let i = 0;i<maxArr.length;i++){
				wdPai.push(maxArr[i]);
				wdIndex++;
			}
		}
		else if(zdIndex + maxArr.length <= 5){
			for(let i = 0;i<maxArr.length;i++){
				zdPai.push(maxArr[i]);
				zdIndex++;
			}
		}
		else if(tdIndex + maxArr.length <= 3){
			for(let i = 0;i<maxArr.length;i++){
				tdPai.push(maxArr[i]);
				tdIndex++;
			}
		}
		else{	//剩余的散牌就插入空余地方
			var sanPaiIndex = 0;
			for(let i = wdIndex;i < 5;i++){
				wdPai.push(maxArr[sanPaiIndex]);
				wdIndex++;
				sanPaiIndex++;
			}
			for(let i = zdIndex;i < 5;i++){
				zdPai.push(maxArr[sanPaiIndex]);
				zdIndex++;
				sanPaiIndex++;
			}
			for(let i = tdIndex;i < 3;i++){
				tdPai.push(maxArr[sanPaiIndex]);
				tdIndex++;
				sanPaiIndex++;
			}
		}
		surplusPai = Compare.removePai(surplusPai,maxArr);
		fn(surplusPai);
	}
	fn(surplusPai);
	data.push(tdPai);
    data.push(zdPai);
    data.push(wdPai);
	return data;
},

Compare.removePai = function(arrPai,removeArr){
	for(let i = 0;i<removeArr.length;i++){
		for(let j = 0;j<arrPai.length;j++){
			if(arrPai[j].value === removeArr[i].value && arrPai[j].type === removeArr[i].type){
				arrPai.splice(j,1);
				break;
			}
		}
	}
	return arrPai;
},

//获取牌类型
Compare.getMaxType = function(arrPai){
    var arrMaxPai = [];
    var type = 0;
    var analyseData = QuickAnalysePai(arrPai);
    var tongPai = analyseData.tongPai;
    var sanPai = analyseData.sanPai;
    var paiValue = analyseData.paiValue;
    var paiLen = arrPai.length;
    var tpLen = tongPai.length;
    var spLen = sanPai.length;

	if(Compare.getWuTong(arrPai)){
		arrMaxPai = Compare.getWuTong(arrPai);
	}
	else if(Compare.getShunZi(arrPai,true)){
		arrMaxPai = Compare.getShunZi(arrPai,true);
	}
	else if(Compare.getTieZhi(arrPai)){
		arrMaxPai = Compare.getTieZhi(arrPai);
	}
	else if(Compare.getHuLu(arrPai)){
		arrMaxPai = Compare.getHuLu(arrPai);
	}
	else if(Compare.getTongHua(arrPai)){
		arrMaxPai = Compare.getTongHua(arrPai);
	}
	else if(Compare.getShunZi(arrPai,false)){
		arrMaxPai = Compare.getShunZi(arrPai,false);
	}
	else if(Compare.getSanTiao(arrPai)){
		arrMaxPai = Compare.getSanTiao(arrPai);
	}
	else if(Compare.getLiangDui(arrPai)){
		arrMaxPai = Compare.getLiangDui(arrPai);
	}
	else if(Compare.getDuiZi(arrPai)){
		arrMaxPai = Compare.getDuiZi(arrPai);
	}
	else{
		arrMaxPai = arrPai;
	}

    return arrMaxPai;
};

//
var QuickAnalysePai = function(arrPai){
	var len = arrPai.length;
	var data = {};
	data.sanPai = [];
	data.tongPai = [];
    data.arrTongPai = [];
    data.paiValue = [];
	//同牌信息统计
	var index = 0;
	var count = 1;
    var arrTemp = [];
	for(var i = 0; i < len; ++i){
		if(i >= len - 1){
			if(count > 1){
				var tongPaiTmp= {};
				tongPaiTmp.value = arrPai[index].value;
				tongPaiTmp.count = count;
				data.tongPai.push(tongPaiTmp);
			}
			break;
		}
		if(arrPai[index].value ===  arrPai[i+1].value){
			++count;
		}
		else{
			if(count > 1){
				var tongPaiTmp= {};
				tongPaiTmp.value = arrPai[index].value;
				tongPaiTmp.count = count;
                data.tongPai.push(tongPaiTmp);
			}
			index = i+1;
			count = 1;
		}	
	}

    //同牌数据
    var tLen = data.tongPai.length;
    for(var i = 0;i<tLen;i++){
        for(var j = 0;j<len;j++){
            if(arrPai[j].value === data.tongPai[i].value){
                arrTemp.push(arrPai[j]);
			}
        }
        if(arrTemp.length > 0){
            data.arrTongPai.push(arrTemp);
            arrTemp = [];
        }
    }
	//散牌
	for(var i = 0; i < len; ++i){
		var tLen = data.tongPai.length;
		var bTongPai = false;
		for(var j = 0; j < tLen; ++j){
			if(arrPai[i].value === data.tongPai[j].value){
				bTongPai = true;
				break;
			}
		}
		if(!bTongPai){
			data.sanPai.push(arrPai[i]);
		}
	}

    //所有的牌值
    for(var i = 0; i < len;i++){
        var bExist = false; //判断是否存在
        for(var j = 0;j < data.paiValue.length;j++){
            if(data.paiValue[j].value === arrPai[i].value){
                bExist = true;
            }
        }
        if(!bExist){
            data.paiValue.push(arrPai[i]);
        }
    }

	return data;
}

//
var analysePai = function(arrPai){
	var len = arrPai.length;
	var data = {};
	data.sanPai = [];
	data.tongPai = [];
	//同牌信息统计
	var index = 0;
	var count = 1;
	for(var i = 0; i < len; ++i){
		if(i >= len - 1){
			if(count > 1){
				var tongPaiTmp= {};
				tongPaiTmp.value = arrPai[index].value;
				tongPaiTmp.count = count;
				data.tongPai.push(tongPaiTmp);
			}
			break;
		}
		if(arrPai[index].value ===  arrPai[i+1].value){
			++count;
		}
		else{
			if(count > 1){
				var tongPaiTmp= {};
				tongPaiTmp.value = arrPai[index].value;
				tongPaiTmp.count = count;
				data.tongPai.push(tongPaiTmp);
			}
			index = i+1;
			count = 1;
		}	
	}
	//散牌
	for(var i = 0; i < len; ++i){
		var tLen = data.tongPai.length;
		var bTongPai = false;
		for(var j = 0; j < tLen; ++j){
			if(arrPai[i].value === data.tongPai[j].value){
				bTongPai = true;
				break;
			}
		}
		if(!bTongPai){
			data.sanPai.push(arrPai[i]);
		}
	}

	return data;
}

var comparDX = function(value1, value2){
	if(value1 > value2){
		return 1;
	}
	else if(value1 === value2){
		return 0;
	}
	else{
		return -1;
	}
}

//同类型比较大小
Compare.compareSameType = function(arrPai1, arrPai2, type){
	if(type === 6){	//同花单独处理
		for(let i = 0;i<arrPai1.length;i++){
			if(arrPai1[i].value > arrPai2[i].value){
				return 1;
			}
			else if(arrPai1[i].value < arrPai2[i].value){
				return -1;
			}
		}
		return 0;
	}
	var analyseData1 = analysePai(arrPai1);
	var analyseData2 = analysePai(arrPai2);
	var tpInfo1 = analyseData1.tongPai;
	var tpInfo2 = analyseData2.tongPai;
	tpInfo1.sort(function(a, b){return (b.count - a.count)});
	tpInfo2.sort(function(a, b){return (b.count - a.count)});
	var sanPai1 = analyseData1.sanPai;
	var sanPai2 = analyseData2.sanPai;
	var resultValue = 0;
	var tpLen1 = tpInfo1.length;
	var tpLen2 = tpInfo2.length;
	if(tpLen1 === tpLen2){
		for (var i = 0; i < tpLen1; i++) {
			resultValue = comparDX(tpInfo1[i].value, tpInfo2[i].value);
			if (0 !== resultValue) {
				return resultValue;
			}
		}
	}
	
	var spLen1 = sanPai1.length;
	var spLen2 = sanPai2.length;
	if(spLen1 === spLen2){
		for (var i = 0; i < spLen1; i++) {
			resultValue = comparDX(sanPai1[i].value, sanPai2[i].value);
			if (0 !== resultValue) {
				return resultValue;
			}
		}
	}
	return 0;
};
//比较大小
Compare.comparPai = function(arrPai1, arrPai2){
	var type1 = Compare.getType(arrPai1);
	var type2 = Compare.getType(arrPai2);
	if (type1 > type2) {
		return 1;
	}
	else if (type1 === type2) {
		return Compare.compareSameType(arrPai1, arrPai2, type1);
	}
	else{
		return -1;
	}
};

module.exports = Compare;