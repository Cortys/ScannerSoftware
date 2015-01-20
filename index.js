// Start file:

// Get node.js path API:
var path = require("path");

// Return module.exports object of server/index.js:
require("./server")(
	// Call init function with path to client dir:
	// current path + "/client"
	path.join(__dirname, "client")
);
