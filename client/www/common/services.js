////////////////////////////////////////////////////////////////////////////////
// Web Services
////////////////////////////////////////////////////////////////////////////////
/*global jQuery, alert, window */
var yalp = yalp || {};

yalp.services = function ($, window) {
	var url = 'http://127.0.0.1:8124/';
	
	// calls the service
	function callService(endpoint, data, handler) {
		$.ajax(url + endpoint, {
			data: data,
			dataType: 'json',
			success: handler,
			error: function (xhr) {
				var data = $.parseJSON(xhr.responseText);
				alert([
					"Service call failed. Details:",
					"endpoint: \"" + endpoint + "\"",
					"message: \"" + data.message + "\""
				].join('\n'));
			}
		});
	}
	
	// calls a unary tag transformation service
	function unary(endpoint, mediaid, tag, filter, mediaids, handler) {
		var data = {
			tag: tag
		};
		if (filter) {
			data.filter = filter;
		}
		if (typeof mediaid !== 'undefined' && mediaid !== null) {
			data.mediaid = mediaid;
		}
		if (mediaids) {
			data.mediaids = mediaids;
		}
		callService(endpoint, data, handler);
	}
	
	return {
		// adds a root path to library (w/ import)
		addroot: function (path, handler) {
			callService('addroot', {
				path: path
			}, handler);
		},
		
		// retrieves a list of available libraries
		getlibs: function (handler) {
			callService('getlibs', null, handler);
		},
		
		// retrieves a list of available libraries
		setlib: function (name, handler) {
			callService('setlib', {
				name: name
			}, handler);
		},
		
		// retrieves all media (matching the filter) from library
		getmedia: function (filter, handler) {
			callService('getmedia', {
				filter: filter
			}, handler);
		},
		
		// retrieves all tags from library
		gettags: function (handler) {
			callService('gettags', null, handler);
		},
		
		// starts playback of a file
		play: function (mediaid, handler) {
			callService('play', {
				mediaid: mediaid
			}, handler);
		},
		
		// rates a file
		rate: function (mediaid, rating, handler) {
			callService('rate', {
				mediaid: mediaid,
				at: rating
			}, handler);
		},
		
		// adds tag to a file
		addtag: function (mediaid, tag, filter, mediaids, handler) {
			unary('addtag', mediaid, tag, filter, mediaids, handler);			
		},

		// changes tag on a file
		changetag: function (mediaid, before, after, handler) {
			var data = {
				before: before,
				after: after
			};
			if (mediaid) {
				data.mediaid = mediaid;
			}
			callService('changetag', data, handler);
		},
		
		// explodes tag(s)
		explodetag: function (mediaid, tag, filter, mediaids, handler) {
			unary('explodetag', mediaid, tag, filter, mediaids, handler);			
		},
		
		// deletes tag(s)
		deltag: function (mediaid, tag, filter, mediaids, handler) {
			unary('deltag', mediaid, tag, filter, mediaids, handler);
		},
		
		// gets directory tree for given root path(s)
		// - root: unix absolute path(s separadted by commas) without leading slash
		getdirs: function (root, handler) {
			var data = {};
			if (root) {
				data.root = root;
			}
			callService('getdirs', data, handler);
		},
		
		// polls a background process
		// - process: name of process
		// - handler: handler to call on each poll
		poll: function (process, handler) {
			var delay = 1000;		// delay between polls
			function next() {
				callService('poll', {
					process: process
				}, function (json) {
					var progress = json.data;
					
					// calling handler
					if (handler) {
						handler(progress);
					}
					
					// initiating next poll
					if (progress !== -1 && progress !== false) {
						window.setTimeout(next, delay);
					}
				});
			}
			next();
		}
	};
}(jQuery,
	window);
