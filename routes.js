
module.exports = function(app,io, freeBuckets){
	
	var clients = [];
	var requestedBuckets = [];
	var nextBucket = 0;

	app.get('/', function(req, res){
		var clientID = Math.round((Math.random() * 1000000));
		res.render('client', {client_id : clientID, is_server:false, auto_mode:false});
	});
	
	app.get('/server', function(req, res){
		var clientID = Math.round((Math.random() * 1000000));
		res.render('server', {client_id : clientID, is_server:true});
	});
	
	app.get('/clear', function(req, res){
		freeBuckets = freeBuckets.concat( requestedBuckets );
		requestedBuckets = [];
		res.status(200).send("All cleared!");
	});
	
	app.get('/auto', function(req, res){
		var clientID = Math.round((Math.random() * 1000000));
		res.render('client', {client_id : clientID, is_server:false, auto_mode:true});
	});

	io.sockets.on('connect', function(client) {
		
		clients.push(client); 
		
		console.log( "Connected: " + client.id );
	
		client.on('disconnect', function() {
			clients.splice(clients.indexOf(client), 1);
			console.log( "Disconnect: " + client.id );
		});
	});
	
	function findBucketByID(source, searchVal) 
	{
		for (var i = 0; i < source.length; i++) {
			var elem = source[i];
			
			if (elem.bucketID == searchVal) {
				return elem;
			}
		}
		return null;
	}
	
	io.sockets.on('connection', function(socket) {
		
		socket.on('ready-to-render', function(data){
			
			if( freeBuckets.length > 0 )
			{
				var bucket = freeBuckets.pop();
				requestedBuckets.push(bucket);
				bucket.clientID = socket.client.id;
				
				socket.emit('bucket-info', bucket);
			}
		});
		
		socket.on('release-bucket', function(data){
			
			console.log("release: "+data);
			
			var bucket = findBucketByID( requestedBuckets, data );
			console.log("released bucket: "+bucket);
			
			if( null!=bucket )
			{
				freeBuckets.push( bucket );
				
				var index = requestedBuckets.indexOf( bucket );
				if (index > -1) {
					requestedBuckets.splice(index, 1);
				}
			}
			
		});
		
		//socket.emit('result-update', {"bucketID": rendererData.bucketID, "bucketImg": dataURL } );

		socket.on('result-update', function(data){
			socket.broadcast.emit('server-result-update', data);
		});
		
		socket.on('msg', function(data){
			
			console.log('msg:' /*+ data*/);
		});
	});
	
}