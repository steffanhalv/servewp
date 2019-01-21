"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _net = _interopRequireDefault(require("net"));

var FCGI = _interopRequireWildcard(require("./FCGI"));

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

var FCGIClient =
/*#__PURE__*/
function () {
  function FCGIClient(socketOptions) {
    (0, _classCallCheck2.default)(this, FCGIClient);

    _defineProperty(this, 'buffer', Buffer.alloc(0));

    _defineProperty(this, 'reqId', 0);

    _defineProperty(this, 'socket', 0);

    this.onData = this.onData.bind(this);
    this.onError = this.onError.bind(this);
    this.onClose = this.onClose.bind(this);
    this.socket = _net.default.connect(socketOptions);
    this.socket.on('data', this.onData);
    this.socket.on('error', this.onError);
    this.socket.on('close', this.onClose);
  }

  (0, _createClass2.default)(FCGIClient, [{
    key: "send",
    value: function send(msgType, content) {
      for (var offset = 0; offset < content.length || offset === 0; offset += 0xffff) {
        var chunk = content.slice(offset, offset + 0xffff);
        var header = FCGI.createHeader(FCGI.VERSION_1, msgType, this.reqId, chunk.length, 0);
        this.socket.write(header);
        this.socket.write(chunk);
      }
    }
  }, {
    key: "onData",
    value: function onData(data) {
      this.buffer = Buffer.concat([this.buffer, data]);

      while (this.buffer.length) {
        var record = FCGI.parseHeader(this.buffer);

        if (!record) {
          break;
        }

        this.buffer = this.buffer.slice(record.recordLength);
        this.onRecord(record);
      }
    }
    /* eslint-disable */

  }, {
    key: "onError",
    value: function onError(e) {}
  }, {
    key: "onClose",
    value: function onClose(hadError) {}
  }, {
    key: "onRecord",
    value: function onRecord(record) {}
    /* eslint-enable */

  }]);
  return FCGIClient;
}();

exports.default = FCGIClient;