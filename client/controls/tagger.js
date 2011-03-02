////////////////////////////////////////////////////////////////////////////////
// Tagger Control
//
// Displays and edits tags.
////////////////////////////////////////////////////////////////////////////////
var controls = function (controls, $, services) {
	controls.tagger = function (data) {
		var	self = Object.create(controls.control);

		self.getUI = function () {
			var tags = controls.tags.split(data.tags),
					result = $('<div />'),
					i;
			// constructing tag controls
			for (i = 0; i < tags.length; i++) {
				controls.tagedit(data, tags[i]).appendTo(result, self);
			}
			controls.tagadd(data).appendTo(result, self);
			return result;
		};

		return self;
	};
	
	return controls;
}(controls || {},
	jQuery,
	services);

