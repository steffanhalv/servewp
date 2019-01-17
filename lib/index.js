"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = init;
exports.Handler = void 0;

var fs = require('fs')

var _debug = _interopRequireDefault(require("debug"));

var _express = _interopRequireDefault(require("express"));

var _Responder = require("./Responder");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const debug = (0, _debug.default)("express-php-fpm");

function init(opt) {
  return new Handler(opt).router;
}

class Handler {
  constructor(opt) {
    this.opt = opt;

    _defineProperty(this, "connections", new Array(100));

    _defineProperty(this, "router", _express.default.Router());

    debug("new Router");
    this.router.use(this.handle.bind(this));
    this.router.use(_express.default.static(opt.documentRoot));
  }

  handle(req, res, next) {
    let file = withoutQueryString(req.url);
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
      fs.existsSync(__dirname + '/../../public' + file) &&
      file !== base &&
      !file.endsWith('.php') &&
      file.indexOf('wp-admin') === -1
    ) {
      next();
      return;
    }

    // Eq to: RewriteRule ^index\.php$ - [L]
    // If is base (no path), redirect to index.php
    if (file === base) {
      file += "index.php";
    }

    // Eq to: RewriteRule . /index.php [L]
    // If missing index.php, add it
    if (file.indexOf('.php') === -1 && file.endsWith("/")) {
      file += "index.php";
    } else if (file.indexOf('.php') === -1) {
      file += "/index.php";
    }
    
    // If not a path to php file, resolve by index.php
    if (!fs.existsSync(__dirname + '/../../public' + file)) {
      file = base + 'index.php'
    }

    new _Responder.Responder(this, file, req, res, next);
  }

  getFreeReqId() {
    let i = 0;

    while (this.connections[++i]) {}

    this.connections[i] = true;
    return i;
  }

  freeUpReqId(reqId) {
    this.connections[reqId] = false;
  }

}

exports.Handler = Handler;

function withoutQueryString(url) {
  const sep = url.indexOf("?");
  return sep === -1 ? url : url.substr(0, sep);
}