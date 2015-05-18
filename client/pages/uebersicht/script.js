(function() {

	var filter = (function() {

		var domFilters,
			domHeaders;

		return {
			init: function(pDomFilters, pDomHeaders) {
				domFilters = pDomFilters;

				domHeaders = pDomHeaders;

				domFilters.on("click", function() {
					domFilters.filter(".active").removeClass("active");
					$(this).addClass("active");
					table.endedLendings = this.getAttribute("data-ended")*1;
				});

				var that = this;

				domHeaders.on("click", function() {
					that.sortHeader.children("span").html("");

					var v = $(this),
						column = v.attr("data-column"),
						asc = that.sortHeader[0] == this ? !table.order.asc : (v.attr("data-is-date") ? false : true);

					v.children("span").html(" "+(asc ? "&#x2191;": "&#x2193;"));

					table.order = {
						column: column,
						asc: asc
					};
				});
			},

			get sortHeader() {
				return domHeaders.filter("[data-column="+table.order.column+"]");
			}
		};
	}());

	var table = (function() {

		var domTable,
			headers = [],
			request = {
				endedLendings: false,
				order: {
					column: "start",
					asc: false
				}
			};

		return {
			init: function(pDomTable) {
				domTable = pDomTable;

				domTable.find("tr th").each(function(i,e) {
					headers.push({
						name: e.getAttribute("data-column"),
						isDate: e.getAttribute("data-is-date")
					});
				});

				this.update();
			},

			get endedLendings() {
				return request.endedLendings;
			},

			set endedLendings(value) {
				request.endedLendings = !!value;
				this.update();
			},

			get order() {
				return Object.create(request.order);
			},

			set order(value) {
				request.order.column = value.column;
				request.order.asc = !!value.asc;
				this.update();
			},

			update: function() {
				$.post("/lendings", request, function(result) {
					domTable.find("tr.entry").remove();
					result.forEach(function(row, i) {
						var rowHtml = "<tr class='entry'>";
						headers.forEach(function(column) {

							var insert = row[column.name];

							if(insert != null && column.isDate)
								insert = function(a) {
									var date = new Date(a);
									return nullFill(date.getDate(), 2) + "." + nullFill(date.getMonth()+1, 2) + "." + date.getFullYear() + " " + nullFill(date.getHours(), 2) + ":" + nullFill(date.getMinutes(), 2);
								}(insert);
							else if(insert == null)
								insert = "-";

							rowHtml += "<td>"+insert+"</td>";
						});
						rowHtml += "</tr>";
						domTable.append(rowHtml);
					});
				});
			}
		};
	}());

	var api = (function() {
		return {
			close: function close(done) {
				done();
			}
		};
	}());

	connector.checkIn("uebersicht", api, function(main) {
		table.init($("#overview table"));
		filter.init($("#filter button"), $("#overview table th"));
	});

}());
