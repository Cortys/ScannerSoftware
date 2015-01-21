var db = require("../db");

module.exports = function() {
	return db.query("SELECT * FROM `users` WHERE `lender` = 1 ORDER BY `id`").spread(function(rows, fields) {
		return rows;
	});
};
