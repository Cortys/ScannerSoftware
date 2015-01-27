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
			view.reset(undefined, true);
			page.addScanListener(this.handleScan);
		}
		LendProcess.prototype = {
			_borrower: null,
			_item: null,
			lender: null,

			handleScan: null,

			checkStatus: function checkStatus(scannedProperty) {
				var that = this;
				$.post("status", { borrower:this._borrower, item:this._item }, function(data) {
					if(data.item && (data.item.id != that._item || scannedProperty == "item")) {
						that._item = data.item.id;
						view.render("item", data.item);
					}
					if(data.borrower && (data.borrower.id != that._borrower || scannedProperty == "borrower")) {
						that._borrower = data.borrower.id;
						view.render("borrower", data.borrower);
					}
					if(scannedProperty && !data[scannedProperty])
						view.reset(scannedProperty);
				}, "json").fail(function(err) {
					that._item = that._borrower = null;
					view.reset();
				});
			},

			proceed: function proceed() {

			},

			close: function close(callback) {
				page.removeScanListener(this.handleScan);
				view.reset(undefined, true);
				if(typeof callback == "function")
					callback();
			},

			set borrower(value) {
				view.render("borrower", { id:view.waiting });
				this._borrower = value;
				this.checkStatus("borrower");
			},
			get borrower() {
				return this._borrower;
			},

			set item(value) {
				view.render("item", { id:view.waiting });
				this._item = value;
				this.checkStatus("item");
			},
			get item() {
				return this._item;
			}
		};

		var main, // The API object of the main page
			control, // The controller DOM element
			currentLendProcess,
			currentScan = "",
			lastLetter = 0,
			scanListeners = new Set();

		var view = {

			waiting: Symbol("waiting"),

			borrower: null,
			item: null,
			_borrowerSet: false,
			_itemSet: false,

			init: function init(borrower, item) {
				this.borrower = borrower;
				this.item = item;
			},

			reset: function(target, doNotBlink) {
				var joined = !target?this.borrower.add(this.item):this[target],
					pTags = joined.children("p").html("?");
				if(!doNotBlink) {
					pTags.addClass("red");
					setTimeout(function() {
						pTags.removeClass("red");
					}, 10);
				}
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

				var target = this[pTarget];

				if(!data)
					return;

				var pTags = target.children("p").html(data.id == this.waiting?"...":data.id);

				if(data.id && data.id != this.waiting) {
					pTags.addClass("green");
					setTimeout(function() {
						pTags.removeClass("green");
					}, 10);

					this["_"+pTarget+"Set"] = true;
					//this["_isReturn"] = data;
				}

				if(data.image)
					target.children("figure").children("img").attr({ src:"static/dbImages/"+data.image, alt:data.description, title:data.description });

				this.updateButtons();
			},

			updateButtons: function() {
				if(this._borrowerSet || this._itemSet)
					$("#cancel", control).show();
				else
					$("#cancel", control).hide();

				if(this._borrowerSet && this._itemSet)
					$("#confirm").show();
				else
				$("#confirm").hide();
			}
		};

		var page = {
			init: function init(pMain, borrower, item, pControl) {
				main = pMain;
				control = pControl;

				view.init(borrower, item);

				currentLendProcess = new LendProcess();

				var that = this;

				window.removeEventListener("keydown", listener, true);
				window.addEventListener("keydown", listener = function(e) {
					// Only accept words that were typed really fast:
					if(Date.now()-lastLetter > 10)
						currentScan = "";
					else {
						// If letter was typed fast:
						// Blur eventually active input or select field
						document.activeElement.blur();
						e.preventDefault();
						e.stopPropagation();
					}

					if(e.keyCode == 13 && currentScan !== "") {
						scanListeners.forEach(function(scanListener) {
							scanListener(currentScan);
						});
						currentScan = "";
						return;
					}
					currentScan += String.fromCharCode(e.keyCode);
					lastLetter = Date.now();
				}, true);

				$("#cancel", control).bind("click", function() {
					that.newLendProcess();
				});

				$("select", control).bind("change", function() {

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
				window.removeEventListener("keydown", listener, true);
				done();
			}
		};
	}());

	connector.checkIn("leihen", api, function(main) {
		page.init(main, $("#borrower"), $("#item"));
	});

}());
