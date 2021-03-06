import * as FCGI from './FCGI'
import FCGIClient from './FCGIClient'

const _defineProperty = (obj, key, value) => {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value, enumerable: true, configurable: true, writable: true
    })
  } else { obj[key] = value } return obj
}

/* eslint-disable */
function _objectSpread(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {}
    var ownKeys = Object.keys(source)
    if (typeof Object.getOwnPropertySymbols === 'function') {
      ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(sym => {
        return Object.getOwnPropertyDescriptor(source, sym).enumerable
      }))
    } ownKeys.forEach(key => {
      _defineProperty(target, key, source[key])
    })
  } return target
}
/* eslint-enable */

const createEnvironment = (documentRoot, file, req, extraEnv) => {
  const sep = req.url.indexOf('?')
  const qs = sep === -1 ? '' : req.url.substr(sep + 1)
  const env = {
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

  }
  const headers = Object.entries(req.headers).reduce((acc, [key, value]) => {
    return _objectSpread({}, acc, {
      ['HTTP_' + key.toUpperCase().replace(/-/g, '_')]: String(value)
    })
  }, {})
  return _objectSpread({}, env, headers, extraEnv)
}

export default class Responder extends FCGIClient {
  constructor(handler, file, req, res, next) {
    // init sockets
    super(handler.opt.socketOptions) // locals

    this.handler = handler
    this.req = req
    this.res = res
    this.next = next

    _defineProperty(this, 'gotHead', false)

    this.reqId = handler.getFreeReqId() // debug

    console.log('new Responder %d for %s', this.reqId, file) // send req

    const env = createEnvironment(handler.opt.documentRoot, file, req, handler.opt.env)
    this.send(
      FCGI.MSG.BEGIN_REQUEST,
      FCGI.createBeginRequestBody(FCGI.ROLE.RESPONDER, FCGI.DONT_KEEP_CONN)
    )
    this.send(FCGI.MSG.PARAMS, FCGI.createKeyValueBufferFromObject(env))
    this.send(FCGI.MSG.PARAMS, Buffer.alloc(0)) // express request

    req.on('data', this.onReqData.bind(this))
    req.on('end', this.onReqEnd.bind(this))
  }

  onReqData(chunk) {
    this.send(FCGI.MSG.STDIN, chunk)
  }

  onReqEnd() {
    this.send(FCGI.MSG.STDIN, Buffer.alloc(0))
  }

  onError(e) {
    this.next(e)
  }

  onClose(err) {
    if (err) console.error(err)
    this.handler.freeUpReqId(this.reqId)
  }

  send(msgType, content) {
    console.log('send %s', FCGI.GetMsgType(msgType))
    super.send(msgType, content)
  }

  onRecord(record) {
    console.log('got %s', FCGI.GetMsgType(record.type))

    switch (record.type) {
      case FCGI.MSG.STDERR:
        break
      case FCGI.MSG.STDOUT:
        this.stdout(record.content)
        break
      case FCGI.MSG.END_REQUEST:
        this.res.end()
        break
      case FCGI.MSG.GET_VALUES_RESULT:
        break
      default:
        break
    }
  }

  stdout(content) {
    if (this.gotHead) {
      this.res.write(content)
      return
    }

    this.gotHead = true
    const sep = content.indexOf('\r\n\r\n')
    const head = content.slice(0, sep)
    const body = content.slice(sep + 4)

    /* eslint-disable */
    for (const h of head.toString().split('\r\n')) {
      const hsep = h.indexOf(':')
      const hkey = h.substr(0, hsep)
      const hval = h.substr(hsep + 2)
      if (hkey === 'Status') {
        this.res.status(parseInt(hval.substr(0, 3)))
        continue
      }
      this.res.append(hkey, hval)
    }
    /* eslint-enable */

    this.res.write(body)
  }
}
