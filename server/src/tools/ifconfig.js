////////////////////////////////////////////////////////////////////////////////
// IP Config
////////////////////////////////////////////////////////////////////////////////
/*global require, exports, console */
var	system = require('../utils/system').system,
		parser = require('../utils/parser').parser,
		tool = require('../tools/tool').tool,

ifconfig = function () {
	var LOOPBACK = '127.0.0.1',
	
	executable = {'cygwin': 'ipconfig', 'windows': 'ipconfig'}[system.os] || 'ifconfig',
	
	outputParser = Object.create(parser, {
		rowSeparator: {value: new RegExp(tool.lineBreak + tool.lineBreak + '\\s*')},
		fieldSeparator: {value: new RegExp('[' + tool.lineBreak + '\\s]{2,}')},
		keySeparator: {value: new RegExp('[\\s.]*:\\s*')},
		keyLength: {value: {'cygwin': 2, 'windows': 2}[system.os] || 0}
	}),
	
	self = Object.create(tool, {
		executable: {value: executable},
		binary: {value: true},
		parser: {value: outputParser}
	});

	self.exec = function (handler) {
		tool.exec.call(self, null, function (code, data) {
			var result = LOOPBACK,
					i, ip;

			// acquiring IP address
			if (code === 0) {
				for (i = 0; i < data.length; i++) {
					ip = data[i]['inet addr'] || data[i]['IP'];
					if (typeof ip !== 'undefined' &&
							ip !== LOOPBACK) {
						result = ip;
					}
				}
				console.log("IFCONFIG - detected IP: " + result);
			} else {
				console.log("IFCONFIG - ifconfig failed, using loopback IP");
			}
			
			if (handler) {
				handler(result);
			}
		}, true);

		return self;
	};
	
	return self;
}();

exports.ifconfig = ifconfig;

