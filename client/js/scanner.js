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
			this._current = {};

			connector.listenFor(id, function(instance) {
				that._current.instance = instance;
				return that.api;
			});
		}

		Page.prototype = {
			id: null,
			title: null,
			url: null,
			_current: null,

			open: function open() {

				// load style:
				var style = document.createElement("link");
				style.rel = "stylesheet";
				style.type = "text/css";
				style.href = path+this.url+"/style.css";

				document.head.appendChild(style);
				this._current.style = style;

				// load script:
				var script = document.createElement("script");
				script.type = "text/javascript";
				script.src = path+this.url+"/script.js";

				document.head.appendChild(script);
				this._current.script = script;

				// load page:
				$.get(path+this.url+"/index.html", {}, function(data) {
					content.html(data);
				}, "html");

				return this;
			},

			close: function close(callback) {
				var that = this,
					done = function() {
						document.head.removeChild(that._current.script);
						document.head.removeChild(that._current.style);
						that._current.instance = that._current.script = that._current.style = null;
						callback();
					};
				if(this._current.instance == null || typeof this._current.instance.close !== "function")
					done();
				else
					this._current.instance.close(done);
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
				var done = function() {
					openedPage = pages[id].open();
					window.history.pushState({ id:id }, openedPage.title, id);
				};

				if(openedPage instanceof Page)
					openedPage.close(done);
				else
					done();
			},

			get hasOpenedPage() {
				return !!openedPage;
			}
		};
	}());

	var menu = (function() {

		var links;

		return {
			init: function init(menu) {
				links = menu.find("a");

				var startPage = window.location.pathname.substr(1),
					firstId;

				links.each(function(i) {
					var element = $(this),
						id = element.attr("href"),
						title = element.html(),
						url = element.attr("data-url");
					pages.addPage(id, title, url);

					if(!i)
						firstId = id;

					if(startPage == id)
						pages.openPage(id);

					element.bind("click", function(e) {
						pages.openPage(id);
						e.preventDefault();
					});
				});

				if(!pages.hasOpenedPage)
					pages.openPage(firstId);

			}
		};
	}());

	$(function() {
		pages.init($("content"), "static/pages/");
		menu.init($("menu"));
	});

}());
