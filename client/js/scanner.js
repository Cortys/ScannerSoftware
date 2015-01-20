(function() {

	var pages = (function() {

		function Page(id, title, url) {
			this.id = id;
			this.title = title;
			this.url = url;
		}

		Page.prototype = {
			id: null,
			title: null,
			url: null,

			open: function open() {
				console.log(path+this.url);
				$.get(path+this.url, {}, function(data) {
					content.html(data);
				}, "html");
				return this;
			},

			close: function close() {
				return this;
			}
		};

		var pages = {},
			openedPage,
			content, path;

		return {

			init: function init(pContent, pPath) {
				content = pContent;
				path = pPath;
			},

			addPage: function addPage(id, title, url) {
				if(id in pages)
					return false;
				pages[id] = new Page(id, title, url);
				return true;
			},
			openPage: function openPage(id) {
				if(openedPage instanceof Page)
					openedPage.close();
				openedPage = pages[id].open();
				window.history.pushState({ id:id }, openedPage.title, id);
			}
		};
	}());

	var menu = (function() {

		var links;

		return {
			init: function init(menu) {
				links = menu.find("a");

				links.each(function(i) {
					var element = $(this),
						id = element.attr("href"),
						title = element.html(),
						url = element.attr("data-url");
					pages.addPage(id, title, url);

					if(element.hasClass("active"))
						pages.openPage(id);

					element.bind("click", function(e) {
						pages.openPage(id);
						e.preventDefault();
					});
				});
			}
		};
	}());

	$(function() {
		pages.init($("content"), "static/pages/");
		menu.init($("menu"));
	});

}());
