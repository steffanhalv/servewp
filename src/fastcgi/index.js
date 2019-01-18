import fs from 'fs'
import path from 'path'
import express from 'express'
import Responder from './Responder'

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value, enumerable: true, configurable: true, writable: true
    })
  } else { obj[key] = value } return obj
}

class Handler {
  constructor(opt) {
    this.opt = opt

    _defineProperty(this, 'connections', new Array(100))
    _defineProperty(this, 'router', express.Router())

    this.router.use(this.handle.bind(this))
    this.router.use(express.static(opt.documentRoot))
  }

  static withoutQueryString(url) {
    const sep = url.indexOf('?')
    return sep === -1 ? url : url.substr(0, sep)
  }

  handle(req, res, next) {
    let file = Handler.withoutQueryString(req.url)
    let base = '/'

    // Eq to: RewriteBase /
    // If not connected to base, return
    if (file.substr(0, base.length) !== base) {
      next()
      return
    }

    // RewriteCond %{REQUEST_FILENAME} !-f
    // RewriteCond %{REQUEST_FILENAME} !-d
    // If is file or directory, return
    if (
      fs.existsSync(path.join(__dirname, '/../../public' + file)) &&
      file !== base &&
      !file.endsWith('.php') &&
      file.indexOf('wp-admin') === -1
    ) {
      next()
      return
    }

    // Eq to: RewriteRule ^index\.php$ - [L]
    // If is base (no path), redirect to index.php
    if (file === base) {
      file += 'index.php'
    }

    // Eq to: RewriteRule . /index.php [L]
    // If missing index.php, add it
    if (file.indexOf('.php') === -1 && file.endsWith('/')) {
      file += 'index.php'
    } else if (file.indexOf('.php') === -1) {
      file += '/index.php'
    }

    // If not a path to php file, resolve by index.php
    if (!fs.existsSync(path.join(__dirname, '/../../public' + file))) {
      file = base + 'index.php'
    }

    new Responder(this, file, req, res, next)
  }

  // @todo
  getFreeReqId() {
    let i = 0
    // while (this.connections[++i]) {}
    this.connections[i] = true
    return i
  }

  freeUpReqId(reqId) {
    this.connections[reqId] = false
  }
}

export default opt => {
  return new Handler(opt).router
}
