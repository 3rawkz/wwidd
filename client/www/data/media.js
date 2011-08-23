////////////////////////////////////////////////////////////////////////////////
// Media Data
////////////////////////////////////////////////////////////////////////////////
/*global jOrder */
var yalp = yalp || {};

yalp.data = function (data, jOrder, services) {
	data.media = function () {
		// extracts filename from path
		function splitPath(path) {
			var bits = path.split('/');
			return {
				file: bits.pop()
			};
		}
		
		// preprocesses video metadata
		function preprocess(json) {
			var i, row, fileInfo;
			for (i = 0; i < json.length; i++) {
				row = json[i];
				fileInfo = splitPath(row.path);
				row.file = fileInfo.file;
				row.file_ = fileInfo.file.toLowerCase();
				row.ext = fileInfo.ext;
			}
			return json;
		}
		
		var self = {
			table: null,

			// initializes data object: calls service, populates table
			init: function (filter, handler) {
				handler = handler || function () {};
				services.getmedia(filter, function (json) {
					self.table = jOrder(preprocess(json.data))
						.index('mediaid', ['mediaid'], {ordered: true, type: jOrder.number})
						.index('file', ['file_'], {ordered: true, grouped: true, type: jOrder.string})
						.index('tags', ['tags'], {grouped: true, type: jOrder.array});
					handler();
				});
				return self;
			},

			// retrieves one page from the table
			getPage: function (page, items) {
				return self.table ? 
					self.table.orderby(['file_'], jOrder.asc, {offset: page * items, limit: items, renumber: true}) :
					[];
			},
			
			// returns first row of page
			getFirst: function (page, items) {
				return self.table ?
					self.table.orderby(['file_'], jOrder.asc, {offset: page * items, limit: 1, renumber: true}) :
					[{}];
			},
			
			// returns total number of pages in dataset
			getPages: function (items) {
				return self.table ? 
					Math.ceil(self.table.flat().length / items) :
					0;
			},
			
			// updates hashes for media entries
			// - hashes: object containing hash values for mediaids
			//	 format: {mediaid: {hash: string}}
			setHash: function (hashes) {
				var mediaid,
						before, after;
				for (mediaid in hashes) {
					if (hashes.hasOwnProperty(mediaid)) {
						// to save cpu, hash is updated directly (w/o jOrder.update)
						// because hash is not part of any indexes
						before = self.table.where([{mediaid: mediaid}], {renumber: true})[0];
						before.hash = hashes[mediaid].hash;
					}
				}
				return self;
			}
		};

		return self;
	}();
	
	return data;
}(yalp.data || {},
	jOrder,
	yalp.services);

