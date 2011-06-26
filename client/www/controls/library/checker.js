////////////////////////////////////////////////////////////////////////////////
// Select All - Select None control
////////////////////////////////////////////////////////////////////////////////
/*global jQuery */
var yalp = yalp || {};

yalp.controls = function (controls, $) {
	controls.checker = function () {
		var self = Object.create(controls.control());
				
		//////////////////////////////
		// Overrides

		self.init = function (elem) {
			elem
				.find('.all').click(function () {
					controls.library.selectAll();
					return false;
				}).end()
				.find('.none').click(function () {
					controls.library.selectNone();
					return false;
				}).end();
		};

		self.html = function () {
			return [
				'<span id="', self.id, '">',
				'<a href="#" class="all">', "Select All", '</a>',
				'<a href="#" class="none">', "Select None", '</a>',
				'</span>'
			].join('');
		};
		
		return self;
	}();
	
	return controls;
}(yalp.controls || {},
	jQuery);

