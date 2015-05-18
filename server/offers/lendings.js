var db = require("../db"),
	Promise = require("bluebird");

module.exports = function(request) {

	if(typeof request !== "object" || request === null)
		request = {};
	
	if(typeof request.order !== "object" || request === null)
		request.order = {
			column: "start"
		};
	var sql = `SELECT lendings.*, types.description AS type FROM lendings, inventar, types
		WHERE lendings.item = inventar.id AND inventar.type = types.id
		AND end ${request.endedLendings === "true"?"IS NOT":"IS"} NULL
		ORDER BY ${db.escapeId(request.order.column)} ${request.order.asc === "true"?"ASC":"DESC"}`;

	console.log(sql);
	return db.query(sql).spread(function(rows, columns) {
		return rows;
	});
};
