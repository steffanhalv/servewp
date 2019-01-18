const VERSION_1 = 1
const NULL_REQUEST_ID = 0
const DONT_KEEP_CONN = 0
const KEEP_CONN = 1
const ROLE = {
  RESPONDER: 1,
  AUTHORIZER: 2,
  FILTER: 3
}
const MSG = {
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
}
const STATUS = {
  REQUEST_COMPLETE: 0,
  CANT_MPX_CONN: 1,
  OVERLOADED: 2,
  UNKNOWN_ROLE: 3
}

export {
  VERSION_1,
  NULL_REQUEST_ID,
  DONT_KEEP_CONN,
  KEEP_CONN,
  ROLE,
  MSG,
  STATUS
}

const GetMsgType = type => {
  /* eslint-disable */
  for (const [key, value] of Object.entries(MSG)) {
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
}
export { GetMsgType }

const createHeader = (version, type, requestId, contentLength, paddingLength) => {
  if (contentLength > 0xffff) {
    throw new TypeError('Content is too big')
  }

  if (paddingLength > 0xff) {
    throw new TypeError('Padding is too big')
  }

  /* eslint-disable */
  const buff = Buffer.alloc(8)
  buff[0] = version // unsigned char version
  buff[1] = type // unsigned char type
  buff[2] = requestId >> 8 // unsigned char requestIdB1
  buff[3] = requestId // unsigned char requestIdB0
  buff[4] = contentLength >> 8 // unsigned char contentLengthB1
  buff[5] = contentLength // unsigned char contentLengthB0
  buff[6] = paddingLength // unsigned char paddingLength
  // unsigned char reserved
  /* eslint-enable */

  return buff
}
export { createHeader }

const parseHeader = buff => {
  if (buff.length < 8) {
    return null
  }

  /* eslint-disable */
  const version = buff[0]
  const type = buff[1]
  const requestId = buff[2] << 8 | buff[3]
  const contentLength = buff[4] << 8 | buff[5]
  const paddingLength = buff[6]
  const recordLength = 8 + contentLength + paddingLength
  /* eslint-enable */

  if (recordLength > buff.length) {
    return null
  }

  const content = buff.slice(8, 8 + contentLength)
  return {
    version,
    type,
    requestId,
    contentLength,
    paddingLength,
    content,
    recordLength
  }
}
export { parseHeader }

const createBeginRequestBody = (role, flags) => {
  /* eslint-disable */
  const buff = Buffer.alloc(8)
  buff[0] = role >> 8 // unsigned char roleB1
  buff[1] = role // unsigned char roleB0
  buff[2] = flags // unsigned char flags
  // unsigned char reserved[5]
  /* eslint-enable */

  return buff
}
export { createBeginRequestBody }

const createKeyValueBuffer = (key, valueArg) => {
  const value = valueArg instanceof Buffer ? valueArg : String(valueArg)

  if (key.length > 0xffffffff) {
    throw new TypeError('Key is too long.')
  }

  if (value.length > 0xffffffff) {
    throw new TypeError('Value is too long.')
  }

  const keyByteLength = key.length > 127 ? 4 : 1
  const valueByteLength = value.length > 127 ? 4 : 1
  const buff = Buffer.alloc(keyByteLength + valueByteLength + key.length + value.length)
  let i = 0

  if (keyByteLength === 4) {
    /* eslint-disable */
    buff[i++] = key.length >> 24 | 1 << 7 // unsigned char keyLengthB3   // keyLengthB3  >> 7 == 1
    buff[i++] = key.length >> 16 // unsigned char keyLengthB2
    buff[i++] = key.length >> 8 // unsigned char keyLengthB1
    buff[i++] = key.length // unsigned char keyLengthB0
  } else {
    buff[i++] = key.length // unsigned char keyLengthB0   // keyLengthB0  >> 7 == 0
  }

  if (valueByteLength === 4) {
    buff[i++] = value.length >> 24 | 1 << 7 // unsigned char valueLengthB3  // valueLengthB3 >> 7 == 1
    buff[i++] = value.length >> 16 // unsigned char valueLengthB2
    buff[i++] = value.length >> 8 // unsigned char valueLengthB1
    buff[i++] = value.length // unsigned char valueLengthB0
  } else {
    buff[i++] = value.length // unsigned char valueLengthB0  // valueLengthB0 >> 7 == 0
  }

  i += buff.write(key, i) // unsigned char keyData[keyLength]
  i += buff.write(value, i) // unsigned char valueData[valueLength]
  /* eslint-enable */

  return buff
}
export { createKeyValueBuffer }

const createKeyValueBufferFromObject = object => {
  const buffers = Object.entries(object).map(([key, value]) => {
    return createKeyValueBuffer(key, value)
  })
  return Buffer.concat(buffers)
}
export { createKeyValueBufferFromObject }

const parseEndRequest = buff => {
  /* eslint-disable */
  const appStatus = buff[0] << 24 | // unsigned char appStatusB3
  buff[1] << 16 | // unsigned char appStatusB2
  buff[2] << 8 | // unsigned char appStatusB1
  buff[3] // unsigned char appStatusB0
  /* eslint-enable */

  const protocolStatus = buff[4] // unsigned char protocolStatus
  // unsigned char reserved[3]

  return {
    appStatus,
    protocolStatus
  }
}
export { parseEndRequest }
