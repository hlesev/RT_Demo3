var express = require('express'),
	app = express();

var port = process.env.PORT || 8080;

var io = require('socket.io').listen(app.listen(port));

var bucketsInfo = [];

var bucketID = 0;
for( var y=0; y<10; ++y )
{
	for( var x=0; x<10; ++x )
	{
		
		var bucket = {
			"regionX":x*50, "regionW":50,
			"regionY":y*50, "regionH":50,
			"screenW":500, 
			"screenH":500,
			"bucketID": bucketID++,
			"clientID" : "-",
			
			"traceMode": "trace",
			"sceneURI" : "scenes/cornellbox-e.ml.txt"
			};
		bucketsInfo.push(bucket);	
		
	}
}

bucketsInfo.sort(function(a, b){
	return .5 - Math.random();
});

app.set('view engine', 'html');

app.engine('html', require('ejs').renderFile);

app.set('views', __dirname + '/views');

app.use(express.static(__dirname + '/public'));
	
require('./routes')(app, io, bucketsInfo);

//console.log('Your application is running on http://localhost:' + port);