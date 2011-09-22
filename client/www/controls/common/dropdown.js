////////////////////////////////////////////////////////////////////////////////
// General Dropdown Control
////////////////////////////////////////////////////////////////////////////////
/*global jQuery, window */
var app = app || {};

app.controls = function (controls, $) {
	var
	
	// static event handlers
	onClick;
	
	controls.dropdown = function () {
		var self = controls.control.create(),
				popup = null,
				caption = '';
			
		//////////////////////////////
		// Getters / setters

		self.caption = function (value) {
			caption = value;
			return self;
		};

		self.popup = function (value) {
			popup = value;
			return self;
		};

		//////////////////////////////
		// Control
		
		self.collapse = function () {
			popup.render(null);
			return self;
		};

		//////////////////////////////
		// Overrides

		self.init = function (elem) {
			elem.find('button')
				.click(function (event) {
					if (popup) {
						onClick.call(this, event, popup);
					}
					return false;
				});
		};
		
		self.html = function () {
			return [
				'<span id="', self.id, '" class="dropdown">',
				'<button type="button">',
				'<span class="caption">', caption, '</span>',
				'<span class="indicator"></span>',
				'</button>',
				'</span>'
			].join('');
		};
		
		return self;
	};
	
	//////////////////////////////
	// Static event handlers
	
	onClick = function (event, popup) {
		var $this = $(this).closest('span.dropdown'),
				self = controls.lookup[$this.attr('id')],
				pos, height;
		
		// checking if popup is already up
		if ($('#' + popup.id).length) {
			$this.removeClass('open');
			self.collapse();
		} else {
			$this.addClass('open');
			// initializing and displaying popup
			pos = $this.offset();
			height = $this.outerHeight(true);
			popup
				.build()
				.position({
					pageX: pos.left,
					pageY: pos.top + height
				})
				.render($('body'));
		}
	};
	
	return controls;
}(app.controls || {},
	jQuery);

