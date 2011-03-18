////////////////////////////////////////////////////////////////////////////////
// Tag Adder Control
//
// Adds tags to a video
////////////////////////////////////////////////////////////////////////////////
var controls = function (controls, $, services, data) {
	// - row: media data record
	controls.tagadd = function (row) {
		var	base = controls.tag(row),
				self = Object.create(base);

		self.data.row = row;	

		//////////////////////////////
		// Overrides
		
		self.display = function () {
			return [
				'<span id="', self.id, '" class="tag editable display add">',
				'<a href="#">', "+", '</a>',
				'</span>'
			].join('');
		};

		self.edit = function () {
			return [
				'<span id="', self.id, '" class="tag edit add">',
				'<input type="text" class="focus" />',
				'<input type="text" class="backdrop" />',
				'</span>'
			].join('');
		};
		
		return self;
	};
	
	//////////////////////////////
	// Static event handlers

	function getSelf(elem) {
		return controls.lookup[elem.closest('.tag').attr('id')].data.that;
	}
	
	function getRow(elem) {
		return controls.lookup[elem.closest('.tag').attr('id')].data.row;
	}
	
	// tag addition handler: do nothing
	function onAdd(event) {
		var self = getSelf($(this));
		self.parent.add();
		return false;
	}

	// tag change event handler
	function onChange(event) {
		var $this = $(this),
				self = getSelf($this),
				row = getRow($this),
				term = $this.val(),
				match = term.length ? data.tags.searchTag(term) : "",
				name = match.length ? match : term,
				filter = controls.search.filter;
		
		switch (event.which) {
		case 13:
			// enter - saving values
			name = data.tag(name).sanitize();
			if (!name.length) {
				return;
			}
			if (event.shiftKey) {
				// shift + enter is not defined for addition
			} else if (event.ctrlKey) {
				// adding tag(s) to multiple media
				if (filter.length && confirm("Add this to SEARCH results?")) {
					services.addtag(null, name, filter, controls.library.load);
				}
			} else {
				// adding tag(s) to simgle media file
				services.addtag(row.mediaid, name, null, function () {
					self.changetag(null, name, row);
					self.parent.add();
				});
			}
			break;
		case 27:
			// escape - cancel
			self.toggle('display');
			break;
		default:
			// any other key - filling backdrop
			$this.siblings('.backdrop')
				.val(name);
			break;
		}
	}

	$('.tag.add.display a').live('click', onAdd);
	$('.tag.add.edit input.focus').live('keyup', onChange);

	return controls;
}(controls || {},
	jQuery,
	services,
	data);

