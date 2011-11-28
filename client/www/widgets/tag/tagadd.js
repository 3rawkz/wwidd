////////////////////////////////////////////////////////////////////////////////
// Tag Adder Control
//
// Adds tags to a video
////////////////////////////////////////////////////////////////////////////////
/*global jQuery, wraith, jOrder, confirm */
var app = app || {};

app.widgets = function (widgets, $, wraith, jOrder, services, model) {
	// - mediaid: media identifier
	widgets.tagadd = function (mediaid) {
		var	self = wraith.widget.create(widgets.tag(mediaid));

		self.hints = widgets.tagadd.hints;

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

	// hints associated with this widget
	widgets.tagadd.hints = [
		"SHIFT + ENTER to add tag to checked videos.",
		"CTRL + ENTER to add tag to search results.",
		"Hit ENTER mid-word to add suggested tag."
	].concat(widgets.tag.hints);
	
	//////////////////////////////
	// Static event handlers

	function getSelf(elem) {
		return wraith.lookup(elem, '.tag');
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
					model.tags.searchTag(term.toLowerCase()).substr(term.length),
				name = match.length ? match : term,
				mediaids;
		
		key:
		switch (event.which) {
		case 13:
			// enter - saving values
			name = model.tag.sanitize(name);
			if (!name.length) {
				return;
			}
			
			scope:
			switch (widgets.tag.scope(event)) {
			case 'all':
				break scope;
			case 'selected':
				// shift + enter is handled only when entry is selected (and possibly others)
				if (self.parent.parent.selected() && confirm("Add this to SELECTED videos?")) {
					mediaids = jOrder.keys(widgets.media.selected);
					services.tag.add(null, name, mediaids.join(','), function () {
						model.media.addTag(mediaids, name);
						widgets.media.refreshTags();
					});
				}
				break scope;
			case 'search':
				// adding tag(s) to multiple media
				mediaids = model.media.matchedMedia();
				if (mediaids.length && confirm("Add this to SEARCH results?")) {
					services.tag.add(null, name, mediaids.join(','), function () {
						model.media.addTag(mediaids, name);
						widgets.media.refreshTags();
					});
				}
				break scope;
			case 'single':
				// adding tag(s) to single media file
				services.tag.add(mediaid, name, null, function () {
					self.changetag(null, name);
					self.parent.add();
				});
				break scope;
			}
			break key;
		case 27:
			// escape - cancel
			self.toggle('display');
			break key;
		default:
			// any other key - filling backdrop
			$this.siblings('.backdrop')
				.val(name)
				.scrollLeft($this.scrollLeft());
			break key;
		}
	}

	$('.tag.add.display a').live('click', onAdd);
	$('.tag.add.edit input.focus').live('keyup', onChange);

	return widgets;
}(app.widgets || {},
	jQuery,
	wraith,
	jOrder,
	app.services,
	app.model);

