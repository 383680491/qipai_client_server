var Emitter = require('../utils/emitter');

var emitterObj = null;
module.exports.getEmitter = function(){
	if (!emitterObj) {
		emitterObj = new Emitter();
	}
	return emitterObj;
}