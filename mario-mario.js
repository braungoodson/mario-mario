var fs = require('fs');
var files = [];
// TODO: Heapify users!
var users = [];
module.exports = {
	cache: {
		storeFile: function (f) {
			fs.readFile(f,function(e,d){
				if (e) {
					console.log('Error: Could not read file: %s',f);
				} else {
					files[f] = d;
					console.log('Cache: File %s is now cached!',f);
				}
			});
		},
		storeUser: function (u) {
			users.push(u);
		}
	},
	express: null,
	server: null,
	port: null,
	debug: null,
	parseIos: function (ios) {
		for (var io in ios) {
			if (this.debug) {
				console.log('socket://'+io+' -> '+ios[io]);
			}
			this.server.io.route(io,(function(server,f){
				return function (q) {
					q.io.broadcast = server.io.broadcast;
					f(q,files,users);
				}
			}(this.server,ios[io])));
		}
	},
	parsePosts: function (posts) {
		for (var p in posts) {
			if (this.debug) {
				console.log('http://localhost:'+this.port+p+' -> '+posts[p]);
			}
			this.server.post(p,(function(f){
				return function (q,r) {
					f(q,r,files,users);
				}
			})(posts[p]));
		}
	},
	parseGets: function (gets) {
		for (var g in gets) {
			if (this.debug) {
				console.log('http://localhost:'+this.port+g+' -> '+gets[g]);
			}
			this.server.get(g,(function(f){
				return function (q,r) {
					f(q,r,files,users);
				}
			})(gets[g]));
		}
	},
	parseRoutes: function(routes) {
		if (routes.http) {
			if (routes.http.get) {
				this.parseGets(routes.http.get);
			}
			if (routes.http.post) {
				this.parsePosts(routes.http.post);
			}
		}
		if (routes.socket) {
			this.parseIos(routes.socket);
		}
	},
	parseFileCache: function (A) {
		for (var i in A) {
			this.cache.storeFile(A[i]);
		}
	},
	plumbing: function (routes) {
		this.port = process.env.PORT || 10000;
		if (routes.debug) {
			this.debug = routes.debug;
		} else {
			this.debug = false;
		}
		this.express = require('express.io');
		this.server = this.express();
		this.server.use(this.express.cookieParser());
		this.server.use(this.express.session({
			secret: 'This is my secret, and I can use it if I want to.'
		}));
		this.server.http().io();
		this.server.listen(this.port);
		this.parseFileCache(routes.fileCache);
		this.parseRoutes(routes);
		return this;
	}
}

/*

	Usage:

	var mario = require('mario');
	mario.plumbing({
		port: 10000,
		http: {
			get: {
				'/' : function (q,r) {
					return r.send('<!doctype html><html><script src=\'socket.io/socket.io.js\'></script></html>');
				},
				'/echo' : function (q,r) {
					return r.send({
						echo : 'GET /echo'
					});
				}
			},
			post: {
				'/echo' : function (q,r) {
					return r.send({
						echo : 'POST /echo'
					});
				}
			}
		},
		socket: {
			'unicast:echo' : function (q) {
				return q.io.emit('unicast:echo','unicast:echo');
			},
			'broadcast:echo' : function (q) {
				return q.io.broadcast('broadcast:echo','broadcast:echo');
			}
		}
	});
*/
