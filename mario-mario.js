module.exports = {
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
			this.server.post(p,posts[p]);
		}
	},
	parseGets: function (gets) {
		for (var g in gets) {
			if (this.debug) {
				console.log('http://localhost:'+this.port+g+' -> '+gets[g]);
			}
			this.server.get(g,gets[g]);
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
		if (routes.port) {
			this.port = routes.port;
		} else {
			this.port = 10000;
		}
		if (routes.debug) {
			this.debug = routes.debug;
		} else {
			this.debug = false;
		}
		this.server = require('express.io')();
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