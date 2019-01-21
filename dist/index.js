"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _express = _interopRequireDefault(require("express"));

var _compression = _interopRequireDefault(require("compression"));

var _path = _interopRequireDefault(require("path"));

var _fastcgi = _interopRequireDefault(require("./fastcgi"));

// const https = require("https")
// import fs from 'fs'

/*
const cert = {
  key: '/etc/letsencrypt/live/example.com/privkey.pem',
  cert: '/etc/letsencrypt/live/example.com/fullchain.pem'
}
*/
var phpFpmPort = 9000;
var primaryPort = 80; // const sslPort = 443

var app = (0, _express.default)();
/* Example to override routes
app.get('/example', (req, res) => {
  res.send('example')
})
*/

app.use((0, _compression.default)());
app.use('/', (0, _fastcgi.default)({
  documentRoot: _path.default.join(__dirname, '../public'),
  env: {},
  socketOptions: {
    port: phpFpmPort
  }
}));
app.listen(primaryPort, function () {
  console.log('Webserver available at: http://localhost:' + primaryPort);
});
/*
https.createServer({
  key: fs.readFileSync(cert.key),
  cert: fs.readFileSync(cert.cert)
}, app).listen(sslPort)
*/