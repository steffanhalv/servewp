import express from 'express'
import compression from 'compression'
import path from 'path'
import phpProxy from './fastcgi'
// const https = require("https")
// import fs from 'fs'

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
app.use(compression())

// Add thrailing slash - always
app.use((req, res, next) => {
  if (
    req.path.substr(-1) !== '/' &&
    req.path.length > 1 &&
    req.path.split('/').pop().indexOf('.') === -1 &&
    req.url.indexOf('?') === -1
  ) {
    let query = req.url.slice(req.path.length)
    res.redirect(301, req.path + '/' + query)
  } else {
    next()
  }
})

/* Example to override routes
app.get('/example', (req, res) => {
  res.send('example')
})
*/
app.get('/hey', (req, res) => {
  res.send('Hey!')
})
app.use('/', phpProxy({
  documentRoot: path.join(__dirname, '../public'),
  env: {},
  socketOptions: { port: phpFpmPort }
}))
app.listen(primaryPort, () => {
  console.log('Webserver available at: http://localhost:' + primaryPort)
})
/*
https.createServer({
  key: fs.readFileSync(cert.key),
  cert: fs.readFileSync(cert.cert)
}, app).listen(sslPort)
*/
