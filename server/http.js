var config = require("./config"),
	path = require("path"),
	express = require("express");

module.exports = function(clientPath) {
	// Start new express server:
	var app = express();

	// Serve index.html as default response:
	app.get(function(req, res) {
		res.sendFile(path.join(clientPath, "index.html"));
	});

	// Serve files from FS:
	app.use(express.static(clientPath));

	// Bind server to port:
	app.listen(config.port);
};
