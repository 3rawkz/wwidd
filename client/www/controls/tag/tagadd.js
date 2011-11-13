////////////////////////////////////////////////////////////////////////////////
// Tag Adder Control
//
// Adds tags to a video
////////////////////////////////////////////////////////////////////////////////
/*global jQuery, jOrder, confirm */
var app = app || {};

app.controls = function (controls, $, jOrder, services, data) {
	// - mediaid: media identifier
	controls.tagadd = function (mediaid) {
		var	self = controls.control.create(controls.tag(mediaid));

		self.hints = controls.tagadd.hints;

		//////////////////////////////
		// Getters, setters
		
		self.mediaid = function () {
			return mediaid;
		};
		
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
	// Static properties

	// hints associated with this control
	controls.tagadd.hints = [
		"SHIFT + ENTER to add tag to checked videos.",
		"CTRL + ENTER to add tag to search results.",
		"Hit ENTER mid-word to add suggested tag."
	].concat(controls.tag.hints);
	
	//////////////////////////////
	// Static event handlers

	function getSelf(elem) {
		return controls.lookup[elem.closest('.tag').attr('id')];
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
				mediaid = self.mediaid(),
				term = $this.val(),
				match = !term.length ? "" :
					term +
					data.tags.searchTag(term.toLowerCase()).substr(term.length),
				name = match.length ? match : term,
				filter;
		
		switch (event.which) {
		case 13:
			// enter - saving values
			name = data.tag.sanitize(name);
			if (!name.length) {
				return;
			}
			switch (controls.tag.scope(event)) {
			case 'all':
				break;
			case 'selected':
				// shift + enter is handled only when entry is selected (and possibly others)
				if (self.parent.parent.selected() && confirm("Add this to SELECTED videos?")) {
					services.tag.add(null, name, null, jOrder.keys(controls.media.selected).join(','), controls.media.load);
				}
				break;
			case 'search':
				// adding tag(s) to multiple media
				filter = controls.search.filter();
				if (filter.length && confirm("Add this to SEARCH results?")) {
					services.tag.add(null, name, filter, null, controls.media.load);
				}
				break;
			case 'single':	
				// adding tag(s) to single media file
				services.tag.add(mediaid, name, null, null, function () {
					self.changetag(null, name);
					self.parent.add();
				});
				break;
			}
			break;
		case 27:
			// escape - cancel
			self.toggle('display');
			break;
		default:
			// any other key - filling backdrop
			$this.siblings('.backdrop')
				.val(name)
				.scrollLeft($this.scrollLeft());
			break;
		}
	}

	$('.tag.add.display a').live('click', onAdd);
	$('.tag.add.edit input.focus').live('keyup', onChange);

	return controls;
}(app.controls || {},
	jQuery,
	jOrder,
	app.services,
	app.data);

