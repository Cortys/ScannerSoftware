(function() {

	var listener;

	var page = (function() {

		function LendProcess() {

			var that = this;

			this.handleScan = function handleScan(word) {

				if(word == null)
					word = "";

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
			_isReturn: null,
			_item: null,
			lender: null,

			handleScan: null,

			checkStatus: function checkStatus(scannedProperty) {
				var that = this;
				$.post("status", { borrower:this._borrower, item:this._item }, function(data) {
					// Render item/borrower if:
					// we got data for them
					// and they were scanned just before the checkStatus-call
					// or if they weren't scanned before, they gave us new information
					if(data.item && (scannedProperty == "item" || scannedProperty != "item" && data.item.id != that._item)) {
						// Third parameter of render call: Let the scan box blink red if true. Green elsewise.
						// An error (= red = true) will be indicated if the item was scanned by the user and the server responded with another item. This means, the scan was considered to be falsey.
						view.render("item", data.item, scannedProperty == "item" && data.item.id != that._item);
						that._item = data.item.id;
					}
					if(data.borrower && (scannedProperty == "borrower" || scannedProperty != "borrower" && (data.borrower.id != that._borrower || data.borrower.isReturn != that._isReturn))) {
						// Render call similar to the one for the item.
						view.render("borrower", data.borrower, scannedProperty == "borrower" && data.borrower.id != that._borrower);
						that._borrower = data.borrower.id;
						that._isReturn = data.borrower.isReturn;
					}

					// If the scanned property gave no result at all: reset.
					if(scannedProperty && !data[scannedProperty]) {
						that["_"+scannedProperty] = null;
						view.reset(scannedProperty);
					}
				}, "json").fail(function(err) {
					that._item = that._borrower = null;
					view.reset();
				});
			},

			proceed: function proceed(success) {
				page.removeScanListener(this.handleScan);
				var that = this;
				$.post("handleLendProcess", {
					borrower: this._borrower,
					item: this._item,
					lender: this.lender
				}, function(data) {
					if(data.success) {
						view.showSuccess();
						that.close(success);
					}
					else
						view.showFailure();
				}, "json").fail(function(err) {
					view.showFailure();
				});
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
			lastActive,
			scanListeners = new Set();

		var view = {

			waiting: Symbol("waiting"),

			borrower: null,
			item: null,
			_borrowerSet: false,
			_itemSet: false,
			_isReturn: false,

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

			showSuccess: function() {
				this.reset(undefined, true);
				$("#success").addClass("shown");
				setTimeout(function() {
					$("#success").removeClass("shown");
				}, 10);
			},

			showFailure: function() {
				var pTags = this.borrower.add(this.item).children("p");
				pTags.addClass("red");
				setTimeout(function() {
					pTags.removeClass("red");
				}, 10);
			},

			render: function(pTarget, data, doBlinkRed) {

				var target = this[pTarget],
					color = doBlinkRed?"red":"green";

				if(!data)
					return;
				console.log(data);
				var pTags = target.children("p").html(data.id == this.waiting?"...":data.id);

				if(data.id && data.id != this.waiting) {

					pTags.addClass(color);
					setTimeout(function() {
						pTags.removeClass(color);
					}, 10);

					this["_"+pTarget+"Set"] = true;
				}

				if(pTarget == "borrower")
					this._isReturn = data.isReturn;

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
					$("#confirm").show().val(this._isReturn?"Zurücknehmen":"Verleihen");
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
						// Ignore input in textfield

						if(lastActive && currentScan.length <= 1 && lastActive.tagName.toUpperCase() == "INPUT")
							lastActive.value = lastActive.value.slice(0, -1);
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
					lastActive = document.activeElement;
				}, true);

				$("#cancel", control).bind("click", function() {
					that.newLendProcess();
				});

				$("#confirm", control).bind("click", function() {
					if(!currentLendProcess)
						return;
					currentLendProcess.lender = $("select", control).val();
					currentLendProcess.proceed(function() {
						that.newLendProcess();
					});
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
