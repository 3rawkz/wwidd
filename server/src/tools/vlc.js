////////////////////////////////////////////////////////////////////////////////
// VLC Video Playback Tool
////////////////////////////////////////////////////////////////////////////////
/*global require, exports */
var	tool = require('../tools/tool').tool,

vlc = function () {
	// inheriting from tool
	var self = Object.create(tool, {executable: {value: 'vlc'}});
			
	self.exec = function (path, handler) {
		tool.exec.call(self, ['-vvv', path], handler);
		return self;
	};
	
	return self;
}();

exports.vlc = vlc;

