////////////////////////////////////////////////////////////////////////////////
// Tag Control Base (Abstract)
////////////////////////////////////////////////////////////////////////////////
var controls = function (controls, $, services, data) {
	// tag collection
	controls.tags = function (names) {
		var separator = /\s*[^A-Za-z0-9:\s]+\s*/,
				tags = names.split(separator);
		
		return {
			// splits string along non-word parts
			split: function () {
				return tags;
			},
			// removes separators from string
			sanitize: function () {
				return tags.join('');
			},
			// tells if any of the tags match the submitted name
			match: function (name) {
				// no match when tags is empty
				if (!tags.length || tags.length === 1 && !tags[0].length) {
					return false;
				}
				var re, i;
				for (i = 0; i < tags.length; i++) {
					re = new RegExp('^' + tags[i] + '.*$', 'i');
					if (name.match(re)) {
						return true;
					}
				}
				return false;
			}
		};
	};
	
	// - row: media data record
	// - handler: callback redrawing parent
	controls.tagbase = function (row) {
		var	base = controls.editable(),
				self = Object.create(base),
				i;

		// initializing tag lookup
		(function () {
			var siblings = row.tags;
			self.lookup = {};
			for (i = 0; i < siblings.length; i++) {
				self.lookup[siblings[i]] = true;
			}
		}());
		
		// gets key from a lookup table
		function keys(lookup) {
			var result = [],
					name;
			for (name in lookup) {
				result.push(name);
			}
			return result;
		}
		
		// changes tag to one or more tags
		// - before: value before change, either a string or null (insertion)
		// - after: value after change, comma separated string or null (deletion)
		self.changetag = function (before, after, row) {
			var self = this,
					names, i;

			// deleting old tag if there was one
			if (before) {
				delete self.lookup[before];
			}
			// adding new value(s) to buffer
			if (after) {
				names = controls.tags(after).split();
				for (i = 0; i < names.length; i++) {
					self.lookup[names[i]] = true;
				}
			}
			// finalizing changes
			row.tags = keys(this.lookup);
			
			// refreshing kinds
			data.kinds.init(function () {
				self.parent.redraw();
				controls.kinds.redraw();
			});
		};
		
		return self;
	};
	
	return controls;
}(controls || {},
	jQuery,
	services,
	data);

