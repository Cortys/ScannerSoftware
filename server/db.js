var config = require("./config"),
	Promise = require("bluebird"),
	mysql = require("mysql"),
	connection;

connection = mysql.createConnection(config.db);

connection.query = Promise.promisify(connection.query, connection);

connection.connect(function(err) {
	if(err) {
		console.log("Database connection failed.", err.code);
		process.exit(1);
	}
	else
		console.log("Database connection established.");
});

connection.escape = mysql.escape.bind(mysql);

module.exports = connection;
