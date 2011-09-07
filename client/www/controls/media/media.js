////////////////////////////////////////////////////////////////////////////////
// Media Entry
//
// Single video entry.
// Available views:
// - compact: checkbox, filename, rater, and tagger controls as a row
// - thumb: checker, thumbnail, filename, and rater overlayed
// - full: all controls (checkbox, thumbnail, filename, rater, keywords, tagger)
////////////////////////////////////////////////////////////////////////////////
/*global jQuery, window */
var app = app || {};

app.controls = function (controls, $, services, data) {
	var
	
	VIEWS = {
		'thumb': 'thumb',
		'compact': 'compact',
		'full': 'full'
	},
	
	// static properties
	lastWidth,
	
	// static event handlers
	onClick,
	onMouseDown,
	onChecked,
	onResize;
	
	controls.media = function (row, view) {
		var self = controls.control.create(),
		
		// sub-controls
		rater,
		tagger;
		
		self.data.row = row;

		//////////////////////////////
		// Getters / setters

		self.view = function () {
			return view;
		};
		
		//////////////////////////////
		// Business functions

		// calls playback service			
		self.play = function (elem) {
			elem
				.siblings().removeClass('playing').end()
				.addClass('playing');
			services.play(row.mediaid);
			data.pagestate.lastPlayed = row.mediaid;
			return self;
		};

		// tells whether this media entry is selected
		self.selected = function () {
			return $('#' + self.id).find(':checked').length > 0;
		};
		
		//////////////////////////////
		// Overrides

		function build() {
			self.clear();
			rater = controls.rater(row).appendTo(self);
			if (view !== 'thumb') {
				tagger = controls.tagger(row).appendTo(self);
			}
		}
		
		self.html = function () {
			build();
			
			var parent, child,
					hash = row.hash;

			return [
				'<div id="', self.id, '" class="', 
				['medium']
					.concat(data.pagestate.lastPlayed === row.mediaid ? ['playing'] : [])
					.concat(VIEWS[view] || [])
					.join(' '), '">',
				'<div class="check">',
				'<input type="checkbox" ', row.mediaid in controls.library.selected ? 'checked="checked" ' : '', '/>',
				'</div>',
				'<div class="file">',
				view === 'thumb' ? [
					'<span title="', row.file, '">', row.file, '</span>'
				].join('') : [
					'<a href="#" class="play">', row.file, '</a>'
				].join(''),
				'</div>',
				view === 'thumb' ? [
					'<div class="overlay"></div>',
					'<div class="play"></div>',
					'<div class="thumb">',
					hash.length ?
						['<img class="play" src="/cache/', hash, '.jpg">'].join('') :
						'<span class="spinner"></span>',
					'</div>'
				].join('') : '',
				'<div class="rater">',
				rater.html(),
				'</div>',
				view === 'compact' ? [
					'<div class="tagger">',
					tagger.html(),
					'</div>'
				].join('') : '',
				'</div>'
			].join('');
		};
		
		return self;
	};
	
	//////////////////////////////
	// Static methods
	
	// resizes tagger 'column' to fit screen width
	controls.media.resize = function (force) {
		var $list = $('div.media.list'),
				widths = {full: $list.width()},
				$media, $model;
		if (force || (!lastWidth || widths.full !== lastWidth) && $list.length) {
			// obtaining DOM elements
			$media = $list.children('div.medium');
			$model = $media.eq(0);
			
			// measuring fix widths that influence variable width
			widths.check = $model.children('div.check').outerWidth(true);
			widths.file = $model.children('div.file').outerWidth(true);
			widths.rater = $model.children('div.rater').outerWidth(true);
			widths.margin = $model.children('div.tagger').outerWidth(true) - $model.children('div.tagger').width();
			widths.scroller = 15;	// scroller may appear without triggering a resize event
			
			// changing width
			$media.find('div.tagger').width(
				widths.full -
				widths.check -
				widths.file -
				widths.rater -
				widths.margin -
				widths.scroller);
			
			// updating state indicator
			lastWidth = widths.full;
		}
	};
	
	//////////////////////////////
	// Static event handlers
	
	function showPreview(event) {
		var media = $(this).closest('.medium'),
				self = controls.lookup[media.attr('id')],
				view = self.view();
		if (self.data.row.keywords.length || view === 'compact' && self.data.row.hash.length) {
			controls.preview
				.keywords(self.data.row.keywords)
				.hash(view === 'compact' ? self.data.row.hash : '')
				.position(event)
				.render($('body'));
		}
	}
	
	onClick = function () {
		var media = $(this).closest('.medium'),
				self = controls.lookup[media.attr('id')];
		self.play(media);
		return false;
	};
	
	onMouseDown = function (event) {
		showPreview.call(this, event);
		return false;
	};
	
	onChecked = function () {
		var $this = $(this),
				media = $this.closest('.medium'),
				self = controls.lookup[media.attr('id')];
		if ($this.is(':checked')) {
			controls.library.selected[self.data.row.mediaid] = true;
		} else {
			delete controls.library.selected[self.data.row.mediaid];
		}
	};
	
	onResize = function (elem) {
		controls.media.resize();
	};
	
	//////////////////////////////
	// Event bindings

	$('a.play, img.play')
		.live('click', onClick)
		.live('contextmenu', onMouseDown);
	$('td.check :checkbox').live('click', onChecked);
	$(window).bind('resize', onResize);
	
	return controls;
}(app.controls || {},
	jQuery,
	app.services,
	app.data);

