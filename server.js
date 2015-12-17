/*
  node js static web server with file change detection
  based upon
  https://gist.github.com/ryanflorence/701407
  by Andrew Rowe 2015.

  requirements.
  =============
  npm install websocket
  
  to use.
  =======
  place in head of your html files <meta detection-change="true"> so that it will auto 
  refresh if any served files change.
*/
var http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs"),
    port = process.argv[2] || 5000;

var WebSocketServer = require('websocket').server;
var watchedInjectCode = "<script>\n" +
"  var wSocket = new WebSocket('ws://localhost:"+port+"','refresh-protocol');\n" +
"  wSocket.onmessage = function(evt) {\n" +
"      console.log('refresh message from server');\n" +
"      window.location.reload(1); \n" +
"  }\n" +
"  wSocket.onerror = function(evt) {\n" +
"    console.log('wSocket error:'+evt);\n" +
"  }\n" +
"  </script>\n";
var watchedInjectCodeTag = '<meta detection-change="true">';
var watchedFiles = {};
var server = http.createServer(function(request, response) {


  var uri = url.parse(request.url).pathname
    , filename = path.join(process.cwd(), uri);
  fs.stat(filename, function(err,stat) {
    currentFilename = null;
    if(err) {
      response.writeHead(404, {"Content-Type": "text/plain"});
      response.write("404 Not Found\n");
      response.end();
      return;
    }

    if (fs.statSync(filename).isDirectory()) filename += '/index.html';
    

    fs.readFile(filename, "binary", function(err, file) {
      if(err) {        
        response.writeHead(500, {"Content-Type": "text/plain"});
        response.write(err + "\n");
        response.end();
        return;
      }
      // add listeners for served file changes
      fs.stat( filename, function(err,stats){
        if( !err ){
          if( !watchedFiles.hasOwnProperty( filename ) ){
            watchedFiles[filename] = fs.watchFile(filename, function(cur,prev){
              if( cur.mtime.getTime() != prev.mtime.getTime() ){
                console.log( 'change detected in: ' + filename );
                for( var i in clients){
                  clients[i].sendUTF('refresh-protocol');
                }
              }
            });
          }
        }
      });

      response.writeHead(200, 
        {
          'Cache-Control': 'private, no-cache, no-store, must-revalidate',
          'Expires': '-1',
          'Pragma': 'no-cache'}
      );
      // inject the web socket code
      if( filename.indexOf('.html') > -1 ){
        file = file.replace(watchedInjectCodeTag,watchedInjectCode);
      }
      response.write(file, "binary");
      response.end();
    });
  });
}).listen(parseInt(port, 10));
// http://codular.com/node-web-sockets
// add a web socket server to send change messages
wsServer = new WebSocketServer({
  httpServer : server
});
var count = 0;
var clients = {};

wsServer.on('request',function(r){
  var connection = r.accept('refresh-protocol', r.origin);
  var id = count++;

  clients[id]  = connection; 
  //console.log((new Date()) + ' Connection accepted [' + id + ']');

  connection.on('close', function(reasonCode, description) {
      // console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
      delete clients[id];
  });
});

console.log("Static file server running at\n  => http://localhost:" + port + "/\nCTRL + C to shutdown");
