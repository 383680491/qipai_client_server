"use strict";
cc._RF.push(module, '273c1I6VVFPg63gmysKDdIF', 'Compare');
// scripts/sssgame/Compare.js

'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var PaiType = require("define").PaiType;
var Compare = {};

Compare.Index = -1;
Compare.b_obtainType = false; //是否获取其他类型


var isSort = function isSort(arrPai) {
    var len = arrPai.length;
    var bSort = true;
    for (var i = 0; i < len - 1; i++) {
        if (arrPai[i].value < arrPai[i + 1].value) {
            return false;
        }
    }
    return true;
};
//排序
Compare.sortPai = function (arrPai) {
    var len = arrPai.length;
    if (len <= 1) {
        return;
    }
    for (var i = 0; i < len; i++) {
        for (var j = i; j < len; j++) {
            if (arrPai[i].value < arrPai[j].value) {
                var temp = arrPai[i];
                arrPai[i] = arrPai[j];
                arrPai[j] = temp;
            }
        }
    }
};

//取类型牌
Compare.getTypePai = function (arrPai, Type, same) {
    var result = [];
    switch (Type) {
        case PaiType.YD:
            result = Compare.getDuiZi(arrPai, same);
            return result;
            break;
        case PaiType.ED:
            result = Compare.getLiangDui(arrPai, same);
            return result;
            break;
        case PaiType.ST:
            result = Compare.getSanTiao(arrPai, same);
            return result;
            break;
        case PaiType.SZ:
            result = Compare.getShunZi(arrPai, same, false);
            return result;
            break;
        case PaiType.TH:
            result = Compare.getTongHua(arrPai, same);
            return result;
            break;
        case PaiType.HL:
            result = Compare.getHuLu(arrPai, same);
            return result;
            break;
        case PaiType.TZ:
            result = Compare.getTieZhi(arrPai, same);
            return result;
            break;
        case PaiType.THS:
            result = Compare.getShunZi(arrPai, same, true);
            return result;
            break;
        case PaiType.WT:
            result = Compare.getWuTong(arrPai, same);
            return result;
            break;
        default:
            return result;
    }
};

//对子
Compare.getDuiZi = function (arrPai, bSame) {
    var arrResultPai = [];
    if (Compare.b_obtainType) {
        //需要取其他类型
        Compare.b_obtainType = false;
        var arrTemp = [];
        arrTemp = Compare.DZdeleteType(arrPai);
        if (arrTemp) {
            arrResultPai.push(arrTemp);
        }
    }
    var analyseData = analysePai(arrPai);
    var tongPai = analyseData.arrTongPai;
    var Index = 0;
    for (var i = 0; i < tongPai.length; i++) {
        var arrDuiZi = [];
        arrDuiZi.push(tongPai[i][0]);
        arrDuiZi.push(tongPai[i][1]);
        arrResultPai.push(arrDuiZi);
    }
    if (bSame) {
        Compare.Index++;
    } else {
        Compare.Index = 0;
    }
    Index = Compare.Index % tongPai.length;
    return arrResultPai[Index];
};
//对子去掉一个最大的其他类型 再取
Compare.DZdeleteType = function (arrPai) {
    for (var x = 10; x > 3; x--) {
        var TypePai0 = Compare.getTypePai(arrPai, x, false);
        var TypePai1 = Compare.getTypePai(arrPai, x, true);
        for (var m = 0; m < 2; m++) {
            if (m === 0) {
                var TypePai = TypePai0;
            } else if (m === 1) {
                var TypePai = TypePai1;
            }
            if (TypePai) {
                var remainingPai = []; //剩下的牌
                for (var i = 0; i < arrPai.length; i++) {
                    var b_same = false;
                    for (var j = 0; j < TypePai.length; j++) {
                        if (arrPai[i] === TypePai[j]) {
                            delete TypePai[j];
                            b_same = true;
                            break;
                        }
                    }
                    if (!b_same) {
                        remainingPai.push(arrPai[i]);
                    }
                }

                if (!remainingPai) {
                    return null;
                }

                var analyseData = analysePai(remainingPai);
                var tongPai = analyseData.arrTongPai;
                var Index = 0;
                var arrResultPai = [];
                if (tongPai.length > 0) {
                    var arrDuiZi = [];
                    arrDuiZi.push(tongPai[0][0]);
                    arrDuiZi.push(tongPai[0][1]);
                    return arrDuiZi;
                }
            }
        }
    }

    return null;
};
//两对
Compare.getLiangDui = function (arrPai, bSame) {
    var arrResultPai = [];
    var analyseData = analysePai(arrPai);
    var tongPai = analyseData.arrTongPai;
    var Index = 0;
    for (var i = 0; i < tongPai.length; i++) {
        var arrDuiZi = [];
        arrDuiZi.push(tongPai[i][0]);
        arrDuiZi.push(tongPai[i][1]);
        arrResultPai.push(arrDuiZi);
    }
    if (bSame) {
        Compare.Index++;
    } else {
        Compare.Index = 0;
    }
    Index = Compare.Index % tongPai.length;
    return arrResultPai[Index];
};
//三条
Compare.getSanTiao = function (arrPai, bSame) {
    var arrResultPai = [];
    if (Compare.b_obtainType) {
        //需要取其他类型
        Compare.b_obtainType = false;
        var arrTemp = [];
        arrTemp = Compare.STdeleteType(arrPai);
        if (arrTemp) {
            arrResultPai.push(arrTemp);
            Total++;
        }
    }
    var analyseData = analysePai(arrPai);
    var tongPai = analyseData.arrTongPai;
    var Index = 0;
    var Total = 0;
    for (var i = 0; i < tongPai.length; i++) {
        var arrSanTiao = [];
        if (tongPai[i].length === 3) {
            arrSanTiao.push(tongPai[i][0]);
            arrSanTiao.push(tongPai[i][1]);
            arrSanTiao.push(tongPai[i][2]);
            arrResultPai.push(arrSanTiao);
            Total++;
        } else if (tongPai[i].length > 3) {
            //同牌大于3张 
            var TongHuaPai = Compare.getTongHua(arrPai, false);
            arrSanTiao.push(tongPai[i][0]);
            arrSanTiao.push(tongPai[i][1]);
            arrSanTiao.push(tongPai[i][2]);
            if (TongHuaPai) {
                for (var m = 0; m < TongHuaPai.length; m++) {
                    for (var k = 0; k < arrSanTiao.length; k++) {
                        if (TongHuaPai[m] === arrSanTiao[k]) {
                            arrSanTiao[k] = tongPai[i][3];
                        }
                    }
                }
            }
        }
    }
    if (bSame) {
        Compare.Index++;
    } else {
        Compare.Index = 0;
    }
    Index = Compare.Index % Total;
    return arrResultPai[Index];
};
//三条去掉一个最大的其他类型 再取
Compare.STdeleteType = function (arrPai) {
    for (var x = 10; x > 4; x--) {
        var TypePai0 = Compare.getTypePai(arrPai, x, false);
        var TypePai1 = Compare.getTypePai(arrPai, x, true);
        for (var m = 0; m < 2; m++) {
            if (m === 0) {
                var TypePai = TypePai0;
            } else if (m === 1) {
                var TypePai = TypePai1;
            }
            if (TypePai) {
                var remainingPai = []; //剩下的牌
                for (var i = 0; i < arrPai.length; i++) {
                    var b_same = false;
                    for (var j = 0; j < TypePai.length; j++) {
                        if (arrPai[i] === TypePai[j]) {
                            delete TypePai[j];
                            b_same = true;
                            break;
                        }
                    }
                    if (!b_same) {
                        remainingPai.push(arrPai[i]);
                    }
                }

                if (!remainingPai) {
                    return null;
                }

                var analyseData = analysePai(remainingPai);
                var tongPai = analyseData.arrTongPai;
                var Index = 0;
                var Total = 0;
                for (var i = 0; i < tongPai.length; i++) {
                    var arrSanTiao = [];
                    if (tongPai[i].length === 3) {
                        arrSanTiao.push(tongPai[i][0]);
                        arrSanTiao.push(tongPai[i][1]);
                        arrSanTiao.push(tongPai[i][2]);
                        return arrSanTiao;
                    } else if (tongPai[i].length > 3) {
                        //同牌大于3张 
                        var TongHuaPai = Compare.getTongHua(arrPai, false);
                        arrSanTiao.push(tongPai[i][0]);
                        arrSanTiao.push(tongPai[i][1]);
                        arrSanTiao.push(tongPai[i][2]);
                        if (TongHuaPai) {
                            for (var m = 0; m < TongHuaPai.length; m++) {
                                for (var k = 0; k < arrSanTiao.length; k++) {
                                    if (TongHuaPai[m] === arrSanTiao[k]) {
                                        arrSanTiao[k] = tongPai[i][3];
                                    }
                                }
                            }
                        }
                        return arrSanTiao;
                    }
                }
            }
        }
    }

    return null;
};

//顺子
Compare.getShunZi = function (arrPai, bSame, bTongHua) {
    var arrResultPai = [];
    if (Compare.b_obtainType) {
        //需要取其他类型
        Compare.b_obtainType = false;
        var arrTemp0 = [];
        arrTemp0 = Compare.SZdeleteType(arrPai, bTongHua);
        if (arrTemp0) {
            arrResultPai.push(arrTemp0);
            Total++;
        }
    }
    var analyseData = analysePai(arrPai);
    var Index = 0;
    var Total = 0;

    for (var i = 0; i < arrPai.length; i++) {
        var arrShunZi = [];
        var shunziLen = 1;
        arrShunZi.push(arrPai[i]); //把第一张先存进去
        for (var j = i; j < arrPai.length; j++) {
            if (Math.abs(arrPai[j].value - arrShunZi[arrShunZi.length - 1].value) === 1) {
                if (bTongHua) {
                    if (arrShunZi[0].type === arrPai[j].type) {
                        arrShunZi.push(arrPai[j]);
                    }
                } else {
                    arrShunZi.push(arrPai[j]);
                }
                if (arrShunZi[0].value === 5 && arrShunZi.length === 4) {
                    //12345顺子
                    for (var k = 0; k < arrPai.length; k++) {
                        if (arrPai[k].value == 14) {
                            if (bTongHua) {
                                if (arrShunZi[0].type === arrPai[k].type) {
                                    arrShunZi.push(arrPai[k]);
                                    break;
                                }
                            } else {
                                arrShunZi.push(arrPai[k]);
                                break;
                            }
                        }
                    }
                }
                if (arrShunZi.length >= 5) {
                    if (!arrTemp0 && arrResultPai[0] && arrShunZi[0].value === 5 && arrShunZi[4].value === 14 && arrResultPai[0][0].value === 14) {
                        //第零项为10 11 12 13 1 顺子  调整12345的位置
                        var Data = arrResultPai[1];
                        arrResultPai[1] = arrShunZi;
                        arrResultPai.push(Data);
                        Total++;
                        break;
                    } else if (!arrTemp0 && arrResultPai[0] && arrShunZi[0].value === 5 && arrShunZi[4].value === 14) {
                        var Data = arrResultPai[0];
                        arrResultPai[0] = arrShunZi;
                        arrResultPai.push(Data);
                        Total++;
                        break;
                    }
                    arrResultPai.push(arrShunZi);
                    Total++;
                    break;
                }
            }
            if (arrPai[j].value - arrShunZi[arrShunZi.length - 1].value > 1) {
                arrShunZi = [];
                break;
            }
        }
    }
    if (bSame) {
        Compare.Index++;
    } else {
        Compare.Index = 0;
    }
    Index = Compare.Index % Total;
    return arrResultPai[Index];
};
//顺子去掉一个最大的其他类型 再取
Compare.SZdeleteType = function (arrPai, bTongHua) {
    for (var x = 10; x > 3; x--) {
        if (bTongHua) {
            if (x === 9) {
                continue;
            }
        } else if (!bTongHua) {
            if (x === 5) {
                continue;
            }
        }
        var TypePai0 = Compare.getTypePai(arrPai, x, false);
        var TypePai1 = Compare.getTypePai(arrPai, x, true);
        for (var m = 0; m < 2; m++) {
            if (m === 0) {
                var TypePai = TypePai0;
            } else if (m === 1) {
                var TypePai = TypePai1;
            }
            if (TypePai) {
                var arrTemp = Compare.getSZ(arrPai, TypePai, bTongHua);
                if (arrTemp) {
                    return arrTemp;
                }
            }
        }
    }
    return null;
};
Compare.getSZ = function (arrPai, TypePai, bTongHua) {
    //剩餘牌取順子
    var remainingPai = []; //剩下的牌
    for (var i = 0; i < arrPai.length; i++) {
        var b_same = false;
        for (var j = 0; j < TypePai.length; j++) {
            if (arrPai[i] === TypePai[j]) {
                delete TypePai[j];
                b_same = true;
                break;
            }
        }
        if (!b_same) {
            remainingPai.push(arrPai[i]);
        }
    }

    if (!remainingPai) {
        return null;
    }

    var analyseData = analysePai(remainingPai);
    var Index = 0;
    var Total = 0;

    for (var _i = 0; _i < remainingPai.length; _i++) {
        var arrShunZi = [];
        var shunziLen = 1;
        arrShunZi.push(remainingPai[_i]); //把第一张先存进去
        for (var _j = _i; _j < remainingPai.length; _j++) {
            if (Math.abs(remainingPai[_j].value - arrShunZi[arrShunZi.length - 1].value) === 1) {
                if (bTongHua) {
                    if (arrShunZi[0].type === remainingPai[_j].type) {
                        arrShunZi.push(remainingPai[_j]);
                    }
                } else {
                    arrShunZi.push(remainingPai[_j]);
                }
                if (arrShunZi[0].value === 5 && arrShunZi.length === 4) {
                    //12345顺子
                    for (var k = 0; k < remainingPai.length; k++) {
                        if (remainingPai[k].value == 14) {
                            if (bTongHua) {
                                if (arrShunZi[0].type === remainingPai[k].type) {
                                    arrShunZi.push(remainingPai[k]);
                                    break;
                                }
                            } else {
                                arrShunZi.push(remainingPai[k]);
                                break;
                            }
                        }
                    }
                }
                if (arrShunZi.length >= 5) {
                    return arrShunZi;
                    break;
                }
            }
            if (remainingPai[_j].value - arrShunZi[arrShunZi.length - 1].value > 1) {
                arrShunZi = [];
                break;
            }
        }
    }
};

//同花
Compare.getTongHua = function (arrPai, bSame) {
    var arrResultPai = [];
    if (Compare.b_obtainType) {
        //需要取其他类型
        Compare.b_obtainType = false;
        var arrTemp0 = [];
        arrTemp0 = Compare.THdeleteType(arrPai);
        if (arrTemp0) {
            arrResultPai.push(arrTemp0);
            Total++;
        }
    }
    var Index = 0;
    var Total = 0;
    var len = arrPai.length;
    var arrHeitao = [];
    var arrHongtao = [];
    var arrMeihua = [];
    var arrFangkuai = [];
    for (var i = 0; i < len; i++) {
        if (arrPai[i].type === 1) {
            arrHeitao.push(arrPai[i]);
        }
        if (arrPai[i].type === 2) {
            arrHongtao.push(arrPai[i]);
        }
        if (arrPai[i].type === 0) {
            arrMeihua.push(arrPai[i]);
        }
        if (arrPai[i].type === 3) {
            arrFangkuai.push(arrPai[i]);
        }
    }

    if (arrHeitao.length > 4) {
        for (var _i2 = 0; _i2 < arrHeitao.length - 4; _i2++) {
            var arrTemp = [];
            for (var j = 0; j < 5; j++) {
                arrTemp.push(arrHeitao[j + _i2]);
            }
            arrResultPai.push(arrTemp);
            Total++;
        }
    }
    if (arrHongtao.length > 4) {
        for (var _i3 = 0; _i3 < arrHongtao.length - 4; _i3++) {
            var arrTemp = [];
            for (var _j2 = 0; _j2 < 5; _j2++) {
                arrTemp.push(arrHongtao[_j2 + _i3]);
            }
            arrResultPai.push(arrTemp);
            Total++;
        }
    }
    if (arrMeihua.length > 4) {
        for (var _i4 = 0; _i4 < arrMeihua.length - 4; _i4++) {
            var arrTemp = [];
            for (var _j3 = 0; _j3 < 5; _j3++) {
                arrTemp.push(arrMeihua[_j3 + _i4]);
            }
            arrResultPai.push(arrTemp);
            Total++;
        }
    }
    if (arrFangkuai.length > 4) {
        for (var _i5 = 0; _i5 < arrFangkuai.length - 4; _i5++) {
            var arrTemp = [];
            for (var _j4 = 0; _j4 < 5; _j4++) {
                arrTemp.push(arrFangkuai[_j4 + _i5]);
            }
            arrResultPai.push(arrTemp);
            Total++;
        }
    }
    if (bSame) {
        Compare.Index++;
    } else {
        Compare.Index = 0;
    }
    Index = Compare.Index % Total;
    if (!arrTemp0 && arrResultPai.length > 1) {
        for (var x = 1; x < arrResultPai.length; x++) {
            //同花最大牌一样
            for (var y = 0; y < arrResultPai[0].length; y++) {
                if (arrResultPai[0][y].value > arrResultPai[x][y].value) {
                    break;
                } else if (arrResultPai[0][y].value < arrResultPai[x][y].value) {
                    var head = arrResultPai[x];
                    arrResultPai[x] = arrResultPai[0];
                    arrResultPai[0] = head;
                    break;
                }
            }
        }
    }
    return arrResultPai[Index];
};

//同花去掉一个最大的其他类型 再取
Compare.THdeleteType = function (arrPai) {
    for (var x = 10; x > 3; x--) {
        if (x === 6) {
            continue;
        }
        var TypePai0 = Compare.getTypePai(arrPai, x, false);
        var TypePai1 = Compare.getTypePai(arrPai, x, true);
        for (var m = 0; m < 2; m++) {
            if (m === 0) {
                var TypePai = TypePai0;
            } else if (m === 1) {
                var TypePai = TypePai1;
            }
            if (TypePai) {
                var arrTemp = Compare.getTH(arrPai, TypePai);
                if (arrTemp) {
                    return arrTemp;
                }
            }
        }
    }
    return null;
};
Compare.getTH = function (arrPai, TypePai) {
    //剩餘牌取同花
    var remainingPai = []; //剩下的牌
    for (var i = 0; i < arrPai.length; i++) {
        var b_same = false;
        for (var j = 0; j < TypePai.length; j++) {
            if (arrPai[i] === TypePai[j]) {
                delete TypePai[j];
                b_same = true;
                break;
            }
        }
        if (!b_same) {
            remainingPai.push(arrPai[i]);
        }
    }

    if (!remainingPai) {
        return null;
    }

    var len = remainingPai.length;
    var arrHeitao = [];
    var arrHongtao = [];
    var arrMeihua = [];
    var arrFangkuai = [];
    var arrResultPai = [];
    for (var i = 0; i < len; i++) {
        if (remainingPai[i].type === 1) {
            arrHeitao.push(remainingPai[i]);
        }
        if (remainingPai[i].type === 2) {
            arrHongtao.push(remainingPai[i]);
        }
        if (remainingPai[i].type === 0) {
            arrMeihua.push(remainingPai[i]);
        }
        if (remainingPai[i].type === 3) {
            arrFangkuai.push(remainingPai[i]);
        }
    }

    if (arrHeitao.length > 4) {
        for (var i = 0; i < arrHeitao.length - 4; i++) {
            var arrTemp = [];
            for (var j = 0; j < 5; j++) {
                arrTemp.push(arrHeitao[j + i]);
            }
            return arrTemp;
        }
    }
    if (arrHongtao.length > 4) {
        for (var i = 0; i < arrHongtao.length - 4; i++) {
            var arrTemp = [];
            for (var j = 0; j < 5; j++) {
                arrTemp.push(arrHongtao[j + i]);
            }
            return arrTemp;
        }
    }
    if (arrMeihua.length > 4) {
        for (var i = 0; i < arrMeihua.length - 4; i++) {
            var arrTemp = [];
            for (var j = 0; j < 5; j++) {
                arrTemp.push(arrMeihua[j + i]);
            }
            return arrTemp;
        }
    }
    if (arrFangkuai.length > 4) {
        for (var i = 0; i < arrFangkuai.length - 4; i++) {
            var arrTemp = [];
            for (var j = 0; j < 5; j++) {
                arrTemp.push(arrFangkuai[j + i]);
            }
            return arrTemp;
        }
    }
};

//葫芦
Compare.getHuLu = function (arrPai, bSame) {
    var arrResultPai = [];
    var analyseData = analysePai(arrPai);
    var arrTongPai = analyseData.arrTongPai;
    var Index = 0;
    var Total = 0;
    var arrHuLu = [];

    for (var i = 0; i < arrTongPai.length; i++) {
        if (arrTongPai[i].length === 3) {
            for (var j = 0; j < arrTongPai.length; j++) {
                if (i === j) {
                    continue;
                }
                arrHuLu.push(arrTongPai[i][0]);
                arrHuLu.push(arrTongPai[i][1]);
                arrHuLu.push(arrTongPai[i][2]);
                if (arrTongPai[j].length > 1) {
                    if (arrTongPai[j].length === 3) {
                        j++;
                        if (!arrTongPai[j]) {
                            j--;
                        }
                        if (i === j && arrTongPai[j + 1]) {
                            j++;
                        } else if (i === j && !arrTongPai[j + 1]) {
                            j--;
                        }
                    }
                    arrHuLu.push(arrTongPai[j][0]);
                    arrHuLu.push(arrTongPai[j][1]);
                    arrResultPai.push(arrHuLu);
                    Total++;
                }
                arrHuLu = [];
            }
        } else if (arrTongPai[i].length > 3) {
            //同牌大于3张 
            for (var j = 0; j < arrTongPai.length; j++) {
                if (i === j) {
                    continue;
                }
                var TongHuaPai = Compare.getTongHua(arrPai, false);
                arrHuLu.push(arrTongPai[i][0]);
                arrHuLu.push(arrTongPai[i][1]);
                arrHuLu.push(arrTongPai[i][2]);
                if (TongHuaPai) {
                    for (var m = 0; m < TongHuaPai.length; m++) {
                        for (var k = 0; k < arrHuLu.length; k++) {
                            if (TongHuaPai[m] === arrHuLu[k]) {
                                arrHuLu[k] = arrTongPai[i][3];
                            }
                        }
                    }
                }
                if (arrTongPai[j].length > 1) {
                    arrHuLu.push(arrTongPai[j][0]);
                    arrHuLu.push(arrTongPai[j][1]);
                    arrResultPai.push(arrHuLu);
                    Total++;
                }
                arrHuLu = [];
            }
        }
    }
    if (bSame) {
        Compare.Index++;
    } else {
        Compare.Index = 0;
    }
    if (Compare.b_obtainType) {
        //需要取其他类型
        Compare.b_obtainType = false;
        arrResultPai = Compare.HLAdjust(arrPai, arrResultPai);
        Compare.Index = 0;
    }
    Index = Compare.Index % Total;
    return arrResultPai[Index];
};
//葫芦调整位置
Compare.HLAdjust = function (arrPai, arrResultPai) {
    for (var x = 10; x > 3; x--) {
        if (x === 7) {
            continue;
        }
        for (var a = 0; a < arrResultPai.length; a++) {
            var remainingPai = []; // 去掉一个葫芦 剩下的牌
            for (var i = 0; i < arrPai.length; i++) {
                var b_same = false;
                for (var j = 0; j < arrResultPai[a].length; j++) {
                    if (arrPai[i] === arrResultPai[a][j]) {
                        b_same = true;
                        break;
                    }
                }
                if (!b_same) {
                    remainingPai.push(arrPai[i]);
                }
            }
            if (!remainingPai) {
                return null;
            }

            var TypePai0 = Compare.getTypePai(remainingPai, x, false);
            var TypePai1 = Compare.getTypePai(remainingPai, x, true);
            for (var P = 0; P < 2; P++) {
                if (P === 0) {
                    var TypePai = TypePai0;
                } else if (P === 1) {
                    var TypePai = TypePai1;
                }
                if (TypePai) {
                    var data = arrResultPai[0];
                    arrResultPai[0] = arrResultPai[a];
                    arrResultPai[a] = data;
                    return arrResultPai;
                }
            }
        }
    }
    return arrResultPai;
};

//葫芦去掉一个最大的其他类型 再取
Compare.HLdeleteType = function (arrPai) {
    for (var x = 10; x > 4; x--) {
        if (x === 7) {
            continue;
        }
        var TypePai0 = Compare.getTypePai(arrPai, x, false);
        var TypePai1 = Compare.getTypePai(arrPai, x, true);
        for (var P = 0; P < 2; P++) {
            if (P === 0) {
                var TypePai = TypePai0;
            } else if (P === 1) {
                var TypePai = TypePai1;
            }
            if (TypePai) {
                var remainingPai = []; //剩下的牌
                for (var i = 0; i < arrPai.length; i++) {
                    var b_same = false;
                    for (var j = 0; j < TypePai.length; j++) {
                        if (arrPai[i] === TypePai[j]) {
                            delete TypePai[j];
                            b_same = true;
                            break;
                        }
                    }
                    if (!b_same) {
                        remainingPai.push(arrPai[i]);
                    }
                }

                if (!remainingPai) {
                    return null;
                }

                var analyseData = analysePai(remainingPai);
                var arrTongPai = analyseData.arrTongPai;
                var Index = 0;
                var Total = 0;
                var arrHuLu = [];

                for (var i = 0; i < arrTongPai.length; i++) {
                    if (arrTongPai[i].length === 3) {
                        for (var j = 0; j < arrTongPai.length; j++) {
                            if (i === j) {
                                continue;
                            }
                            arrHuLu.push(arrTongPai[i][0]);
                            arrHuLu.push(arrTongPai[i][1]);
                            arrHuLu.push(arrTongPai[i][2]);
                            if (arrTongPai[j].length > 1) {
                                arrHuLu.push(arrTongPai[j][0]);
                                arrHuLu.push(arrTongPai[j][1]);
                                return arrHuLu;
                            }
                            arrHuLu = [];
                        }
                    } else if (arrTongPai[i].length > 3) {
                        //同牌大于3张 
                        for (var j = 0; j < arrTongPai.length; j++) {
                            if (i === j) {
                                continue;
                            }
                            var TongHuaPai = Compare.getTongHua(arrPai, false);
                            arrHuLu.push(arrTongPai[i][0]);
                            arrHuLu.push(arrTongPai[i][1]);
                            arrHuLu.push(arrTongPai[i][2]);
                            if (TongHuaPai) {
                                for (var m = 0; m < TongHuaPai.length; m++) {
                                    for (var k = 0; k < arrHuLu.length; k++) {
                                        if (TongHuaPai[m] === arrHuLu[k]) {
                                            arrHuLu[k] = arrTongPai[i][3];
                                        }
                                    }
                                }
                            }
                            if (arrTongPai[j].length > 1) {
                                arrHuLu.push(arrTongPai[j][0]);
                                arrHuLu.push(arrTongPai[j][1]);
                                return arrHuLu;
                            }
                            arrHuLu = [];
                        }
                    }
                }
            }
        }
    }

    return null;
};

//铁支
Compare.getTieZhi = function (arrPai, bSame) {
    var arrResultPai = [];
    if (Compare.b_obtainType) {
        //需要取其他类型
        Compare.b_obtainType = false;
        var arrTemp = [];
        arrTemp = Compare.TZdeleteType(arrPai);
        if (arrTemp) {
            arrResultPai.push(arrTemp);
            Total++;
        }
    }
    var analyseData = analysePai(arrPai);
    var arrTongPai = analyseData.arrTongPai;
    var Index = 0;
    var Total = 0;
    var arrTieZhi = [];
    for (var i = 0; i < arrTongPai.length; i++) {
        if (arrTongPai[i].length === 4) {
            arrTieZhi.push(arrTongPai[i][0]);
            arrTieZhi.push(arrTongPai[i][1]);
            arrTieZhi.push(arrTongPai[i][2]);
            arrTieZhi.push(arrTongPai[i][3]);
            arrResultPai.push(arrTieZhi);
            Total++;
            arrTieZhi = [];
        }
    }
    if (bSame) {
        Compare.Index++;
    } else {
        Compare.Index = 0;
    }
    Index = Compare.Index % Total;
    return arrResultPai[Index];
};
//铁支去掉一个最大的其他类型 再取
Compare.TZdeleteType = function (arrPai) {
    for (var x = 10; x > 3; x--) {
        if (x === 8) {
            continue;
        }
        var TypePai0 = Compare.getTypePai(arrPai, x, false);
        var TypePai1 = Compare.getTypePai(arrPai, x, true);
        for (var m = 0; m < 2; m++) {
            if (m === 0) {
                var TypePai = TypePai0;
            } else if (m === 1) {
                var TypePai = TypePai1;
            }
            if (TypePai) {
                var remainingPai = []; //剩下的牌
                for (var i = 0; i < arrPai.length; i++) {
                    var b_same = false;
                    for (var j = 0; j < TypePai.length; j++) {
                        if (arrPai[i] === TypePai[j]) {
                            delete TypePai[j];
                            b_same = true;
                            break;
                        }
                    }
                    if (!b_same) {
                        remainingPai.push(arrPai[i]);
                    }
                }

                if (!remainingPai) {
                    return null;
                }

                var analyseData = analysePai(remainingPai);
                var arrTongPai = analyseData.arrTongPai;
                var Index = 0;
                var Total = 0;
                var arrTieZhi = [];
                for (var i = 0; i < arrTongPai.length; i++) {
                    if (arrTongPai[i].length === 4) {
                        arrTieZhi.push(arrTongPai[i][0]);
                        arrTieZhi.push(arrTongPai[i][1]);
                        arrTieZhi.push(arrTongPai[i][2]);
                        arrTieZhi.push(arrTongPai[i][3]);
                        return arrTieZhi;
                    }
                }
            }
        }
    }

    return null;
};

//五同
Compare.getWuTong = function (arrPai, bSame) {
    var arrResultPai = [];
    if (Compare.b_obtainType) {
        //需要取其他类型
        Compare.b_obtainType = false;
        var arrTemp = [];
        arrTemp = Compare.WTdeleteType(arrPai);
        if (arrTemp) {
            arrResultPai.push(arrTemp);
            Total++;
        }
    }
    var analyseData = analysePai(arrPai);
    var arrTongPai = analyseData.arrTongPai;
    var Index = 0;
    var Total = 0;
    var arrWuTong = [];
    for (var i = 0; i < arrTongPai.length; i++) {
        if (arrTongPai[i].length === 5) {
            arrWuTong.push(arrTongPai[i][0]);
            arrWuTong.push(arrTongPai[i][1]);
            arrWuTong.push(arrTongPai[i][2]);
            arrWuTong.push(arrTongPai[i][3]);
            arrWuTong.push(arrTongPai[i][4]);
            arrResultPai.push(arrWuTong);
            Total++;
            arrWuTong = [];
        }
    }
    if (bSame) {
        Compare.Index++;
    } else {
        Compare.Index = 0;
    }
    Index = Compare.Index % Total;
    return arrResultPai[Index];
};
//五同去掉一个最大的其他类型 再取
Compare.WTdeleteType = function (arrPai) {
    for (var x = 10; x > 3; x--) {
        if (x === 10) {
            continue;
        }
        var TypePai0 = Compare.getTypePai(arrPai, x, false);
        var TypePai1 = Compare.getTypePai(arrPai, x, true);
        for (var m = 0; m < 2; m++) {
            if (m === 0) {
                var TypePai = TypePai0;
            } else if (m === 1) {
                var TypePai = TypePai1;
            }
            if (TypePai) {
                var remainingPai = []; //剩下的牌
                for (var i = 0; i < arrPai.length; i++) {
                    var b_same = false;
                    for (var j = 0; j < TypePai.length; j++) {
                        if (arrPai[i] === TypePai[j]) {
                            delete TypePai[j];
                            b_same = true;
                            break;
                        }
                    }
                    if (!b_same) {
                        remainingPai.push(arrPai[i]);
                    }
                }

                if (!remainingPai) {
                    return null;
                }

                var analyseData = analysePai(remainingPai);
                var arrTongPai = analyseData.arrTongPai;
                var Index = 0;
                var Total = 0;
                var arrWuTong = [];
                for (var i = 0; i < arrTongPai.length; i++) {
                    if (arrTongPai[i].length === 5) {
                        arrWuTong.push(arrTongPai[i][0]);
                        arrWuTong.push(arrTongPai[i][1]);
                        arrWuTong.push(arrTongPai[i][2]);
                        arrWuTong.push(arrTongPai[i][3]);
                        arrWuTong.push(arrTongPai[i][4]);
                        return arrWuTong;
                        arrWuTong = [];
                    }
                }
            }
        }
    }

    return null;
};

//获取牌类型
Compare.getType = function (arrPai) {
    arrPai.sort(function (a, b) {
        return b.value - a.value;
    });

    var arrResultType = [];
    var isSGCS = function isSGCS(tongPai) {
        var sanCount = 0;
        var siCount = 0;
        for (var i = 0; i < tongPai.length; i++) {
            if (tongPai[i].count === 3) {
                sanCount++;
            }
            if (siCount) {
                siCount++;
            }
            return sanCount === 3 && siCount === 1;
        }
    };
    var isSTST = function isSTST(tongPai) {
        for (var i = 0; i < tongPai.length; i++) {
            if (tongPai[i].count !== 3) {
                return false;
            }
        }
        return true;
    };
    var isSSZ = function isSSZ() {};

    var type = 0;
    var analyseData = analysePai(arrPai);
    var tongPai = analyseData.tongPai;
    var sanPai = analyseData.sanPai;
    var paiValue = analyseData.paiValue;
    var paiLen = arrPai.length;
    var tpLen = tongPai.length;
    var spLen = sanPai.length;

    if (Compare.getWuTong(arrPai, false)) {
        type = PaiType.WT;
        arrResultType.push(PaiType.WT);
    }
    if (Compare.getShunZi(arrPai, false, true)) {
        type = PaiType.THS;
        arrResultType.push(PaiType.THS);
    }
    if (Compare.getTieZhi(arrPai, false)) {
        type = PaiType.TZ;
        arrResultType.push(PaiType.TZ);
    }
    if (Compare.getHuLu(arrPai, false)) {
        type = PaiType.HL;
        arrResultType.push(PaiType.HL);
    }
    if (Compare.getTongHua(arrPai, false)) {
        type = PaiType.TH;
        arrResultType.push(PaiType.TH);
    }
    if (Compare.getShunZi(arrPai, false, false)) {
        type = PaiType.SZ;
        arrResultType.push(PaiType.SZ);
    }

    if (Compare.getSanTiao(arrPai, false)) {
        type = PaiType.ST;
        arrResultType.push(PaiType.ST);
    }

    if (analyseData.tongPai.length > 1) {
        type = PaiType.ED;
        arrResultType.push(PaiType.ED);
    }
    if (analyseData.tongPai.length > 0) {
        type = PaiType.YD;
        arrResultType.push(PaiType.YD);
    } else {
        type = PaiType.WL;
        arrResultType.push(PaiType.WL);
    }
    return arrResultType;
};
//
var analysePai = function analysePai(arrPai) {
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
    console.log('arrPai.lenght : ' + len);
    for (var i = 0; i < len; ++i) {
        if (i >= len - 1) {
            if (count > 1) {
                var tongPaiTmp = {};
                tongPaiTmp.value = arrPai[index].value;
                tongPaiTmp.count = count;
                data.tongPai.push(tongPaiTmp);
            }
            break;
        }
        var Atype = _typeof(arrPai[index]);
        if (typeof arrPai[index] == 'undefind') {
            console.log('i : ' + i);
        }

        console.log('value : ' + arrPai[index].value);
        console.log('i : ' + i);
        if (arrPai[index].value === arrPai[i + 1].value) {
            ++count;
        } else {
            if (count > 1) {
                var tongPaiTmp = {};
                tongPaiTmp.value = arrPai[index].value;
                tongPaiTmp.count = count;
                data.tongPai.push(tongPaiTmp);
            }
            index = i + 1;
            count = 1;
        }
    }

    //同牌数据
    var tLen = data.tongPai.length;
    for (var i = 0; i < tLen; i++) {
        for (var j = 0; j < len; j++) {
            if (arrPai[j].value === data.tongPai[i].value) {
                arrTemp.push(arrPai[j]);
            }
        }
        if (arrTemp.length > 0) {
            data.arrTongPai.push(arrTemp);
            arrTemp = [];
        }
    }
    //散牌
    for (var i = 0; i < len; ++i) {
        var tLen = data.tongPai.length;
        var bTongPai = false;
        for (var j = 0; j < tLen; ++j) {
            if (arrPai[i].value === data.tongPai[j].value) {
                bTongPai = true;
                break;
            }
        }
        if (!bTongPai) {
            data.sanPai.push(arrPai[i]);
        }
    }

    //所有的牌值
    for (var i = 0; i < len; i++) {
        var bExist = false; //判断是否存在
        for (var j = 0; j < data.paiValue.length; j++) {
            if (data.paiValue[j].value === arrPai[i].value) {
                bExist = true;
            }
        }
        if (!bExist) {
            data.paiValue.push(arrPai[i]);
        }
    }

    return data;
};

//同类型比较大小
Compare.compareSameType = function (arrPai1, arrPai2, type) {
    if (type === 6) {
        //同花单独处理
        for (var _i6 = 0; _i6 < arrPai1.length; _i6++) {
            if (arrPai1[_i6].value > arrPai2[_i6].value) {
                return 1;
            } else if (arrPai1[_i6].value < arrPai2[_i6].value) {
                return -1;
            }
        }
        return 0;
    }
    var analyseData1 = analysePai(arrPai1);
    var analyseData2 = analysePai(arrPai2);
    var tpInfo1 = analyseData1.tongPai;
    var tpInfo2 = analyseData2.tongPai;
    tpInfo1.sort(function (a, b) {
        return b.count - a.count;
    });
    tpInfo2.sort(function (a, b) {
        return b.count - a.count;
    });
    var sanPai1 = analyseData1.sanPai;
    var sanPai2 = analyseData2.sanPai;
    var resultValue = 0;
    var tpLen1 = tpInfo1.length;
    var tpLen2 = tpInfo2.length;
    if (tpLen1 === tpLen2) {
        for (var i = 0; i < tpLen1; i++) {
            resultValue = comparDX(tpInfo1[i].value, tpInfo2[i].value);
            if (0 !== resultValue) {
                return resultValue;
            }
        }
    }

    var spLen1 = sanPai1.length;
    var spLen2 = sanPai2.length;
    if (spLen1 === spLen2) {
        for (var i = 0; i < spLen1; i++) {
            resultValue = comparDX(sanPai1[i].value, sanPai2[i].value);
            if (0 !== resultValue) {
                return resultValue;
            }
        }
    }
    return 0;
};

var comparDX = function comparDX(value1, value2) {
    if (value1 > value2) {
        return 1;
    } else if (value1 === value2) {
        return 0;
    } else {
        return -1;
    }
};
module.exports = Compare;

cc._RF.pop();