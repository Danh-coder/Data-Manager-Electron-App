var express = require('express');
var http = require('http');
var path = require('path');

var appServer = express();
appServer.use(express.static(path.join(__dirname, '/src')));

appServer.get('/login', (req, res) => {
    res.sendFile(`${__dirname}/src/preEnter/login.html`);
});

const port = 3007;
http.createServer(appServer).listen(port, function() {
    console.log('Express server listening on port', port);
});