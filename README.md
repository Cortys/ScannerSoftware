# ScannerSoftware

## Preparation Steps:
1. Directory structure:
	* `client`
	* `server`
	* `index.js`
2. Bootstrapped `./index.js` to `./server/index.js`
3. Specified npm package.json
4. Installed npm: `sudo npm install`
5. Implement http server
	* `config.js`: Contains application settings (port + database)
	* `http.js`: Starts http server using express

## How to install:
1. Install latest [io.js](http://iojs.org)
2. Install a MySQL database.
3. Download code from this repository.
4. Import `database.sql` into the MySQL database.
5. Open `server/config.js`:
	1. Enter database credentials.
	2. *Optional* Change the HTTP port of the application. 6001 by default.
6. Open terminal and navigate to the ScannerSoftware directory.
7. Type `node index.js`. Server should be running now.
8. Open `http://localhost:6001` in a **current** browser (e. g. Chrome > 30 or Firefox > 35).
9. To terminate the application type Ctrl+C in terminal.
