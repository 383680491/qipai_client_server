/*
Navicat MySQL Data Transfer

Source Server         : 127.0.0.1
Source Server Version : 50553
Source Host           : 127.0.0.1:3306
Source Database       : mj

Target Server Type    : MYSQL
Target Server Version : 50553
File Encoding         : 65001

Date: 2017-06-02 10:34:39
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for t_accounts
-- ----------------------------
DROP TABLE IF EXISTS `t_accounts`;
CREATE TABLE `t_accounts` (
  `account` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  PRIMARY KEY (`account`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of t_accounts
-- ----------------------------

-- ----------------------------
-- Table structure for t_games
-- ----------------------------
DROP TABLE IF EXISTS `t_games`;
CREATE TABLE `t_games` (
  `room_uuid` char(20) NOT NULL,
  `game_index` smallint(6) NOT NULL,
  `base_info` varchar(1024) NOT NULL,
  `create_time` int(11) NOT NULL,
  `snapshots` char(255) DEFAULT NULL,
  `action_records` varchar(2048) DEFAULT NULL,
  `result` char(255) DEFAULT NULL,
  PRIMARY KEY (`room_uuid`,`game_index`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of t_games
-- ----------------------------

-- ----------------------------
-- Table structure for t_games_archive
-- ----------------------------
DROP TABLE IF EXISTS `t_games_archive`;
CREATE TABLE `t_games_archive` (
  `room_uuid` char(20) NOT NULL,
  `game_index` smallint(6) NOT NULL,
  `base_info` varchar(1024) NOT NULL,
  `create_time` int(11) NOT NULL,
  `snapshots` char(255) DEFAULT NULL,
  `action_records` varchar(2048) DEFAULT NULL,
  `result` char(255) DEFAULT NULL,
  PRIMARY KEY (`room_uuid`,`game_index`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of t_games_archive
-- ----------------------------

-- ----------------------------
-- Table structure for t_guests
-- ----------------------------
DROP TABLE IF EXISTS `t_guests`;
CREATE TABLE `t_guests` (
  `guest_account` varchar(255) NOT NULL,
  PRIMARY KEY (`guest_account`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of t_guests
-- ----------------------------

-- ----------------------------
-- Table structure for t_message
-- ----------------------------
DROP TABLE IF EXISTS `t_message`;
CREATE TABLE `t_message` (
  `type` varchar(32) NOT NULL,
  `msg` varchar(1024) NOT NULL,
  `version` varchar(32) NOT NULL,
  PRIMARY KEY (`type`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of t_message
-- ----------------------------
INSERT INTO `t_message` VALUES ('notice', '奇点游戏，卓越品质，值得信赖', '20161128');
INSERT INTO `t_message` VALUES ('fkgm', '奇点游戏，卓越品质，值得信赖', '20161128');
INSERT INTO `t_message` VALUES ('control', '0', '20161128');
-- ----------------------------
-- Table structure for t_rooms
-- ----------------------------
DROP TABLE IF EXISTS `t_rooms`;
CREATE TABLE `t_rooms` (
  `uuid` char(20) NOT NULL,
  `id` char(8) NOT NULL,
  `base_info` varchar(256) NOT NULL DEFAULT '0',
  `create_time` int(11) NOT NULL,
  `num_of_turns` int(11) NOT NULL DEFAULT '0',
  `next_button` int(11) NOT NULL DEFAULT '0',
  `user_id0` int(11) NOT NULL DEFAULT '0',
  `user_icon0` varchar(128) NOT NULL DEFAULT '',
  `user_name0` varchar(32) NOT NULL DEFAULT '',
  `user_score0` int(11) NOT NULL DEFAULT '0',
  `user_id1` int(11) NOT NULL DEFAULT '0',
  `user_icon1` varchar(128) NOT NULL DEFAULT '',
  `user_name1` varchar(32) NOT NULL DEFAULT '',
  `user_score1` int(11) NOT NULL DEFAULT '0',
  `user_id2` int(11) NOT NULL DEFAULT '0',
  `user_icon2` varchar(128) NOT NULL DEFAULT '',
  `user_name2` varchar(32) NOT NULL DEFAULT '',
  `user_score2` int(11) NOT NULL DEFAULT '0',
  `user_id3` int(11) NOT NULL DEFAULT '0',
  `user_icon3` varchar(128) NOT NULL DEFAULT '',
  `user_name3` varchar(32) NOT NULL DEFAULT '',
  `user_score3` int(11) NOT NULL DEFAULT '0',
  `ip` varchar(16) DEFAULT NULL,
  `port` int(11) DEFAULT '0',
  PRIMARY KEY (`uuid`),
  UNIQUE KEY `uuid` (`uuid`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of t_rooms
-- ----------------------------
INSERT INTO `t_rooms` VALUES ('1490875578938526035', '526035', '{\"type\":\"xzdd\",\"baseScore\":1,\"zimo\":0,\"jiangdui\":false,\"hsz\":false,\"dianganghua\":0,\"menqing\":false,\"tiandihu\":false,\"maxFan\":4,\"maxGames\":4,\"creator\":9}', '1490875579', '0', '0', '9', '', '5aSP5L6v6LWM5L6g', '0', '10', '', '55qH55Sr56iz6LWi', '0', '11', '', '5Lic5pa56ZuA5Zyj', '0', '12', '', '5qyn6Ziz6Ieq5pG4', '0', '127.0.0.1', '10000');
INSERT INTO `t_rooms` VALUES ('1494701633614709787', '709787', '{\"type\":\"xzdd\",\"baseScore\":1,\"zimo\":0,\"jiangdui\":false,\"hsz\":false,\"dianganghua\":0,\"menqing\":false,\"tiandihu\":false,\"maxFan\":4,\"maxGames\":4,\"creator\":20}', '1494701634', '0', '0', '20', '', '54us5a2k5aW96L+Q', '0', '26', '', '55qH55Sr5aW96L+Q', '0', '0', '', '', '0', '0', '', '', '0', '127.0.0.1', '10000');
INSERT INTO `t_rooms` VALUES ('1494780761015401357', '401357', '{\"type\":\"xzdd\",\"baseScore\":1,\"zimo\":0,\"jiangdui\":false,\"hsz\":false,\"dianganghua\":0,\"menqing\":false,\"tiandihu\":false,\"maxFan\":4,\"maxGames\":4,\"creator\":21}', '1494780761', '0', '0', '21', '', '5a2Q6L2m5aW96L+Q', '0', '0', '', '', '0', '0', '', '', '0', '0', '', '', '0', '127.0.0.1', '10000');
INSERT INTO `t_rooms` VALUES ('1495078285382931808', '931808', '{\"type\":\"xzdd\",\"baseScore\":1,\"zimo\":0,\"jiangdui\":false,\"hsz\":false,\"dianganghua\":0,\"menqing\":false,\"tiandihu\":false,\"maxFan\":4,\"maxGames\":4,\"creator\":15}', '1495078261', '0', '0', '15', '', '5Y+46ams5aW96L+Q', '0', '0', '', '', '0', '0', '', '', '0', '0', '', '', '0', '127.0.0.1', '10000');
INSERT INTO `t_rooms` VALUES ('1495090333362351700', '351700', '{\"type\":\"xzdd\",\"baseScore\":1,\"zimo\":0,\"jiangdui\":false,\"hsz\":false,\"dianganghua\":0,\"menqing\":false,\"tiandihu\":false,\"maxFan\":4,\"maxGames\":4,\"creator\":26}', '1495090334', '0', '0', '0', '', '', '0', '0', '', '', '0', '0', '', '', '0', '0', '', '', '0', '127.0.0.1', '10000');
INSERT INTO `t_rooms` VALUES ('1495090417110621141', '621141', '{\"type\":\"xzdd\",\"baseScore\":1,\"zimo\":0,\"jiangdui\":false,\"hsz\":false,\"dianganghua\":0,\"menqing\":false,\"tiandihu\":false,\"maxFan\":4,\"maxGames\":4,\"creator\":26}', '1495090418', '0', '0', '0', '', '', '0', '0', '', '', '0', '0', '', '', '0', '0', '', '', '0', '127.0.0.1', '10000');
INSERT INTO `t_rooms` VALUES ('1495090764134287116', '287116', '{\"type\":\"xzdd\",\"baseScore\":1,\"zimo\":0,\"jiangdui\":false,\"hsz\":false,\"dianganghua\":0,\"menqing\":false,\"tiandihu\":false,\"maxFan\":4,\"maxGames\":4,\"creator\":26}', '1495090765', '0', '0', '0', '', '', '0', '0', '', '', '0', '0', '', '', '0', '0', '', '', '0', '127.0.0.1', '10000');
INSERT INTO `t_rooms` VALUES ('1495090780542152805', '152805', '{\"type\":\"xzdd\",\"baseScore\":1,\"zimo\":0,\"jiangdui\":false,\"hsz\":false,\"dianganghua\":0,\"menqing\":false,\"tiandihu\":false,\"maxFan\":4,\"maxGames\":4,\"creator\":26}', '1495090781', '0', '0', '0', '', '', '0', '0', '', '', '0', '0', '', '', '0', '0', '', '', '0', '127.0.0.1', '10000');
INSERT INTO `t_rooms` VALUES ('1495090878861552233', '552233', '{\"type\":\"xzdd\",\"baseScore\":1,\"zimo\":0,\"jiangdui\":false,\"hsz\":false,\"dianganghua\":0,\"menqing\":false,\"tiandihu\":false,\"maxFan\":4,\"maxGames\":4,\"creator\":26}', '1495090879', '0', '0', '0', '', '', '0', '0', '', '', '0', '0', '', '', '0', '0', '', '', '0', '127.0.0.1', '10000');
INSERT INTO `t_rooms` VALUES ('1495090979817983100', '983100', '{\"type\":\"xzdd\",\"baseScore\":1,\"zimo\":0,\"jiangdui\":false,\"hsz\":false,\"dianganghua\":0,\"menqing\":false,\"tiandihu\":false,\"maxFan\":4,\"maxGames\":4,\"creator\":26}', '1495090980', '0', '0', '0', '', '', '0', '0', '', '', '0', '0', '', '', '0', '0', '', '', '0', '127.0.0.1', '10000');
INSERT INTO `t_rooms` VALUES ('1495208901044394129', '394129', '{\"type\":\"xzdd\",\"baseScore\":1,\"zimo\":0,\"jiangdui\":false,\"hsz\":false,\"dianganghua\":0,\"menqing\":false,\"tiandihu\":false,\"maxFan\":4,\"maxGames\":4,\"creator\":26}', '1495208902', '0', '0', '26', '', '55qH55Sr5aW96L+Q', '0', '19', '', '5qyn6Ziz6LWM5Zyj', '0', '27', '', '5Lic6YOt6LWM5L6g', '0', '24', '', '55qH55Sr6Ieq5pG4', '0', '127.0.0.1', '10000');
INSERT INTO `t_rooms` VALUES ('1495729704053194021', '194021', '{\"type\":\"xzdd\",\"baseScore\":1,\"zimo\":0,\"jiangdui\":false,\"hsz\":false,\"dianganghua\":0,\"menqing\":false,\"tiandihu\":false,\"maxFan\":4,\"maxGames\":4,\"creator\":28}', '1495729705', '0', '0', '28', '', '6ZW/5a2Z5pyJ6ZKx', '0', '0', '', '', '0', '0', '', '', '0', '0', '', '', '0', '127.0.0.1', '10000');
INSERT INTO `t_rooms` VALUES ('1496248876293191286', '191286', '{\"type\":\"xlch\",\"baseScore\":1,\"zimo\":0,\"jiangdui\":false,\"hsz\":false,\"dianganghua\":0,\"menqing\":false,\"tiandihu\":false,\"maxFan\":4,\"maxGames\":4,\"creator\":28}', '1496248877', '0', '0', '28', '', '6ZW/5a2Z5pyJ6ZKx', '0', '0', '', '', '0', '0', '', '', '0', '0', '', '', '0', '127.0.0.1', '10000');

-- ----------------------------
-- Table structure for t_sss_rooms
-- ----------------------------
DROP TABLE IF EXISTS `t_sss_rooms`;
CREATE TABLE `t_sss_rooms` (
  `uuid` char(20) NOT NULL,
  `id` char(8) NOT NULL,
  `base_info` varchar(256) NOT NULL DEFAULT '0',
  `create_time` int(11) NOT NULL,
  `num_of_turns` int(11) NOT NULL DEFAULT '0',
  `next_button` int(11) NOT NULL DEFAULT '0',
  `user_id0` int(11) NOT NULL DEFAULT '0',
  `user_icon0` varchar(128) NOT NULL DEFAULT '',
  `user_name0` varchar(32) NOT NULL DEFAULT '',
  `user_score0` int(11) NOT NULL DEFAULT '0',
  `user_id1` int(11) NOT NULL DEFAULT '0',
  `user_icon1` varchar(128) NOT NULL DEFAULT '',
  `user_name1` varchar(32) NOT NULL DEFAULT '',
  `user_score1` int(11) NOT NULL DEFAULT '0',
  `user_id2` int(11) NOT NULL DEFAULT '0',
  `user_icon2` varchar(128) NOT NULL DEFAULT '',
  `user_name2` varchar(32) NOT NULL DEFAULT '',
  `user_score2` int(11) NOT NULL DEFAULT '0',
  `user_id3` int(11) NOT NULL DEFAULT '0',
  `user_icon3` varchar(128) NOT NULL DEFAULT '',
  `user_name3` varchar(32) NOT NULL DEFAULT '',
  `user_score3` int(11) NOT NULL DEFAULT '0',
  `ip` varchar(16) DEFAULT NULL,
  `port` int(11) DEFAULT '0',
  PRIMARY KEY (`uuid`),
  UNIQUE KEY `uuid` (`uuid`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of t_sss_rooms
-- ----------------------------

-- ----------------------------
-- Table structure for t_users
-- ----------------------------
DROP TABLE IF EXISTS `t_users`;
CREATE TABLE `t_users` (
  `userid` int(11) unsigned NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `account` varchar(64) NOT NULL DEFAULT '' COMMENT '账号',
  `name` varchar(32) DEFAULT NULL COMMENT '用户昵称',
  `sex` int(1) DEFAULT NULL,
  `headimg` varchar(256) DEFAULT NULL,
  `lv` smallint(6) DEFAULT '1' COMMENT '用户等级',
  `exp` int(11) DEFAULT '0' COMMENT '用户经验',
  `coins` int(11) DEFAULT '0' COMMENT '用户金币',
  `gems` int(11) DEFAULT '0' COMMENT '用户宝石',
  `roomid` varchar(8) DEFAULT NULL,
  `history` varchar(4096) NOT NULL DEFAULT '',
  PRIMARY KEY (`userid`),
  UNIQUE KEY `account` (`account`)
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of t_users
-- ----------------------------
INSERT INTO `t_users` VALUES ('13', 'guest_1494407029678', '6L2p6L6V56iz6LWi', '0', null, '1', '0', '1000', '21', null, '');
INSERT INTO `t_users` VALUES ('14', 'guest_1494438134227', '6K+46JGb5aW96L+Q', '0', null, '1', '0', '1000', '21', null, '');
INSERT INTO `t_users` VALUES ('16', 'guest_lyd?', '5a2Q6L2m5pyJ6ZKx', '0', null, '1', '0', '1000', '21', null, '');
INSERT INTO `t_users` VALUES ('17', 'guest_lyd1?', '5LiK5a6Y56iz6LWi', '0', null, '1', '0', '1000', '21', null, '');
INSERT INTO `t_users` VALUES ('18', 'guest_lyd2?', '6ZW/5a2Z56iz6LWi', '0', null, '1', '0', '1000', '21', '236968', '');
INSERT INTO `t_users` VALUES ('22', 'guest_1494836814054', '6L2p6L6V6ZuA5Zyj', '0', null, '1', '0', '1000', '21', null, '');
INSERT INTO `t_users` VALUES ('23', 'guest_hbbb?', '5Lic6YOt6LWM5L6g', '0', null, '1', '0', '1000', '21', null, '');
INSERT INTO `t_users` VALUES ('25', 'guest_ly555?', '5Lic5pa556iz6LWi', '0', null, '1', '0', '1000', '21', null, '');
INSERT INTO `t_users` VALUES ('28', 'guest_1494440479188', '6ZW/5a2Z5pyJ6ZKx', '0', null, '1', '0', '1000', '21', '191286', '');
INSERT INTO `t_users` VALUES ('29', 'guest_lyd5?', '5a2Q6L2m56iz6LWi', '0', null, '1', '0', '1000', '21', '257203', '');
INSERT INTO `t_users` VALUES ('30', 'guest_lyd7?', '5LiK5a6Y5aW96L+Q', '0', null, '1', '0', '1000', '21', '257203', '');
INSERT INTO `t_users` VALUES ('31', 'guest_hb?', '5Lic6YOt56iz6LWi', '0', null, '1', '0', '1000', '21', '256106', '');
INSERT INTO `t_users` VALUES ('32', 'guest_lyd2', '5Lic5pa56LWM5L6g', '0', null, '1', '0', '1000', '21', '205631', '');
INSERT INTO `t_users` VALUES ('33', 'guest_hb', '5Lic5pa56ZuA5Zyj', '0', null, '1', '0', '1000', '21', '257203', '');
INSERT INTO `t_users` VALUES ('34', 'guest_lyd3', '5Y+46ams6LWM5Zyj', '0', null, '1', '0', '1000', '21', null, '');
INSERT INTO `t_users` VALUES ('35', 'guest_lyd8?', '6K+46JGb6LWM5Zyj', '0', null, '1', '0', '1000', '21', '218961', '');
