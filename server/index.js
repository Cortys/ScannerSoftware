module.exports = function(path) {
	//console.log(path);

	// Init HTTP server:
	require("./http")(path);
};
