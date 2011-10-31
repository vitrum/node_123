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
		jQuery("#btnSync").click(Sync_log); 
		
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


		// the user clicked to 'reconnect' button  
		$('#host_connect').click(function () {  
			debug("\n");  
			connect($('#host').val());  
		});  

		// the user clicked the send button  
		/*
		$('#console_send').click(function () {  
			var locationInfo ;
			db.transaction(function (tx) {
						tx.executeSql('SELECT * FROM LOGS ORDER BY id DESC', [], function (tx, results) {
							locationInfo = results.rows.item(0).latitude + ',' = results.rows.item(0).longitude ;
						}, null);
					});
			ws_send(locationInfo);  
		});   
		*/  

        $('#console_send').click(function () {  
            ws_send($('#console_input').val());  

        });  
          
        $('#console_input').keyup(function (e) {  
            if(e.keyCode == 13) // enter is pressed  
                ws_send($('#console_input').val());  
        }); 

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


function initiate_geolocation() {  

		if (navigator.geolocation) {
		  navigator.geolocation.getCurrentPosition(handle_geolocation_query,errorCallback);  
		} else {
		  errorCallback('not supported');
		}

	}  

	function errorCallback(msg) {
	  // Update a div element with error.message.
	  var s = document.querySelector('#status');
	  s.innerHTML = typeof msg == 'string' ? msg : "failed to get geolacation";
	  s.className = 'fail';
	  
	}
        
	function handle_geolocation_query(position){  
		var tempTime = new Date(position.timestamp);
		touchTime = touchTime + 1 ;
		var text =  "touchTime:" + touchTime + "<br/>" + 
				"Latitude: "  + position.coords.latitude  + "<br/>" +  
				"Longitude: " + position.coords.longitude + "<br/>" + 
				//"altitude: " + position.coords.altitude + "<br/>" +  
				//"heading: " + position.coords.heading + "<br/>" +  
				//"speed: " + position.coords.speed + "<br/>" +  
				"Accuracy: "  + position.coords.accuracy  + "m<br/>" +  
				"Time: " + new Date(position.timestamp)+ "<br/><br/>" ;

		jQuery("#info").prepend(text); 
		geolocationJson = position.coords;
		
		db.transaction(function (tx) {
			tx.executeSql('CREATE TABLE IF NOT EXISTS LOGS (id unique, latitude, longitude ,accuracy ,timestamp )');
			var tmpTxt = '"' + position.coords.latitude + '",' + 
						'"' + position.coords.longitude + '",'+ 
						'"' + position.coords.accuracy + '",'+ 
						'"' + tempTime + '"' ;
			var upTxt = 'INSERT INTO LOGS (id , latitude, longitude ,accuracy ,timestamp) VALUES (' + touchTime + ', ' + tmpTxt + ')';
			//alert(upTxt);
			tx.executeSql(upTxt);
			msg = '<p>Log message created and row inserted. ' + upTxt + '</p>';
			document.querySelector('#status').innerHTML =  msg;
			var jsonTxt = "['latitude':'"+ position.coords.latitude +"','longitude':'"+ position.coords.longitude +"']";  
			var jsonTxtObj = jsonTxt;
			ws_send(jsonTxtObj); 
		});

		

		/* baidu map 
		var point = new BMap.Point(position.coords.longitude, position.coords.latitude);

		bm.centerAndZoom(point, 19);
		bm.addControl(new BMap.NavigationControl());
		
		BMap.Convertor.translate(new BMap.Point(position.coords.longitude,position.coords.latitude),0,translateOptions);
		*/

	}  

	translateOptions = function (point){
		bm.clearOverlays();
		var marker = new BMap.Marker(point);
		bm.addOverlay(marker);
		bm.setCenter(point);
		document.getElementById("baiduXY").innerHTML = point.lng + "," + point.lat;

		newgps_x = point.lng;
		newgps_y = point.lat;
		//alert(point.lng + ',' + point.lat);
	}

	function clearn_log() {  
		var text = "";
		jQuery("#info").html(text);
		touchTime = 1 ;
		
	}  
	function save_log() {  
		var text = "";
		geolocationJson = jQuery("#info").html();
		jQuery("#info").html(text);
		

	}  
	function sync_log() {  
		db.transaction(function (tx) {
		  tx.executeSql('SELECT * FROM LOGS', [], function (tx, results) {
		   var len = results.rows.length, i;
		   for (i = 0; i < len; i++){
				var jsonTxt = "['latitude':'"+ results.rows.item(i).latitude +"','longitude':'"+ results.rows.item(i).longitude +"']";  
				var jsonTxtObj = jsonTxt;
				ws_send(jsonTxtObj); 
			 
			 //msg = "<p><b>touchNo. :" + results.rows.item(i).id + "</b>, Time :" + results.rows.item(i).timestamp + "</p>";
			 //document.querySelector('#status').innerHTML +=  msg;
		   }
		 }, null);
		});		

	} 
	function load_log() {  
		var text = "";
		jQuery("#info").html(text);
		jQuery("#info").html(geolocationJson);

		//load web sql
		db.transaction(function (tx) {
		  tx.executeSql('SELECT * FROM LOGS', [], function (tx, results) {
		   var len = results.rows.length, i;
		   msg = "<p>Found rows: " + len + "</p>";
		   document.querySelector('#status').innerHTML +=  msg;
		   for (i = 0; i < len; i++){
			 msg = "<p><b>touchNo. :" + results.rows.item(i).id + "</b>, Time :" + results.rows.item(i).timestamp + "</p>";
			 document.querySelector('#status').innerHTML +=  msg;
		   }
		 }, null);
		});
	}  