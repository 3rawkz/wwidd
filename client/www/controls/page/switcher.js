////////////////////////////////////////////////////////////////////////////////
// Library Switcher
//
// Lists available libraries and switches between them.
////////////////////////////////////////////////////////////////////////////////
/*global jQuery */
var yalp = yalp || {};

yalp.controls = function (controls, $, services) {
	controls.switcher = function () {
		var self = controls.control.create(),
				busy = false,
				disabled = false,
				data = {names: []};

		self.selected = '';
				
		//////////////////////////////
		// Initialization

		services.getlibs(function (json) {
			data = json.data;
			self.selected = json.data.selected;
			self.render();
		});

		//////////////////////////////
		// Getters, setters
		
		self.busy = function (value) {
			busy = value;
			return self;
		};
		
		self.disabled = function (value) {
			disabled = value;
			return self;
		};

		//////////////////////////////
		// Event handlers

		function onChange() {
			var library = $(this).val();
			
			// changing library
			services.setlib(library, function () {
				self.selected = library;
				
				// resetting controls
				controls.pager.reset();
				controls.search.reset();
				
				// loading new library contents
				controls.library.load();
			});
		}

		//////////////////////////////
		// Overrides

		self.init = function (elem) {
			// setting state
			if (busy || disabled) {
				elem.find('select')
					.attr('disabled', 'disabled');
			} else {
				elem.find('select')
					.removeAttr('disabled');				
			}
			
			if (busy) {
				elem.find('.spinner')
					.show();
			} else {
				elem.find('.spinner')
					.hide();
			}
			
			// adding events
			elem.find('select')
				.change(onChange);
		};

		self.html = function () {
			var names = data.names,
					selected = self.selected,
					i,
			result = [
				'<span class="switcher" id="', self.id, '">',
				'<span>Library:</span>',
				'<select>'
			];
			for (i = 0; i < names.length; i++) {
				result.push([
					'<option value="', names[i], '"', names[i] === selected ? ' selected="selected"' : '', '">',
					names[i],
					'</option>'
				].join(''));
			}
			result.push([
				'</select>',
				'<span class="spinner"></span>',
				'</span>'
			].join(''));
			return result.join('');
		};
		
		return self;
	}();
	
	return controls;
}(yalp.controls || {},
	jQuery,
	yalp.services);

