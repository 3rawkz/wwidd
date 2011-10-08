////////////////////////////////////////////////////////////////////////////////
// Media Data
////////////////////////////////////////////////////////////////////////////////
/*global jOrder, flock, escape */
var app = app || {};

app.data = function (data, jOrder, flock, services) {
	// initializing cache
	data.cache = data.cache || flock();
	
	// checks whether an object has any properties
	function isEmpty(obj) {
		var key;
		for (key in obj) {
			if (obj.hasOwnProperty(key)) {
				return false;
			}
		}
		return true;
	}
	
	// extracts filename from path
	function splitPath(path) {
		var bits = path.split('/');
		return {
			file: bits.pop()
		};
	}
	
	// preprocesses video metadata
	function preprocess(json) {
		var i, row, fileInfo;
		for (i = 0; i < json.length; i++) {
			row = json[i];
			fileInfo = splitPath(row.path);
			row.file = fileInfo.file;
			row.file_ = fileInfo.file.toLowerCase();
			row.ext = fileInfo.ext;
		}
		return json;
	}
	
	data.media = function () {
		var self = {
			table: null,

			// initializes data object: calls service, populates table
			init: function (filter, handler) {
				handler = handler || function () {};
				services.media.get(filter, function (json) {
					json = preprocess(json.data);
					
					var cache = data.cache,
							i, row,
							j, tag,
							tags;
					
					// setting up datastore roots
					cache.set('tag', {});
					cache.set('media', {});
					cache.set('keyword', {});
					cache.set('kind', {});
					cache.set('name', {});
					cache.set('rating', {});
					cache.set('field', {});
					
					// loading media data into cache
					for (i = 0; i < json.length; i++) {
						row = json[i];		// quick reference
						tags = row.tags;	// backup of flat tags
						row.tags = {};		// tags field will be rewritten
						
						// storing media node in cache
						cache.set(['media', row.mediaid], row);
						
						// setting properties
						self.setRating(row.mediaid, row.rating);
						for (j = 0; j < tags.length; j++) {
							self.addTag(row.mediaid, tags[j]);
						}
					}
					
					// setting up jOrder table
					self.table = jOrder(preprocess(json))
						.index('mediaid', ['mediaid'], {ordered: true, type: jOrder.number})
						.index('file', ['file_'], {ordered: true, grouped: true, type: jOrder.string});
						
					handler();
				});
				return self;
			},

			// retrieves a reference to the data associated with a media entry
			getRow: function (mediaid) {
				return data.cache.get(['media', mediaid]) || {};
			},
			
			// adds a tag to media entry
			addTag: function (mediaid, tag) {
				var cache = data.cache,
						ref = cache.get(['tag', tag]),
						tmp;

				if (cache.get(['media', mediaid, 'tags', tag]) !== tag) {
					// creating new tag
					ref = cache.get(['tag', tag]);
					if (typeof ref === 'undefined') {
						tmp = tag.split(':');
						ref = {
							tag: tag,
							name: tmp[0],
							kind: tmp[1]
						};
						cache.set(['tag', tag], ref);
						cache.set(['name', tmp[0], tmp[1]], ref);
						cache.set(['kind', tmp[1], tmp[0]], ref);
					}
					
					// setting references
					cache.set(['media', mediaid, 'tags', tag], ref);
					cache.set(['tag', tag, 'media', mediaid], mediaid);
					
					// tag was added
					return true;
				} else {
					// tag was not added
					return false;
				}
			},
			
			// removes tag from media entry
			removeTag: function (mediaid, tag) {
				var cache = data.cache,
						tmp;

				// removing tag from medium if present
				if (typeof cache.get(['media', mediaid, 'tags', tag]) !== 'undefined') {
					// removing direct references
					cache.unset(['media', mediaid, 'tags', tag]);
					cache.unset(['tag', tag, 'media', mediaid]);
					
					// removing tag altogether
					if (isEmpty(cache.get(['tag', tag, 'media']))) {
						tmp = tag.split(':');
						cache.unset(['tag', tag]);
						cache.unset(['name', tmp[0], tmp[1]]);
						cache.unset(['kind', tmp[1], tmp[0]]);

						// removing name altogether
						if (isEmpty(cache.get(['name', tmp[0]]))) {
							cache.unset(['name', tmp[0]]);
						}
						// removing kind altogether
						if (isEmpty(cache.get(['kind', tmp[1]]))) {
							cache.unset(['kind', tmp[1]]);
						}						
					}
					
					// tag was removed
					return true;
				} else {
					// tag was not removed
					return false;
				}
			},
			
			// sets rating on media entry
			setRating: function (mediaid, rating) {
				var cache = data.cache,
						current = cache.get(['media', mediaid, 'rating']);
				
				if (rating !== current.rating) {
					cache.set(['media', mediaid, 'rating'], rating);	// on media node
					cache.set(['rating', rating, mediaid], mediaid);	// rating lookup
					
					// rating was changed
					return true;
				} else {
					// rating was not changed
					return false;
				}
			},
			
			// retrieves one page from the table
			getPage: function (page, items) {
				return self.table ? 
					self.table.orderby(['file_'], jOrder.asc, {offset: page * items, limit: items, renumber: true}) :
					[];
			},
			
			// returns first row of page
			getFirst: function (page, items) {
				return self.table ?
					self.table.orderby(['file_'], jOrder.asc, {offset: page * items, limit: 1, renumber: true}) :
					[{}];
			},
			
			// returns total number of pages in dataset
			getPages: function (items) {
				return self.table ? 
					Math.ceil(self.table.count() / items) :
					0;
			},
			
			// updates hashes for media entries
			// - diffs: object containing fields to update, indexed by media id
			//	 format: {mediaid: media record}}
			// should be called 'merge'
			update: function (diffs) {
				var cache = data.cache,
						mediaid, diff,
						key;

				for (mediaid in diffs) {
					if (diffs.hasOwnProperty(mediaid) &&
							typeof cache.get(['media', mediaid]) !== 'undefined') {
						// it is possible that the mediaid being polled is not loaded ATM
						diff = diffs[mediaid];
						for (key in diff) {
							if (diff.hasOwnProperty(key)) {
								// WARNING: diff[key] can be object or array,
								// requiring cross-references to be created
								cache.set(['media', mediaid, key], diff[key]);
							}
						}
					}
				}

				return self;
			}
		};

		return self;
	}();
	
	return data;
}(app.data || {},
	jOrder,
	flock,
	app.services);

