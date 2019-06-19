"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _get2 = _interopRequireDefault(require("@babel/runtime/helpers/get"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _defineProperty3 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var FCGI = _interopRequireWildcard(require("./FCGI"));

var _FCGIClient2 = _interopRequireDefault(require("./FCGIClient"));

var _defineProperty = function _defineProperty(obj, key, value) {
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
};
/* eslint-disable */


function _objectSpread(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};
    var ownKeys = Object.keys(source);

    if (typeof Object.getOwnPropertySymbols === 'function') {
      ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) {
        return Object.getOwnPropertyDescriptor(source, sym).enumerable;
      }));
    }

    ownKeys.forEach(function (key) {
      _defineProperty(target, key, source[key]);
    });
  }

  return target;
}
/* eslint-enable */


var createEnvironment = function createEnvironment(documentRoot, file, req, extraEnv) {
  var sep = req.url.indexOf('?');
  var qs = sep === -1 ? '' : req.url.substr(sep + 1);
  var env = {
    GATEWAY_INTERFACE: 'CGI/1.1',
    PATH: '',
    REQUEST_METHOD: req.method,
    REDIRECT_STATUS: 200,
    // https://stackoverflow.com/questions/24378472/what-is-php-serverredirect-status
    REMOTE_ADDR: req.connection.remoteAddress || '',
    REMOTE_PORT: req.connection.remotePort || '',
    SERVER_PROTOCOL: req.protocol.toUpperCase() + '/' + req.httpVersion,
    SERVER_ADDR: req.connection.localAddress,
    SERVER_PORT: req.connection.localPort,
    SERVER_SOFTWARE: 'serverwp',
    SERVER_NAME: '',
    SERVER_ADMIN: '',
    SERVER_SIGNATURE: '',
    DOCUMENT_ROOT: documentRoot,
    SCRIPT_FILENAME: documentRoot + file,
    SCRIPT_NAME: file,
    REQUEST_URI: req.url,
    QUERY_STRING: qs,
    CONTENT_TYPE: req.headers['content-type'] || '',
    CONTENT_LENGTH: req.headers['content-length'] || '' // AUTH_TYPE
    // PATH_INFO
    // PATH_TRANSLATED
    // REMOTE_HOST
    // REMOTE_IDENT
    // REMOTE_USER
    // UNIQUE_ID

  };
  var headers = Object.entries(req.headers).reduce(function (acc, _ref) {
    var _ref2 = (0, _slicedToArray2["default"])(_ref, 2),
        key = _ref2[0],
        value = _ref2[1];

    return _objectSpread({}, acc, (0, _defineProperty3["default"])({}, 'HTTP_' + key.toUpperCase().replace(/-/g, '_'), String(value)));
  }, {});
  return _objectSpread({}, env, headers, extraEnv);
};

var Responder =
/*#__PURE__*/
function (_FCGIClient) {
  (0, _inherits2["default"])(Responder, _FCGIClient);

  function Responder(handler, file, req, res, next) {
    var _this;

    (0, _classCallCheck2["default"])(this, Responder);
    // init sockets
    _this = (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(Responder).call(this, handler.opt.socketOptions)); // locals

    _this.handler = handler;
    _this.req = req;
    _this.res = res;
    _this.next = next;

    _defineProperty((0, _assertThisInitialized2["default"])(_this), 'gotHead', false);

    _this.reqId = handler.getFreeReqId(); // debug

    console.log('new Responder %d for %s', _this.reqId, file); // send req

    var env = createEnvironment(handler.opt.documentRoot, file, req, handler.opt.env);

    _this.send(FCGI.MSG.BEGIN_REQUEST, FCGI.createBeginRequestBody(FCGI.ROLE.RESPONDER, FCGI.DONT_KEEP_CONN));

    _this.send(FCGI.MSG.PARAMS, FCGI.createKeyValueBufferFromObject(env));

    _this.send(FCGI.MSG.PARAMS, Buffer.alloc(0)); // express request


    req.on('data', _this.onReqData.bind((0, _assertThisInitialized2["default"])(_this)));
    req.on('end', _this.onReqEnd.bind((0, _assertThisInitialized2["default"])(_this)));
    return _this;
  }

  (0, _createClass2["default"])(Responder, [{
    key: "onReqData",
    value: function onReqData(chunk) {
      this.send(FCGI.MSG.STDIN, chunk);
    }
  }, {
    key: "onReqEnd",
    value: function onReqEnd() {
      this.send(FCGI.MSG.STDIN, Buffer.alloc(0));
    }
  }, {
    key: "onError",
    value: function onError(e) {
      this.next(e);
    }
  }, {
    key: "onClose",
    value: function onClose(err) {
      if (err) console.error(err);
      this.handler.freeUpReqId(this.reqId);
    }
  }, {
    key: "send",
    value: function send(msgType, content) {
      console.log('send %s', FCGI.GetMsgType(msgType));
      (0, _get2["default"])((0, _getPrototypeOf2["default"])(Responder.prototype), "send", this).call(this, msgType, content);
    }
  }, {
    key: "onRecord",
    value: function onRecord(record) {
      console.log('got %s', FCGI.GetMsgType(record.type));

      switch (record.type) {
        case FCGI.MSG.STDERR:
          break;

        case FCGI.MSG.STDOUT:
          this.stdout(record.content);
          break;

        case FCGI.MSG.END_REQUEST:
          this.res.end();
          break;

        case FCGI.MSG.GET_VALUES_RESULT:
          break;

        default:
          break;
      }
    }
  }, {
    key: "stdout",
    value: function stdout(content) {
      if (this.gotHead) {
        this.res.write(content);
        return;
      }

      this.gotHead = true;
      var sep = content.indexOf('\r\n\r\n');
      var head = content.slice(0, sep);
      var body = content.slice(sep + 4);
      /* eslint-disable */

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = head.toString().split('\r\n')[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var h = _step.value;
          var hsep = h.indexOf(':');
          var hkey = h.substr(0, hsep);
          var hval = h.substr(hsep + 2);

          if (hkey === 'Status') {
            this.res.status(parseInt(hval.substr(0, 3)));
            continue;
          }

          this.res.append(hkey, hval);
        }
        /* eslint-enable */

      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator["return"] != null) {
            _iterator["return"]();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      this.res.write(body);
    }
  }]);
  return Responder;
}(_FCGIClient2["default"]);

exports["default"] = Responder;