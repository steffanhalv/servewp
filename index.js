const express = require("express")
const epf = require("./express-php-fpm").default
const https = require("https")
const fs = require("fs")
const compression = require('compression')

const cert = {
  key: '/etc/letsencrypt/live/haagen.no/privkey.pem',
  cert: '/etc/letsencrypt/live/haagen.no/fullchain.pem'
}

const app = express()
/* Example to override routes
app.get('/example', (req, res) => {
  res.send('example')
}) */
app.use(compression())
app.use("/", epf({
  documentRoot: __dirname + "/public",
  env: {},
  socketOptions: { port: 7000 },
}))
app.listen(80)
https.createServer({
  key: fs.readFileSync(cert.key),
  cert: fs.readFileSync(cert.cert)
}, app).listen(443)
