(function(window){
	"use strict";
	var routerMcRouter;

	routerMcRouter = (function(){
		function routerMcRouter(baseUrl){
			if(!this){
				return new routerMcRouter();
			}
			this.baseUrl = baseUrl || "";
			this.routes = [];
			window.onpopstate = handlePop.bind(this);
		}
		//routerMcRouter.prototype.routes = [];
		routerMcRouter.prototype.currentState = window.location.pathname;
		routerMcRouter.prototype.register = function(uri, fn){
			var keys =[], reg;
			if(!uri || !fn){
				throw "Both arguments must be provided";
			}
			if(typeof fn !== "function"){
				throw "second argument must be a function";
			}
			if(typeof uri !== "string"){
				throw "first argument must be a string";
			}
			reg = routeToRegexp(uri, keys);
			this.routes.push({regExp:reg, fn:fn, keys:keys});
		};
		routerMcRouter.prototype.isRegistered = function(uri){
			var match, i, len = this.routes.length;
			for(i=0; i<len; i++){
				match = this.routes[i].regExp.exec(uri);
				if(match){
					return true;
				}
			}
		};
		routerMcRouter.prototype.executeUri = function(uri, data){
			var len = this.routes.length,
				i, j , match, route,
				ky = {};
				console.log(uri)
			for(i=0; i<len; i++){
				match = this.routes[i].regExp.exec(uri);
				if(match){
					route = this.routes[i];
					break;
				}
			}
			if(route){
				for(i = 0, j = 1; i<route.keys.length; i++, j++){
					ky[route.keys[i].name] = match[j];
				}
				route.fn.call(null, data, ky);
			}
			
		};
		routerMcRouter.prototype.navigate = function(uri, data){
			if(!uri || typeof uri !== "string"){
				throw "Must provide a uri to navigate to!";
			}
			if(this.isRegistered(uri)){
				window.history.pushState(data, "title", uri);
				this.executeUri(uri, data);
			}
		};
		function handlePop(e){
			var uri = e.currentTarget.location.pathname + e.currentTarget.location.hash,
				state = e.state || {};
				state.previousUri = this.currentState;
				console.log(e.currentTarget.location);
				console.log("popstate says: " +uri);

			if(this.isRegistered(uri)){
				this.executeUri(uri, state);
				this.currentState = uri;
			}
			else if(this.currentState === uri){
				this.executeUri(uri, {});
			}
		};

		function routeToRegexp(path, keys, sensitive, strict) {
			if (path instanceof RegExp) return path;
			if (Array.isArray(path)) path = '(' + path.join('|') + ')';
			path = path
				.concat(strict ? '' : '/?')
				.replace(/\/\(/g, '(?:/')
				.replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?(\*)?/g, function(_, slash, format, key, capture, optional, star){
					keys.push({ name: key, optional: !! optional });
					slash = slash || '';
					return ''
						+ (optional ? '' : slash)
						+ '(?:'
						+ (optional ? slash : '')
						+ (format || '') + (capture || (format && '([^/.]+?)' || '([^/]+?)')) + ')'
						+ (optional || '')
						+ (star ? '(/*)?' : '');
				})
				.replace(/([\/.])/g, '\\$1')
				.replace(/\*/g, '(.*)');
				console.log(new RegExp('^' + path + '$', sensitive ? '' : 'i'))
			return new RegExp('^' + path + '$', sensitive ? '' : 'i');
		}
		
	
	return routerMcRouter;
	}());
	
	window.routerMcRouter = routerMcRouter;
	window.rmr = window.routerMcRouter;
}(window));