var db = require("../db"),
	Promise = require("bluebird");

module.exports = function(request) {
	return Promise.props({
		// Query item data:
		item: db.query("SELECT `inventar`.`id` AS `id`, `types`.`description` AS `description`, `types`.`image` AS `image` FROM `inventar`, `types` WHERE `inventar`.`id` = "+request.item*1+" AND `inventar`.`type` = `types`.`id`").spread(function(rows, fields) {
			return rows[0];
		}),
		// Query borrower data:
		borrower: db.query("SELECT `users`.`id` AS `id`, `users`.`name` AS `description`, `users`.`image` AS `image` FROM `users`, `lendings` WHERE `users`.`id` = "+db.escape(request.borrower)+" OR (`users`.`id` = `lendings`.`user` AND `lendings`.`item` = "+request.item*1+" AND `lendings`.`end` IS NULL)").spread(function(rows, fields) {
			return rows[0];
		})
	});
};
