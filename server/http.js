var config = require("./config"),
	path = require("path"),
	express = require("express");

module.exports = function(clientPath) {
	// Start new express server:
	var app = express();

	// Serve files from FS:
	app.use("/static", express.static(clientPath));
	app.use("/static", function(req, res, next) {
		res.status(404).send("<b>404 - File not found.</b>");
	});

	// Serve index.html as default response:
	app.use(function(req, res, next) {
		console.log(req.path);
		res.sendFile(path.join(clientPath, "index.html"));
	});

	// Bind server to port:
	app.listen(config.port);
};
