var Promise = require("bluebird"),
	connection;

connection = require("mysql").createConnection({
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

module.exports = connection;
