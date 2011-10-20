var conns = new Array();  
var ws = require('./lib/ws/server');  
var server = ws.createServer();  
  
server.addListener('connection', function(conn){  
console.log('New Connection:'+conn.id);  
conns.push(conn);  
conn.send(conn.id+" is your Connection ID: ");  
conn.addListener('message',function(msg){  
/* output the new message sent from client*/  
        console.log(conn.id+':'+msg);  
        var megContent = conn.id  
for(var i=0; i<conns.length; i++){  
if(conns[i]!=conn){  
conns[i].send(conn.id+':'+msg);  
}  
}  
        conn.send('self:'+msg);  
});  
});  
  
server.listen(8080);  
console.log('running......'); 