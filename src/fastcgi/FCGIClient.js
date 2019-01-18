

import net from 'net'
import * as FCGI from './FCGI'

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value, enumerable: true, configurable: true, writable: true
    })
  } else { obj[key] = value } return obj
}

export default class FCGIClient {
  constructor(socketOptions) {
    _defineProperty(this, 'buffer', Buffer.alloc(0))
    _defineProperty(this, 'reqId', 0)
    _defineProperty(this, 'socket', 0)

    this.onData = this.onData.bind(this)
    this.onError = this.onError.bind(this)
    this.onClose = this.onClose.bind(this)
    this.socket = net.connect(socketOptions)
    this.socket.on('data', this.onData)
    this.socket.on('error', this.onError)
    this.socket.on('close', this.onClose)
  }

  send(msgType, content) {
    for (let offset = 0; offset < content.length || offset === 0; offset += 0xffff) {
      const chunk = content.slice(offset, offset + 0xffff)
      const header = FCGI.createHeader(FCGI.VERSION_1, msgType, this.reqId, chunk.length, 0)
      this.socket.write(header)
      this.socket.write(chunk)
    }
  }

  onData(data) {
    this.buffer = Buffer.concat([this.buffer, data])
    while (this.buffer.length) {
      const record = FCGI.parseHeader(this.buffer)
      if (!record) {
        break
      }
      this.buffer = this.buffer.slice(record.recordLength)
      this.onRecord(record)
    }
  }

  /* eslint-disable */
  onError(e) {}

  onClose(hadError) {}

  onRecord(record) {}
  /* eslint-enable */
}
