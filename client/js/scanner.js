var connector = (function() {

	var listeners = {};

	return {
		checkIn: function(id, page, callback) {
			if(id in listeners)
				listeners[id].forEach(function(value, index) {
					var result = value(page);
					if(!index)
						callback(result);
				});
		},
		listenFor: function(id, listener) {
			if(!(id in listeners))
				listeners[id] = [];
			listeners[id].push(listener);
		}
	};
}());

(function() {

	var pages = (function() {

		function Page(id, title, url) {

			var that = this;

			this.id = id;
			this.title = title;
			this.url = url;

			connector.listenFor(id, function(instance) {
				that.currentInstance = instance;
				return that.api;
			});
		}

		Page.prototype = {
			id: null,
			title: null,
			url: null,
			currentInstance: null,

			open: function open() {
				$.get(path+this.url, {}, function(data) {
					content.html(data);
				}, "html");
				return this;
			},

			close: function close() {
				return this;
			},

			api: {}
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
