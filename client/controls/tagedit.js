////////////////////////////////////////////////////////////////////////////////
// Tag Control
//
// Displays and edits one tag.
////////////////////////////////////////////////////////////////////////////////
var controls = function (controls, $, services, tagbase) {
	// - data: media data record
	// - idx: index of tag in collection
	// - handler: callback redrawing parent
	controls.tagedit = function (data, name) {
		var	base = tagbase(data),
				self = Object.create(base);

		// refreshes entire page (data & UI)
		function refreshPage() {
			self
				.parent	// tagger
				.parent	// media
				.parent	// page
				.load();
		}
				
		// tag remove event handler
		function onRemove(event) {
			if (event.ctrlKey && confirm("Are you sure you want to delete all tags of this kind?")) {
				// deleting all tags bearing this name
				services.deltag(null, name, refreshPage);
			} else {
				// deleting tag from one specific video
				services.deltag(data.mediaid, name, function () {
					delete self.lookup[name];
					data.tags = self.serialize();
					self.parent.redraw();
				});
			}
			return false;
		}
		
		// tag change event handler
		function onChange(event) {
			if (event.which !== 13) {
				return;
			}
			var newName = $(this).val();
			if (newName === name || !newName.length) {
				return;
			}
			if (event.ctrlKey && confirm("Are you sure you want to change all tags of this kind?")) {
				services.changetag(null, name, newName, refreshPage);
			} else {
				services.changetag(data.mediaid, name, newName, function () {
					delete self.lookup[name];
					name = newName;
					self.lookup[name] = true;
					data.tags = self.serialize();
					self.parent.redraw();
				});
			}
		}
		
		self.display = function () {
			return base.display(self, $('<span />', {'class': 'tag'})
				// adding removal button
				.append($('<a />', {'href': '#'})
					.text('x')
					.click(onRemove))
				// adding tag text
				.append($('<span />')
					.text(name)));
		};

		self.edit = function () {
			return $('<input />', {'type': 'text', 'class': 'tag'})
				.val(name)
				.keyup(onChange);
		};
		
		return self;
	};
	
	return controls;
}(controls || {},
	jQuery,
	services,
	controls.tagbase);

