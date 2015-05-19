var db = require("../db"),
	Promise = require("bluebird");

module.exports = function(request) {

	if(typeof request !== "object" || request === null)
		request = {};

	if(typeof request.order !== "object" || request === null)
		request.order = {
			column: "start"
		};

	return db.query(`SELECT lendings.*, types.description AS type FROM lendings, inventar, types
		WHERE lendings.item = inventar.id AND inventar.type = types.id
		AND end ${request.endedLendings === "true"?"IS NOT":"IS"} NULL
		ORDER BY ${db.escapeId(request.order.column)} ${request.order.asc === "true"?"ASC":"DESC"}`).spread(function(rows, columns) {
		return rows;
	});
};
