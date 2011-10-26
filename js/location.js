//geolocation
	
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


     
	 /*百度 马屁
(function(){        //闭包
	function load_script(xyUrl, callback){
		var head = document.getElementsByTagName('head')[0];
		var script = document.createElement('script');
		script.type = 'text/javascript';
		script.src = xyUrl;
		//借鉴了jQuery的script跨域方法
		script.onload = script.onreadystatechange = function(){
			if((!this.readyState || this.readyState === "loaded" || this.readyState === "complete")){
				callback && callback();
				// Handle memory leak in IE
				script.onload = script.onreadystatechange = null;
				if ( head && script.parentNode ) {
					head.removeChild( script );
				}
			}
		};
		// Use insertBefore instead of appendChild  to circumvent an IE6 bug.
		head.insertBefore( script, head.firstChild );
	}
	function translate(point,type,callback){
		var callbackName = 'cbk_' + Math.round(Math.random() * 10000);    //随机函数名
		var xyUrl = "http://api.map.baidu.com/ag/coord/convert?from="+ type + "&to=4&x=" + point.lng + "&y=" + point.lat + "&callback=BMap.Convertor." + callbackName;
		//动态创建script标签
		load_script(xyUrl);
		BMap.Convertor[callbackName] = function(xyResult){
			delete BMap.Convertor[callbackName];    //调用完需要删除改函数
			var point = new BMap.Point(xyResult.x, xyResult.y);

			callback && callback(point);
		}
	}

	window.BMap = window.BMap || {};
	BMap.Convertor = {};
	BMap.Convertor.translate = translate;
})();

*/