////////////////////////////////////////////////////////////////////////////////
// Video Library - Business Logic
//
// Interface for adding library root paths and ingesting their content
////////////////////////////////////////////////////////////////////////////////
/*global require, exports, console */
var	vlc = require('../tools/vlc').vlc,
		entity = require('../db/media').media,

media = function (path) {
	var self = {
		// queries media information
		get: function (filter, handler) {
			entity(path).get(filter, handler);
		},
		
		// plays back a video
		play: function (handler) {
			console.log("MEDIA - starting playback of file: " + path);
			vlc.exec('vlc', ['-vvv', path], function (path) {
				console.log("MEDIA - playback finished or interrupted");
			});
			// not waiting for playback to finish
			if (handler) {
				handler(path);
			}
			return self;
		},
		
		rate: function (rating, handler) {
			console.log("MEDIA - rating file: " + path + " at: " + rating);
			entity(path).set(null, {rating: rating}, handler);
			return self;
		}
	};
	
	return self;
};

// exports
exports.media = media;

