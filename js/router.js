
(function () {
  "use strict";

  var routerMcRouter;
  function isFunction(fn) {
    if (typeof fn !== "function") {
      return false;
    } else {
      return true;
    }
  }
  routerMcRouter = (function () {
    function routerMcRouter(baseUrl) {
      if (!this) {
        return new routerMcRouter();
      }
      this.baseUrl = baseUrl || "";
      this.routes = [];
      this.navigationListeners = [];
      this._defaultRoute = false;
      this.routeMatched = false;
      this.currentState = getURL(window.location, this._routeFromHash);
      window.onpopstate = handlePop.bind(this);
    }
    //routerMcRouter.prototype.routes = [];

    function getURL(location, hashMode) {

      if (hashMode) {
        var hash = location.hash.split("#");
        var query = "";
        if (location.search) {
          query = location.search;
          hash[1] = hash[1].split("?");
          hash[1] = hash[1][0] + (location.search || "");
        }

        if (hash.length < 2) {

          return "/" + query;
        } else {

          return hash[1];
        }
      } else {
        return location.pathname + location.search;
      }
    }

    routerMcRouter.prototype.onNavigate = function (callback) {
      this.navigationListeners.push(callback);
    };

    routerMcRouter.prototype.hashMode = function (yes) {
      this._routeFromHash = yes;
      this.currentState = getURL(window.location, this._routeFromHash);
    };

    routerMcRouter.prototype.register = function (uri, fn) {
      var keys = [],
          reg;
      if (!uri || !fn) {
        throw "Both arguments must be provided";
      }
      if (!isFunction(fn)) {
        throw "second argument must be a function";
      }
      if (typeof uri !== "string") {
        throw "first argument must be a string";
      }
      reg = routeToRegexp(uri, keys);

      this.routes.push({ regExp: reg, fn: fn, keys: keys });
      var URL = getURL(window.location, this._routeFromHash);
      if (reg.exec(URL)) {
        this.executeUri(URL);
      }
    };
    routerMcRouter.prototype.defaultRoute = function (callback) {
      if (!isFunction(callback)) {
        throw "Argument must be a function";
      }
      this._defaultRoute = callback;

      if (!this.routeMatched) {

      }
    };

    routerMcRouter.prototype.redirect = function (uri, data) {
      if (!uri || typeof uri !== "string") {
        throw "Must provide a uri to navigate to!";
      }
      if (this.executeUri(uri, data)) {
        if (this._routeFromHash) {
          uri = "/#" + uri;
        }
        window.history.replaceState(data, "title", uri);
      }
    };
    routerMcRouter.prototype.executeUri = function (uri, data) {
      var that = this;
      var DidNavigate = false;
      var len = this.routes.length,
          i,
          j,
          match,
          route,
          ky = {};
      var URINoQueryString = uri.split("?");
      URINoQueryString = URINoQueryString[0];
      this.routeMatched = false;
      if (!URINoQueryString) {
        URINoQueryString = uri;
      }
      for (i = 0; i < len; i++) {
        match = this.routes[i].regExp.exec(URINoQueryString);
        if (match) {
          route = this.routes[i];
          for (var r = 0, j = 1; i < route.keys.length; i++, j++) {
            ky[route.keys[r].name] = match[j];
          }
          route.fn.call(that, data, ky);
          DidNavigate = true;
          this.routeMatched = true;
        }
      }
      if (!DidNavigate) {
        if (this._defaultRoute) {
          DidNavigate = true;
          this._defaultRoute.call(this, uri, data);
        }
      }
      this.navigationListeners.forEach(function (l) {
        l.call(that, uri);
      });
      return DidNavigate;
    };
    routerMcRouter.prototype.navigate = function (uri, data) {
      if (!uri || typeof uri !== "string") {
        throw "Must provide a uri to navigate to!";
      }

      if (this.executeUri(uri, data)) {
        if (this._routeFromHash) {
          uri = "/#" + uri;
        }
        window.history.pushState(data, "title", uri);
      }
    };
    function handlePop(e) {
      var that = this;

      var uri = getURL(e.currentTarget.location, this._routeFromHash),
          state = e.state || {};
      state.previousUri = this.currentState;
      e.preventDefault();
      if (this.executeUri(uri, state)) {
        this.currentState = uri;
      } else if (this.currentState === uri) {
        this.executeUri(uri, {});
      }
      this.navigationListeners.forEach(function (l) {
        l.call(that, uri);
      });
    };

    function routeToRegexp(path, keys, sensitive, strict) {
      if (path instanceof RegExp) return path;
      if (Array.isArray(path)) path = '(' + path.join('|') + ')';
      path = path.concat(strict ? '' : '/?').replace(/\/\(/g, '(?:/').replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?(\*)?/g, function (_, slash, format, key, capture, optional, star) {
        keys.push({ name: key, optional: !!optional });
        slash = slash || '';
        return '' + (optional ? '' : slash) + '(?:' + (optional ? slash : '') + (format || '') + (capture || format && '([^/.]+?)' || '([^/]+?)') + ')' + (optional || '') + (star ? '(/*)?' : '');
      }).replace(/([\/.])/g, '\\$1').replace(/\*/g, '(.*)');
      return new RegExp('^' + path + '$', sensitive ? '' : 'i');
    }

    return routerMcRouter;
  })();
  var module = module;
  if (module && module.exports) {
    module.exports = routerMcRouter;
  } else {
    window.routerMcRouter = routerMcRouter;
    window.rmr = window.routerMcRouter;
  }
})();

