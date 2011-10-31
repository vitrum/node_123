//msg and save to mysql

var conns = new Array(); 
var mysql = require('mysql');
var ws = require('./lib/ws/server');  
var server = ws.createServer();  


var TEST_DATABASE = 'nodejs_location';
var TEST_TABLE = 'test';
var client = mysql.createClient({
  user: 'root',
  password: '123456',
});

client.query('CREATE DATABASE '+TEST_DATABASE, function(err) {
  if (err && err.number != mysql.ERROR_DB_CREATE_EXISTS) {
    throw err;
  }
});
client.query('USE '+TEST_DATABASE);

client.query(
  'CREATE TEMPORARY TABLE '+TEST_TABLE+
  '(id INT(11) AUTO_INCREMENT, '+
  'title TEXT, '+
  'text TEXT, '+
  'created DATETIME, '+
  'PRIMARY KEY (id))'
);
  
server.addListener('connection', function(conn){  
console.log('New Connection:'+conn.id);  
conns.push(conn);  
conn.send(conn.id+" is your Connection ID: ");  
conn.addListener('message',function(msg){  
/* output the new message sent from client*/  
        console.log(conn.id+':'+msg);  
		
		client.query(
		  'INSERT INTO '+TEST_TABLE+' '+
		  'SET title = ?, text = ?, created = ?',
		  [conn.id, msg, '2010-08-16 10:00:23']
		);



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