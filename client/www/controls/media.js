////////////////////////////////////////////////////////////////////////////////
// Media Entry
////////////////////////////////////////////////////////////////////////////////
var controls = function (controls, $, services, data) {
	controls.media = function (row) {
		var self = Object.create(controls.control()),
				rater, tagger;

		//////////////////////////////
		// Business functions

		// calls playback service			
		self.play = function (elem) {
			elem
				.siblings().removeClass('playing').end()
				.addClass('playing');
			services.play(row.path);
			data.pagestate.lastPlayed = row.mediaid;
			return self;
		};

		//////////////////////////////
		// Overrides

		self.init = function (elem) {
			elem.find('a.play')
				.click(onClick);
		};
		
		function build() {
			self.clear();
			rater = controls.rater(row).appendTo(self);
			tagger = controls.tagger(row).appendTo(self);
		}
		
		self.html = function () {
			self.data.that = this;
			
			build();
			
			return [
				'<tr id="', self.id, '" class="media ', data.pagestate.lastPlayed === row.mediaid ? 'playing' : '', '">',
				'<td class="check">', '<input type="checkbox" />', '</td>',
				'<td class="file">',
				'<a href="#" class="play" title="', row.file, '">', row.file, '</a>',
				'</td>',
				'<td class="rater">',
				rater.html(),
				'</td>',
				'<td class="tagger">',
				tagger.html(),
				'</td>',
				'</tr>'
			].join('');
		};
		
		return self;
	};
	
	//////////////////////////////
	// Static event handlers

	function onClick() {
		var media = $(this).closest('.media'),
				self = controls.lookup[media.attr('id')].data.that;
		self.play(media);
		return false;
	}
	
	$('a.play').live('click', onClick);
	
	return controls;
}(controls || {},
	jQuery,
	services,
	data);

