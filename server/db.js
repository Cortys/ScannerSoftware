var Promise = require("bluebird"),
	mysql = require("mysql"),
	connection;

connection = mysql.createConnection({
	host: "localhost",
	user: "root",
	password: "",
	database: "verleihsystem"
});

connection.query = Promise.promisify(connection.query, connection);

connection.connect();

connection.on('error', function(err) {
	if(err.fatal)
		connection.connect();
});

connection.escape = mysql.escape.bind(mysql);

module.exports = connection;
