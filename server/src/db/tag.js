////////////////////////////////////////////////////////////////////////////////
// Tag Entity
////////////////////////////////////////////////////////////////////////////////
var	sqlite = require('../tools/sqlite').sqlite,
		entity = require('../db/entity').entity,
		clause = require('../db/entity').clause,

tag = function () {
	var base = Object.create(entity, {kind: {value: 'tags'}}),
			self = Object.create(base);

	// retrieves a list of all tag kinds
	self.getKinds = function (handler) {
		var statement = "SELECT DISTINCT kind FROM tags;";

		console.log(statement);
		sqlite.exec(statement, handler, ['-header', '-line']);
	};
			
	// adds one or more tags to a file
	self.add = function (after, handler) {
		var 
		
		// splitting along non-tag characters w/ optional padding
		tags = after.tag.split(/\s*[^A-Za-z0-9:\s]+\s*/),
		
		// generates sql for a single tag
		// - name: "name:kind"
		single = function (name) {
			var tmp = name.split(':');
			return [
				"INSERT OR IGNORE INTO",
				self.kind,
				"(mediaid, name, kind) VALUES",
				"(" + after.mediaid + ",'" + tmp[0] + "','" + tmp[1] + "')"
			].join(" ");
		},
		
		statement = (tags.length === 1 ? [
			// single tag
			single(tags[0])
		] : [
			// multiple tags
			"BEGIN TRANSACTION",
			(function () {
				var result = [],
						i;
				for (i = 0; i < tags.length; i++) {
					result.push(single(tags[i]));
				}
				return result.join(";\n"); 
			}()),
			"COMMIT"
		]).join(";\n");
		
		console.log(statement);
		sqlite.exec(statement, handler);		
	};
	
	// updates a batch of tags
	self.set = function (before, after, handler) {
		// separating tag name and kind
		before.name = before.tag.split(':')[0];
		delete before.tag;
		
		var	where =  clause(before).join(" AND "),
				tmp = after.tag.split(':'),
				name = "'" + tmp[0] + "'",
				kind = tmp[1] ? "'" + tmp[1] + "'" : "NULL",
		
		statement = (before.mediaid ? [
			// updaing a single tag
			"BEGIN TRANSACTION",
			// deleting old tag name
			["DELETE FROM", self.kind, "WHERE", where].join(" "),
			// inserting new name
			["INSERT OR IGNORE INTO",
				self.kind, "(mediaid, name, kind)",
				"VALUES",
				"(" + [before.mediaid, name, kind].join(",") + ")"
			].join(" "),
			"COMMIT"
		] : [
			// updaing multiple tags
			"BEGIN TRANSACTION",
			// marking mediaids that contain the old tag name
			"CREATE TEMPORARY TABLE focus (mediaid INTEGER)",
			["INSERT INTO focus (mediaid) SELECT mediaid FROM", self.kind, "WHERE", where].join(" "),
			// deleting entries that already contain both the old and new names
			["DELETE FROM", self.kind, "WHERE mediaid IN focus AND", where].join(" "),
			// inserting new tag names
			["INSERT OR IGNORE INTO",
				self.kind, "(mediaid, name, kind)",
				"SELECT mediaid,",
				name + " AS name,",
				kind + " AS kind",                         
				"FROM focus"
			].join(" "),
			"DROP TABLE focus",
			"COMMIT"
		]).join(";\n");
		
		console.log(statement);
		sqlite.exec(statement, handler);
	};
	
	// removes tag from file(s)
	self.remove = function (before, handler) {
		// discarding tag kind information
		before.name = before.tag.split(':')[0];
		delete before.tag;
		base.remove(before, handler, self);
	};
	
	return self;
}();

exports.tag = tag;

