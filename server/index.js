module.exports = function(path) {
	//console.log(path);

	console.log("Server started.");

	// Init HTTP server:
	require("./http")(path);
};
