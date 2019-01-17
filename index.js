const express = require("express")
const phpProxy = require("./lib/index.js").default
// const https = require("https")
const fs = require("fs")
const compression = require('compression')

/*
const cert = {
  key: '/etc/letsencrypt/live/example.com/privkey.pem',
  cert: '/etc/letsencrypt/live/example.com/fullchain.pem'
}
*/

const phpFpmPort = 9000
const primaryPort = 80
// const sslPort = 443

const app = express()
/* Example to override routes
app.get('/example', (req, res) => {
  res.send('example')
})
*/
app.use(compression())
app.use("/", phpProxy({
  documentRoot: __dirname + "/public",
  env: {},
  socketOptions: { port: phpFpmPort },
}))
app.listen(primaryPort , () => {
  console.log('Running at: http://localhost:' + primaryPort)
})
/*
https.createServer({
  key: fs.readFileSync(cert.key),
  cert: fs.readFileSync(cert.cert)
}, app).listen(sslPort)
*/
