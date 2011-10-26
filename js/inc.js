// HTML5 Web SQL Database
	/*geolocation  */
	
	var touchTime = 1 ;	
	var msg;




	var geolocationJson = new Object();
	var bm = new BMap.Map("container");
	var newgps_x , newgps_y;




	jQuery(window).ready(function(){  
		jQuery("#btnInit").click(initiate_geolocation); 
		jQuery("#btnClen").click(clearn_log); 
		jQuery("#btnSave").click(save_log); 
		jQuery("#btnLoad").click(load_log); 

		if (openDatabase) {
		  var db = openDatabase('node_123', '1.0', 'Test DB', 2 * 1024 * 1024); 


			db.transaction(function (tx) {
				tx.executeSql('SELECT * FROM LOGS ORDER BY id DESC', [], function (tx, results) {
					touchTime = results.rows.item(0).id + 1;
				}, null);
			});

		} else {
		  errorCallback('not supported web SQL database');
		}
		

	});  

