"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseEndRequest = exports.createKeyValueBufferFromObject = exports.createKeyValueBuffer = exports.createBeginRequestBody = exports.parseHeader = exports.createHeader = exports.GetMsgType = exports.STATUS = exports.MSG = exports.ROLE = exports.KEEP_CONN = exports.DONT_KEEP_CONN = exports.NULL_REQUEST_ID = exports.VERSION_1 = void 0;

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var VERSION_1 = 1;
exports.VERSION_1 = VERSION_1;
var NULL_REQUEST_ID = 0;
exports.NULL_REQUEST_ID = NULL_REQUEST_ID;
var DONT_KEEP_CONN = 0;
exports.DONT_KEEP_CONN = DONT_KEEP_CONN;
var KEEP_CONN = 1;
exports.KEEP_CONN = KEEP_CONN;
var ROLE = {
  RESPONDER: 1,
  AUTHORIZER: 2,
  FILTER: 3
};
exports.ROLE = ROLE;
var MSG = {
  BEGIN_REQUEST: 1,
  ABORT_REQUEST: 2,
  END_REQUEST: 3,
  PARAMS: 4,
  STDIN: 5,
  STDOUT: 6,
  STDERR: 7,
  DATA: 8,
  GET_VALUES: 9,
  GET_VALUES_RESULT: 10,
  UNKNOWN_TYPE: 11
};
exports.MSG = MSG;
var STATUS = {
  REQUEST_COMPLETE: 0,
  CANT_MPX_CONN: 1,
  OVERLOADED: 2,
  UNKNOWN_ROLE: 3
};
exports.STATUS = STATUS;

var GetMsgType = function GetMsgType(type) {
  /* eslint-disable */
  for (var _i = 0, _Object$entries = Object.entries(MSG); _i < _Object$entries.length; _i++) {
    var _Object$entries$_i = (0, _slicedToArray2["default"])(_Object$entries[_i], 2),
        key = _Object$entries$_i[0],
        value = _Object$entries$_i[1];

    if (value === type) {
      return key;
    }
  }
  /* eslint-enable */

  /*
  let r = 11 // Unknown
  Object.keys(MSG).forEach(k => {
    if (MSG[k] === type) {
      r = type
    }
  })
  return r
  */

};

exports.GetMsgType = GetMsgType;

var createHeader = function createHeader(version, type, requestId, contentLength, paddingLength) {
  if (contentLength > 0xffff) {
    throw new TypeError('Content is too big');
  }

  if (paddingLength > 0xff) {
    throw new TypeError('Padding is too big');
  }
  /* eslint-disable */


  var buff = Buffer.alloc(8);
  buff[0] = version; // unsigned char version

  buff[1] = type; // unsigned char type

  buff[2] = requestId >> 8; // unsigned char requestIdB1

  buff[3] = requestId; // unsigned char requestIdB0

  buff[4] = contentLength >> 8; // unsigned char contentLengthB1

  buff[5] = contentLength; // unsigned char contentLengthB0

  buff[6] = paddingLength; // unsigned char paddingLength
  // unsigned char reserved

  /* eslint-enable */

  return buff;
};

exports.createHeader = createHeader;

var parseHeader = function parseHeader(buff) {
  if (buff.length < 8) {
    return null;
  }
  /* eslint-disable */


  var version = buff[0];
  var type = buff[1];
  var requestId = buff[2] << 8 | buff[3];
  var contentLength = buff[4] << 8 | buff[5];
  var paddingLength = buff[6];
  var recordLength = 8 + contentLength + paddingLength;
  /* eslint-enable */

  if (recordLength > buff.length) {
    return null;
  }

  var content = buff.slice(8, 8 + contentLength);
  return {
    version: version,
    type: type,
    requestId: requestId,
    contentLength: contentLength,
    paddingLength: paddingLength,
    content: content,
    recordLength: recordLength
  };
};

exports.parseHeader = parseHeader;

var createBeginRequestBody = function createBeginRequestBody(role, flags) {
  /* eslint-disable */
  var buff = Buffer.alloc(8);
  buff[0] = role >> 8; // unsigned char roleB1

  buff[1] = role; // unsigned char roleB0

  buff[2] = flags; // unsigned char flags
  // unsigned char reserved[5]

  /* eslint-enable */

  return buff;
};

exports.createBeginRequestBody = createBeginRequestBody;

var createKeyValueBuffer = function createKeyValueBuffer(key, valueArg) {
  var value = valueArg instanceof Buffer ? valueArg : String(valueArg);

  if (key.length > 0xffffffff) {
    throw new TypeError('Key is too long.');
  }

  if (value.length > 0xffffffff) {
    throw new TypeError('Value is too long.');
  }

  var keyByteLength = key.length > 127 ? 4 : 1;
  var valueByteLength = value.length > 127 ? 4 : 1;
  var buff = Buffer.alloc(keyByteLength + valueByteLength + key.length + value.length);
  var i = 0;

  if (keyByteLength === 4) {
    /* eslint-disable */
    buff[i++] = key.length >> 24 | 1 << 7; // unsigned char keyLengthB3   // keyLengthB3  >> 7 == 1

    buff[i++] = key.length >> 16; // unsigned char keyLengthB2

    buff[i++] = key.length >> 8; // unsigned char keyLengthB1

    buff[i++] = key.length; // unsigned char keyLengthB0
  } else {
    buff[i++] = key.length; // unsigned char keyLengthB0   // keyLengthB0  >> 7 == 0
  }

  if (valueByteLength === 4) {
    buff[i++] = value.length >> 24 | 1 << 7; // unsigned char valueLengthB3  // valueLengthB3 >> 7 == 1

    buff[i++] = value.length >> 16; // unsigned char valueLengthB2

    buff[i++] = value.length >> 8; // unsigned char valueLengthB1

    buff[i++] = value.length; // unsigned char valueLengthB0
  } else {
    buff[i++] = value.length; // unsigned char valueLengthB0  // valueLengthB0 >> 7 == 0
  }

  i += buff.write(key, i); // unsigned char keyData[keyLength]

  i += buff.write(value, i); // unsigned char valueData[valueLength]

  /* eslint-enable */

  return buff;
};

exports.createKeyValueBuffer = createKeyValueBuffer;

var createKeyValueBufferFromObject = function createKeyValueBufferFromObject(object) {
  var buffers = Object.entries(object).map(function (_ref) {
    var _ref2 = (0, _slicedToArray2["default"])(_ref, 2),
        key = _ref2[0],
        value = _ref2[1];

    return createKeyValueBuffer(key, value);
  });
  return Buffer.concat(buffers);
};

exports.createKeyValueBufferFromObject = createKeyValueBufferFromObject;

var parseEndRequest = function parseEndRequest(buff) {
  /* eslint-disable */
  var appStatus = buff[0] << 24 | // unsigned char appStatusB3
  buff[1] << 16 | // unsigned char appStatusB2
  buff[2] << 8 | // unsigned char appStatusB1
  buff[3]; // unsigned char appStatusB0

  /* eslint-enable */

  var protocolStatus = buff[4]; // unsigned char protocolStatus
  // unsigned char reserved[3]

  return {
    appStatus: appStatus,
    protocolStatus: protocolStatus
  };
};

exports.parseEndRequest = parseEndRequest;