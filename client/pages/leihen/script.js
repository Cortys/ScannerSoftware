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

			checkStatus: function checkStatus() {
				$.post("status", { borrower:this._borrower, item:this._item }, function(data) {
					view.render("item", data.item.id, data.item.image);
				}, "json").fail(function() {

				});
			},

			proceed: function proceed() {

			},

			close: function close() {
				page.removeScanListener(this.handleScan);
				view.reset();
			},

			set borrower(value) {
				this._borrower = value;
				view.render("borrower", value);
				this.checkStatus();
			},
			get borrower() {
				return this._borrower;
			},

			set item(value) {
				this._item = value;
				view.render("item", value);
				this.checkStatus();
			},
			get item() {
				return this._item;
			}
		};

		var main,
			currentLendProcess,
			currentScan = "",
			scanListeners = new Set();

		var view = {
			borrower: null,
			item: null,

			init: function init(borrower, item) {
				this.borrower = borrower;
				this.item = item;
			},

			reset: function() {
				this.borrower.add(this.item).children("p").html("?");
			},

			render: function(target, data, image) {
				target = target=="item"?this.item:this.borrower;

				target.children("p").html(data);

				if(image)
					target.children("figure").children("img").attr("src", "static/dbImages/"+image);
			},
		};

		var page = {
			init: function init(pMain, borrower, item) {
				main = pMain;

				view.init(borrower, item);

				currentLendProcess = new LendProcess();

				var that = this;

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

				$("#cancel").bind("click", function() {
					that.newLendProcess();
				});
			},

			newLendProcess: function newLendProcess(callback) {
				if(currentLendProcess)
					currentLendProcess.close(function() {
						currentLendProcess = new LendProcess();
						callback();
					});
			},

			addScanListener: function addScanListener(listener) {
				scanListeners.add(listener);
			},
			removeScanListener: function removeScanListener(listener) {
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
		page.init(main, $("#borrower"), $("#item"));
	});

}());
