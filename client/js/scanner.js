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

				this._current.script = script;

				// load page:
				$.get(path+this.url+"/index.html", {}, function(data) {
					content.html(data);
					document.head.appendChild(script);
				}, "html").fail(function() {
					content.html("");
				});

				return this;
			},

			close: function close(callback) {
				var that = this,
					done = function() {
						content.html("");
						if(document.head.contains(that._current.script))
							document.head.removeChild(that._current.script);
						if(document.head.contains(that._current.style))
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
			openPage: function openPage(id, callback) {
				var page = pages[id];
				if(!page)
					return;
				var done = function() {
					openedPage = page.open();
					callback({
						id: page.id,
						title: page.title,
						url: page.url
					});
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

		var links,
			activeLink;

		return {
			init: function init(menu) {
				links = menu.find("a");

				var that = this,
					startPage = window.location.pathname.substr(1);

				links.each(function(i) {
					var element = $(this),
						id = element.attr("href"),
						title = element.html(),
						url = element.attr("data-url");

					pages.addPage(id, title, url);
					if(startPage == id)
						that.activateLink(element);

					element.bind("click", function(e) {
						that.activateLink(element);
						e.preventDefault();
					});
				});

				if(!pages.hasOpenedPage)
					this.activateLink(links.first(), "replace");

				window.addEventListener("popstate", function(e) {
					if(e.state && e.state.id)
						that.activateLink(links.filter("[href="+e.state.id+"]"), true);
				}, false);
			},
			activateLink: function(link, type) {
				if(activeLink)
					activeLink.removeClass("active");
				activeLink = link;
				activeLink.addClass("active");
				pages.openPage(link.attr("href"), function(page) {
					if(!type)
						window.history.pushState(page, page.title, page.id);
					else if(type == "replace")
						window.history.replaceState(page, page.title, page.id);
				});
			}
		};
	}());

	var activityManager = (function() {
		var lastFocus;
		return {
			init: function init(overlay) {
				document.addEventListener("visibilitychange", function() {
					console.log(document.visibilityState);
					overlay[document.visibilityState=="visible"?"hide":"show"]();
				}, false);

				setInterval(function() {
					if(lastFocus == (lastFocus = document.hasFocus()))
						return;
					overlay[lastFocus?"hide":"show"]();
				}, 200);
			}
		};
	}());

	$(function() {
		pages.init($("content"), "static/pages/");
		menu.init($("menu"));
		activityManager.init($("#overlay"));
	});

}());
