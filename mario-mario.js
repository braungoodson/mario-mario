var fs = require('fs');
var files = [];
// TODO: Heapify users!
var users = [];
module.exports = {
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
					f(q);
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
					f(q,r);
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
					f(q,r);
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
		this.parseRoutes(routes);
		return this;
	}
}

/*

	Usage:

	var mario = require('mario');
	mario.plumbing({
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
