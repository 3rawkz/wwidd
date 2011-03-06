////////////////////////////////////////////////////////////////////////////////
// Media Data
////////////////////////////////////////////////////////////////////////////////
var data = function (data, jOrder, services) {
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
			var i;
			for (i = 0; i < json.length; i++) {
				var row = json[i],
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
						.index('file', ['file_'], {ordered: true, grouped: true, type: jOrder.string});
					handler();
				});
			},

			// retrieves one page from the table
			getPage: function (page, items) {
				return self.table.orderby(['file_'], jOrder.asc, {offset: page * items, limit: items, renumber: true});
			},
			
			// returns first row of page
			getFirst: function (page, items) {
				return self.table.orderby(['file_'], jOrder.asc, {offset: page * items, limit: 1, renumber: true});
			},
			
			// returns total number of pages in dataset
			getPages: function (items) {
				return Math.floor(self.table.flat().length / items);
			}
		};

		return self;
	}();
	
	return data;
}(data || {},
	jOrder,
	services);

