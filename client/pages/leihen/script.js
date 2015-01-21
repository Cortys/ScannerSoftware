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
			console.log("new LendProcess()");
			page.addScanListener(this.handleScan);
		}
		LendProcess.prototype = {
			_borrower: null,
			_item: null,
			lender: null,

			handleScan: null,

			checkStatus: function checkStatus() {
				$.post("status", { borrower:this._borrower, item:this._item }, function(data) {
					view[data.item?"render":"reset"]("item", data.item);
					view[data.borrower?"render":"reset"]("borrower", data.borrower);
				}, "json").fail(function() {
					view.reset();
				});
			},

			proceed: function proceed() {

			},

			close: function close(callback) {
				page.removeScanListener(this.handleScan);
				view.reset();
				if(typeof callback == "function")
					callback();
			},

			set borrower(value) {
				this._borrower = value;
				view.render("borrower", { id:"..." });
				this.checkStatus();
			},
			get borrower() {
				return this._borrower;
			},

			set item(value) {
				this._item = value;
				view.render("item", { id:"..." });
				this.checkStatus();
			},
			get item() {
				return this._item;
			}
		};

		var main, // The API object of the main page
			control, // The controller DOM element
			currentLendProcess,
			currentScan = "",
			lastLetter,
			scanListeners = new Set();

		var view = {
			borrower: null,
			item: null,
			_borrowerSet: false,
			_itemSet: false,

			init: function init(borrower, item) {
				this.borrower = borrower;
				this.item = item;
			},

			reset: function(target) {
				var joined = !target?this.borrower.add(this.item):this[target];
				joined.children("p").html("?");
				joined.each(function() {
					var id = $(this).attr("id");
					$(this).children("figure").children("img").attr({ src:"static/images/"+id+".svg", alt:"", title:"" });
				});
				if(target)
					this["_"+target+"Set"] = false;
				else
					this._borrowerSet = this._itemSet = false;
				this.updateButtons();
			},

			render: function(pTarget, data) {

				if(!data)
					return;

				target = this[pTarget];

				target.children("p").html(data.id);

				if(data.image)
					target.children("figure").children("img").attr({ src:"static/dbImages/"+data.image, alt:data.description, title:data.description });

				this["_"+pTarget+"Set"] = true;
				this.updateButtons();
			},

			updateButtons: function() {
				if(this._borrowerSet || this._itemSet)
					$("#cancel", control).show();
				else
					$("#cancel", control).hide();
			}
		};

		var page = {
			init: function init(pMain, borrower, item, pControl) {
				main = pMain;
				control = pControl;

				view.init(borrower, item);

				currentLendProcess = new LendProcess();

				var that = this;

				$(window).bind("keyup", listener = function(e) {
					// Only accept words that were typed really fast:
					if(lastLetter !== undefined && Date.now()-lastLetter > 20)
						currentScan = "";
					if(e.keyCode == 13 && currentScan !== "") {
						scanListeners.forEach(function(scanListener) {
							scanListener(currentScan);
						});
						currentScan = "";
						return;
					}
					currentScan += String.fromCharCode(e.keyCode);
					lastLetter = Date.now();
				});

				$("#cancel", control).bind("click", function() {
					that.newLendProcess();
				});

				$.post("lenders", {}, function(data) {
					data.forEach(function(v, i) {
						$("select", control).append("<option value='"+v.id+"'"+(!i?" selected":"")+">"+v.id+"</option>");
					});
				}).fail(function() {
					console.error("Could not load lenders.");
				});

			},

			newLendProcess: function newLendProcess(callback) {
				if(currentLendProcess)
					currentLendProcess.close(function() {
						currentLendProcess = new LendProcess();
						if(typeof callback == "function")
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
