var configs = require(process.argv[2]);

var sqlClient = require('../DB/sqlClient');
sqlClient.init(configs.mysql());

//

var config = configs.account_server();
var as = require('./account_server');
as.start(config);

var dapi = require('./dealer_api');
dapi.start(config);