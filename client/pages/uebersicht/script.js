(function() {

	var filter = (function() {

		var domFilters;

		return {
			init: function(pDomFilters) {
				domFilters = pDomFilters;

				domFilters.on("click", function() {
					domFilters.filter(".active").removeClass("active");
					$(this).addClass("active");
					table.endedLendings = this.getAttribute("data-ended")*1;
				});
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
					headers.push(e.getAttribute("data-column"));
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

			update: function() {
				$.post("/lendings", request, function(result) {
					domTable.find("tr.entry").remove();
					result.forEach(function(row, i) {
						var rowHtml = "<tr class='entry'>";
						headers.forEach(function(column) {
							rowHtml += "<td>"+row[column]+"</td>";
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
		filter.init($("#filter button"));
	});

}());
