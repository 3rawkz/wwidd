////////////////////////////////////////////////////////////////////////////////
// Background Processes
//
// Singleton that batches background processes such as metadata extraction,
// snapshot extraction, etc. together.
////////////////////////////////////////////////////////////////////////////////
/*global require, exports */
var	chain = require('../utils/chain').chain,
		ffmpeg = require('../tools/ffmpeg').ffmpeg,

processes = {
	// callback expects a path where the root part
	// and relative part are separated by colon
	// - path: e.g. "/media/HDD:/videos"
	// - finish: callback for each element in process chain 
	extractor: chain(function (path, finish) {
		var tmp = path.split(':'),
				root = tmp[0],
				relative = tmp[1];

		// extracting metadata from file w/ ffmpeg
		ffmpeg.metadata(root + relative, function (data) {
			// filtering out useful metadata
			var keywords = {},
					key, value,
					
			lookup = {
				'duration': 'Duration',
				'dimensions': 'dimensions',
				'distributor': 'WM/ContentDistributor',
				'copyright': 'copyright',
				'bitrate': 'bitrate',
				'video codec': 'video codec',
				'audio codec': 'audio codec',
				'genre': 'WM/Genre',
				'adult': 'WM/ParentalRating'
			};
			
			for (key in lookup) {
				if (lookup.hasOwnProperty(key)) {
					value = data[lookup[key]];
					if (typeof value !== 'undefined' && value.length) {
						keywords[key] = data[lookup[key]];
					}
				}
			}
			
			finish({path: relative, keywords: keywords});
		});
	})
};

exports.processes = processes;

