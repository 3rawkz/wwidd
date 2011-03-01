////////////////////////////////////////////////////////////////////////////////
// Data Entity
//
// Base class for table records
////////////////////////////////////////////////////////////////////////////////
var	sqlite = require('../tools/sqlite').sqlite,

// escapes quotes in SQL statements by duplicating them
quotes = function (text) {
	return text.replace(/'/g, "''");
},

// splits an object's keys and values into separate arrays
split = function (object) {
	var	key,
			keys = [],
			values = [];
	for (key in object) {
		keys.push(key);
		values.push(["'", quotes(object[key]), "'"].join(""));
	}
	return {'keys': keys, 'values': values};
},

// returns an array that can be used as a where or set clause
// depending on how you concatenate them
clause = function (object) {
	var	key,
			result = [];
	for (key in object) {
		result.push([
			key,
			"=",
			["'", quotes(object[key]), "'"].join("")
		].join(' '));
	}
	return result;
},

entity = {
	// kind of entity (aka. table name)
	kind: null,
	
	// gets the entity(ies) from database
	get: function (before, handler, self) {
		var kind = (self || this).kind,
				where = clause(before || {}),

		statement = [
			"SELECT * FROM",
			kind,
			where.length ? ["WHERE", where.join(" AND ")].join(" ") : ""
		].join(" ");
		
		console.log(statement);
		
		sqlite.exec(statement, handler, ['-header', '-line']);
		
		return this;
	},
	
	// adds an entity of this kind
	add: function (after, handler, self) {
		var kind = (self || this).kind,
				pair = split(after),

		statement = [
			"INSERT OR REPLACE INTO",
			kind,
			["(", pair.keys.join(","), ")"].join(""),
			"VALUES",
			["(", pair.values.join(","), ")"].join("")
		].join(" ");
		
		sqlite.exec(statement, handler);
		
		return this;
	},
	
	// changes the entity in the database
	set: function (before, after, handler, self) {
		var kind = (self || this).kind,
				set = clause(after || {}),
				where = clause(before || {}),
				
		statement = [
			"UPDATE",
			kind,
			"SET",
			set.join(","),
			where.length ? ["WHERE", where.join(" AND ")].join(" ") : ""
		].join(" ");

		console.log(statement);

		sqlite.exec(statement, handler);
		
		return this;
	},
	
	// removes an entity of this kind
	remove: function (before, handler, self) {
		var kind = (self || this).kind,
				where = clause(before || {});

		statement = [
			"DELETE FROM",
			kind,
			"WHERE",
			where.join(" AND ")
		].join(" ");

		console.log(statement);

		sqlite.exec(statement, handler);

		return this;		
	}
};

exports.entity = entity;
exports.quotes = quotes;
exports.split = split;
exports.clause = clause;

