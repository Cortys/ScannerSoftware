var db = require("./db");

module.exports = function(request) {
	return db.query("SELECT `inventar`.`id` AS `id`, `types`.`description` AS `description`, `types`.`image` AS `image` FROM `inventar`, `types` WHERE `inventar`.`id` = "+request.item*1+" AND `inventar`.`type` = `types`.`id`").spread(function(rows, fields) {

		if(!rows[0])
			throw new Error("Not found.");

		return {
			item: rows[0]
		};
	});
};
