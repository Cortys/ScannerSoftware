var config = require("./config"),
	path = require("path"),
	express = require("express"),
	bodyParser = require("body-parser"),
	offers = require("./offers");

module.exports = function(clientPath) {
	// Start new express server:
	var app = express(),
		parser = bodyParser.urlencoded({ extended:false });

	// Serve files from FS:
	app.use("/static", express.static(clientPath));
	app.use("/static", function(req, res, next) {
		res.status(404).send("<b>404 - File not found.</b>");
	});

	// Serve lenders data:
	app.route("/lenders").all(function(req, res) {
		offers.lenders().then(function(result) {
			res.json(result);
		}, function(err) {
			res.status(404).json({});
		});
	});

	// Serve status data:
	app.route("/status").post(parser, function(req, res) {
		offers.status(req.body).then(function(result) {
			res.json(result);
		}, function(err) {
			res.status(404).json({});
		});
	});

	// Serve index.html as default response:
	app.use(function(req, res, next) {
		res.sendFile(path.join(clientPath, "index.html"));
	});

	// Bind server to port:
	app.listen(config.port);
	console.log("HTTP started on port "+config.port+".");
};
