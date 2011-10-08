////////////////////////////////////////////////////////////////////////////////
// Kind Selector Control
//
// Lets the user control what kind of tags are visible
////////////////////////////////////////////////////////////////////////////////
/*global jQuery */
var app = app || {};

app.controls = function (controls, $, data) {
	var KIND_PREFIX = 'k';
	
	controls.kinds = function () {
		var	self = controls.control.create(controls.popup('dropdown')),
				hidden;
		
		//////////////////////////////
		// Utility functions

		// converts array to lookup
		function toLookup(array) {
			var i, result = {};
			for (i = 0; i < array.length; i++) {
				if (array[i].length >= KIND_PREFIX.length) {
					result[array[i].substr(KIND_PREFIX.length)] = true;
				}
			}
			return result;
		}
		
		// converts lookup to array
		function toArray(lookup) {
			var result = [], key;
			for (key in lookup) {
				if (lookup.hasOwnProperty(key)) {
					result.push(KIND_PREFIX + key);
				}
			}
			return result;
		}
				
		// adjusts the hidden state of a particular kind
		function handler(kind, state) {
			if (state) {
				delete hidden[kind];
			} else {
				hidden[kind] = true;
			}

			// saving cookie
			data.cookie.set('hiddenkinds', toArray(hidden).join(','));
			
			// custom callback
			controls.media
				.render();
			
			return self;
		}

		//////////////////////////////
		// Initialization

		// initializing hidden kinds
		hidden = toLookup((data.cookie.get('hiddenkinds') || '').split(','));
				
		//////////////////////////////
		// Getters / setters

		// gets the hidden property of a kind
		self.hidden = function (kind) {
			return hidden[kind];
		};
			
		//////////////////////////////
		// Overrides

		self.build = function () {
			var lookup = data.cache.get('kind'),
					kind;
			self.clear();
			for (kind in lookup) {
				if (lookup.hasOwnProperty(kind)) {
					controls.kind(kind, handler).appendTo(self);
				}
			}
			return self;
		};

		self.contents = function () {
			var result = ['<div class="kinds">'],
					i;
			for (i = 0; i < self.children.length; i++) {
				result.push(self.children[i].html());
			}
			result.push('</div>');
			return result.join('');
		};

		return self;
	}();
	
	return controls;
}(app.controls || {},
	jQuery,
	app.data);

