"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _express = _interopRequireDefault(require("express"));

var _Responder = _interopRequireDefault(require("./Responder"));

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

var Handler =
/*#__PURE__*/
function () {
  function Handler(opt) {
    (0, _classCallCheck2.default)(this, Handler);
    this.opt = opt;

    _defineProperty(this, 'connections', new Array(100));

    _defineProperty(this, 'router', _express.default.Router());

    this.router.use(this.handle.bind(this));
    this.router.use(_express.default.static(opt.documentRoot));
  }

  (0, _createClass2.default)(Handler, [{
    key: "handle",
    value: function handle(req, res, next) {
      var file = Handler.withoutQueryString(req.url);
      var base = '/'; // YOUR MOD REWRITE RULES CAN BE WRITTEN HERE
      // @todo - Make it easier to config
      // Eq to: RewriteBase /
      // If not connected to base, return

      if (file.substr(0, base.length) !== base) {
        next();
        return;
      } // RewriteCond %{REQUEST_FILENAME} !-f
      // RewriteCond %{REQUEST_FILENAME} !-d
      // If is file or directory, return


      if (_fs.default.existsSync(_path.default.join(__dirname, '/../../public' + file)) && file !== base && !file.endsWith('.php') && (file.indexOf('wp-admin') === -1 || file.endsWith('.css') || file.endsWith('.js') || file.endsWith('.webm') || file.endsWith('.mp4') || file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.gif') || file.endsWith('.jpeg') || file.endsWith('.svg'))) {
        next();
        return;
      } // Eq to: RewriteRule ^index\.php$ - [L]
      // If is base (no path), redirect to index.php


      if (file === base) {
        file += 'index.php';
      } // Eq to: RewriteRule . /index.php [L]
      // If missing index.php, add it


      if (file.indexOf('.php') === -1 && file.endsWith('/')) {
        file += 'index.php';
      } else if (file.indexOf('.php') === -1) {
        file += '/index.php';
      } // If not a path to php file, resolve by index.php


      if (!_fs.default.existsSync(_path.default.join(__dirname, '/../../public' + file))) {
        file = base + 'index.php';
      }

      new _Responder.default(this, file, req, res, next);
    } // @todo

  }, {
    key: "getFreeReqId",
    value: function getFreeReqId() {
      var i = 0;
      /* eslint-disable */

      while (this.connections[++i]) {}
      /* eslint-enable */


      this.connections[i] = true;
      return i;
    }
  }, {
    key: "freeUpReqId",
    value: function freeUpReqId(reqId) {
      this.connections[reqId] = false;
    }
  }], [{
    key: "withoutQueryString",
    value: function withoutQueryString(url) {
      var sep = url.indexOf('?');
      return sep === -1 ? url : url.substr(0, sep);
    }
  }]);
  return Handler;
}();

var _default = function _default(opt) {
  return new Handler(opt).router;
};

exports.default = _default;