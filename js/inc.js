// HTML5 Web SQL Database
	/*geolocation  */
	
	var touchTime = 1 ;	
	var msg;
	var db = openDatabase('node_123', '1.0', 'Test DB', 2 * 1024 * 1024); 



	var geolocationJson = new Object();
	var bm = new BMap.Map("container");
	var newgps_x , newgps_y;
	var host = 'ec2-184-73-9-238.compute-1.amazonaws.com';  
    var port = 8080;  
    var url = 'ws://'+host+':'+port+'/';  
    var ws; 



	jQuery(window).ready(function(){  
		jQuery("#btnInit").click(initiate_geolocation); 
		jQuery("#btnClen").click(clearn_log); 
		jQuery("#btnSave").click(save_log); 
		jQuery("#btnLoad").click(load_log); 
		
		//load database
		if (openDatabase) {
			db.transaction(function (tx) {
				tx.executeSql('SELECT * FROM LOGS ORDER BY id DESC', [], function (tx, results) {
					touchTime = results.rows.item(0).id + 1;
				}, null);
			});

		} else {
		  errorCallback('not supported web SQL database');
		}

		// send socket
		if ("WebSocket" in window) {
			debug("Browser supports web sockets!", 'success');
			connect($('#host').val());
			$('#console_send').removeAttr('disabled');
		} else {
			debug("Browser does not support web sockets", 'error');
		};
	});  

// function to send data on the web socket
function ws_send(str) {
	try {
		ws.send(str);
	} catch (err) {
		debug(err, 'error');
	}
}
// connect to the specified host  
function connect(host) {  

	debug("Connecting to " + host + " ...");  
	try {  
		ws = new WebSocket(host); // create the web socket  
	} catch (err) {  
		debug(err, 'error');  
	}  
	$('#host_connect').attr('disabled', true); // disable the 'reconnect' button  

	ws.onopen = function () {  
		debug("connected... ", 'success'); // we are in! :D  
	};  

	ws.onmessage = function (evt) {  
		debug(evt.data, 'response'); // we got some data - show it omg!!  
	};  

	ws.onclose = function () {  
		debug("Socket closed!", 'error'); // the socket was closed (this could be an error or simply that there is no server)  
		$('#host_connect').attr('disabled', false); // re-enable the 'reconnect button  
	};  
};  
// function to display stuff, the second parameter is the class of the <p> (used for styling)  
function debug(msg, type) {  
	$("#console").append('<p class="' + (type || '') + '">' + msg + '</p>');  
};  

function getNewLocationInfo(msg, type) {  
	$("#console").append('<p class="' + (type || '') + '">' + msg + '</p>');  
};


// the user clicked to 'reconnect' button  
$('#host_connect').click(function () {  
	debug("\n");  
	connect($('#host').val());  
});  

// the user clicked the send button  
$('#console_send').click(function () {  
	var locationInfo ;
	db.transaction(function (tx) {
				tx.executeSql('SELECT * FROM LOGS ORDER BY id DESC', [], function (tx, results) {
					locationInfo = results.rows.item(0).latitude + ',' = results.rows.item(0).longitude ;
				}, null);
			});
	ws_send(locationInfo);  
});  
  
$('#console_input').keyup(function (e) {  
	if(e.keyCode == 13) // enter is pressed  
		ws_send($('#console_input').val());  
});  