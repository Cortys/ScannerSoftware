var db = require("../db"),
	status = require("./status");

module.exports = function(request) {
	return status(request).then(function(result) {
		if(!result.item || !result.item.id || !result.borrower || !result.borrower.id)
			throw new Error("Invalid lend data.");

		var isReturn = !!result.borrower.isReturn;

		if(isReturn)
			return db.query("UPDATE lendings SET end = CURRENT_TIMESTAMP WHERE borrower = "+db.escape(result.borrower.id)+" AND item = "+result.item.id*1+" LIMIT 1").spread(function(result) {
				if(result.changedRows !== 1)
					throw new Error("Update failed.");
			});

		return db.query("INSERT INTO lendings (borrower, item, lender) VALUES("+db.escape(result.borrower.id)+", "+result.item.id*1+", "+db.escape(result.lender)+")");

	}).then(function(res) {
		return {
			success: true
		};
	}, function(err) {
		return {
			success: false
		};
	});
};
