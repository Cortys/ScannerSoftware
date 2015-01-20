(function() {

	var listener;

	var page = (function() {

		function LendProcess() {

			var that = this;

			this.handleScan = function handleScan(word) {
				word = word.substr(word.indexOf(" ")+1);

				if(isNaN(word))
					that.borrower = word;
				else
					that.item = word;
			};

			page.addScanListener(this.handleScan);
		}
		LendProcess.prototype = {
			_borrower: null,
			_item: null,
			lender: null,

			handleScan: null,

			close: function close() {
				page.removeScanListener(this.handleScan);
			},

			set borrower(value) {
				this._borrower = value;
			},
			get borrower() {
				return this._borrower;
			},

			set item(value) {
				this._item = value;
			},
			get item() {
				return this._item;
			}
		};

		var main,
			currentLendProcess,
			currentScan = "",
			scanListeners = new Set();

		var page = {
			init: function init(pMain) {
				main = pMain;

				currentLoanProcess = new LendProcess();

				$(document).bind("keyup", listener = function(e) {
					if(e.keyCode == 13) {
						scanListeners.forEach(function(scanListener) {
							scanListener(currentScan);
						});
						currentScan = "";
						return;
					}
					currentScan += String.fromCharCode(e.keyCode);
				});
			},

			addScanListener: function(listener) {
				scanListeners.add(listener);
			},
			removeScanListener: function(listener) {
				scanListeners.delete(listener);
			}
		};

		return page;
	}());

	var api = (function() {
		return {
			close: function close(done) {
				$(document).unbind("keyup", listener);
				done();
			}
		};
	}());

	connector.checkIn("leihen", api, function(main) {
		page.init(main);
	});

}());
