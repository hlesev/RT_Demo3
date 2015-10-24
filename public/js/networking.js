$(function(){
	
	var socket = io();
	
	var isAutoModeOn = 'true' == $('#divAutoMode').attr("auto-mode");
	
	var imgID = 0;
	var table = $('<table cellspacing="0" border="0"></table>');
	for(var rowID=0; rowID<10; rowID++)
	{
		var row = $('<tr></tr>');
		for(var colID=0; colID<10; colID++)
		{
			var col = $('<td></td>');
			var img = $('<img height="50" width="50" border="0">').attr("id","img"+imgID).attr("bucketID",imgID++);
			col.append(img);
			row.append(col);
		}
		table.append(row);
	}
	$('#here_table').append(table);
	

	
	var showMessage = function( _msg )
	{		
		$('#RTViewport').attr("src",_msg);
	}

	socket.on('bucket-info', function(data){
		$("#BucketsDiv").append(data.bucketID+" ");
		startRendering( data );
	});
	
	
	function startRendering( rendererData ) 
	{
		var canvas = document.createElement("canvas");
		canvas.width = rendererData.regionW;
		canvas.height = rendererData.regionH;
		
		document.body.appendChild( canvas );
		
		var canvasContext = canvas.getContext("2d");

		var onWorkerMessage = function(e) 
		{
			switch (e.data[0]) {
				case 'result':

					canvasContext.putImageData(e.data[1], 0, 0);

					var dataURL = canvas.toDataURL();
					
					socket.emit('result-update', {"bucketID": rendererData.bucketID, "bucketImg": dataURL } );
		
					break;
				
				case 'finished':
					if( isAutoModeOn )
						socket.emit('ready-to-render');
					break;
				
				case 'debugRes':
					break;
			}
        };
					
		var imgData = canvasContext.createImageData(
				rendererData.regionW, 
				rendererData.regionH
			);
		
		this.rtWorker = new Worker("js/rt/Raytracer.js");
		this.rtWorker.onmessage = onWorkerMessage;
		this.rtWorker.postMessage([JSON.stringify(rendererData), imgData]); //seding message as array to the worker
	}
	
	$( "#btnStartRender" ).click(function() {
		socket.emit('ready-to-render');
	});
	
	$( "img" ).click(function() {
		var bucketID = $(this).attr("bucketID");
		socket.emit('release-bucket', bucketID);
	});
	
	socket.on('server-result-update', function(data){
		$('#img'+data.bucketID).attr("src",data.bucketImg);
	});

});