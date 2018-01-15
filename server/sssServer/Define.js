var DEFINE = {};
DEFINE.PaiType = {
	NONE:0,
	WL:1,//乌龙
	YD:2,//1对
	ED:3,//2对
	ST:4,//三条
	SZ:5,//顺子
	TH:6,//同花
	HL:7,//葫芦
	TZ:8,//铁支
	THS:9,//同花顺
	WT:10,//五同
	//特殊牌
	STH:11,//三同花
	SSZ:12,//三顺子
	LDB:13,//六对半
	WDST:14,//五对三条
	STST:15,//四套三条
	SGCS:16,//双怪冲三
	QX:17,//全小
	QD:18,//全大
	CYS:19,//凑一色
	SFTX:20,//三套炸弹、三分天下
	STHS:21,//三同花顺
	SEHZ:22,//十二皇族
	YTL:23,//一条龙
	ZZQL:24,//至尊清龙
	TZP:25,//铁子牌
	THSBD:26,//同花顺报道
	WTZ:27//五同钻
};

DEFINE.GameState = {
	GAME_PREPARE:0,
	GAME_START:1,
	GAME_OVER:2,
	GAME_COMPARE:3,
};

DEFINE.GAME_TYPE = {
	GAME_NORMAL:0,
	GAME_BWZ:1,
	GAME_BB:2,
	GAME_MP:3,
};

module.exports = DEFINE;