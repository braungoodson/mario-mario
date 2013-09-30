luigi
=====

Quick and easy class for defining your plumbing with express.io for HTTP and Socket IO.


Usage
=====

<pre>
var luigi = require('luigi');
luigi.plumbing({
	port: 10000,
	http: {
		get: {
			'/' : function (q,r) {
				return r.send('&lt;!doctype html>&lt;html>&lt;script src=\'socket.io/socket.io.js\'>&lt;/script>&lt;/html>');
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
</pre>
