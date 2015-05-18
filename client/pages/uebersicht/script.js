(function() {

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

			update: function() {
				$.post("/lendings", request, function(result) {
					domTable.children("tr.entry").remove();

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
	});

}());
