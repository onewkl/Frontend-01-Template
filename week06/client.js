const net = require('net')
const toyHtml = require('./htmlParser')
const EOF = Symbol('EOF');
//request中目前支持的content-type类型
const supportedContentTypes = {
  formUrlEncoded: 'application/x-www-form-urlencoded',
  json: ' application/json'
}
class Request{
  constructor(options){
    this.host = options.host;
    this.port = options.port || '80';
    this.method = options.method || 'GET';
    this.path = options.path || '/';
    this.headers = options.headers || {};
    this.body = options.body || {};
    this.bodyText = '';
    let contentType = this.headers['Content-Type'] || supportedContentTypes.formUrlEncoded;
    this.headers['Content-Type'] = contentType;
    if(contentType == supportedContentTypes.formUrlEncoded){
      this.bodyText = Object.keys(this.body).map(k => `${k}=${this.body[k]}`).join('&');
    }else if(contentType == supportedContentTypes.json){
      this.bodyText = JSON.stringify(this.body)
    }
    this.headers['Content-Length'] = this.bodyText.length;
  }
  toString(){ 
    return [
      `${this.method} ${this.path} HTTP/1.1`,
      `Host: ${this.host}`,
      ...Object.keys(this.headers).map(k => `${k}: ${this.headers[k]}`),
      ``,
      `${this.bodyText}`
    ].join('\r\n')
  }
  send(){
    return new Promise((resolve,reject) => {
      const connection = net.createConnection({
        host: this.host,
        port: this.port
      }, () => {
        connection.write(this.toString());
        connection.end()
      })
      connection.on('data',(data)=>{
        let parser = new ResponseParser();
        parser.receive(data.toString())
        if(parser.isFinished){
          resolve(parser.response)
        }
      })
      connection.on('error',(e)=>{
        reject(e)
      })
      connection.on('end',(data)=>{
        console.log('链接已断开')
      })
    })
  }
    
}

class ResponseParser {
  constructor(){
    this.stausLine = '';
    this.headers = {};
    this.currentHeaderName = '';
    this.currentHeaderValue = '';
    this.contentLength = 0;
    this.content = '';
    this.state = this.readingStatusLine
    this.bodyParser = {};
  }
  get isFinished(){
    return this.bodyParser.isFinished
  }
  get response(){
    this.stausLine.match(/HTTP\/1.1 ([0-9]+) ([\w]+)/)
    return {
      statusCode: RegExp.$1,
      statusText: RegExp.$2,
      headers:this.headers,
      content: this.bodyParser.content
    }
  }
  receive(str){
    for(let c of str){
      this.state = this.state(c)
    }
  }
  readingStatusLine(char){
    if(char == '\r'){
      return this.waittingStatusLineEnd
    }
    this.stausLine += char;
    return this.readingStatusLine
  }
  waittingStatusLineEnd(char){
    return this.headerName
  }
  headerName(char){
    if(char == ':'){
      return this.beforeHeaderValue
    }
    if(char == '\r'){
      return this.waittingHeaderBlockEnd
    }
    this.currentHeaderName += char;
    return this.headerName
  }
  beforeHeaderValue(char){
    if(char.match(/[\t\f\n ]/)){
      return this.beforeHeaderValue
    }
    return this.headerValue(char)
  }
  headerValue(char){
    if(char == '\r'){
      this.headers[this.currentHeaderName] = this.currentHeaderValue;
      this.currentHeaderName = '';
      this.currentHeaderValue = '';
      return this.waittingHeaderLineEnd
    }
    this.currentHeaderValue += char;
    return this.headerValue
  }
  waittingHeaderLineEnd(char){
    return this.headerName
  }
  waittingHeaderBlockEnd(char){
    if(this.headers['Transfer-Encoding'] == 'chunked'){
      this.bodyParser = new ChunkBodyParser();
    }
    return this.readingContent
  }
  readingContent(char){
    this.bodyParser.receiveChar(char)
    return this.readingContent
  }
}
class ChunkBodyParser{
  constructor(){
    this.length = 0;
    this.content = '';
    this.isFinished = false;
    this.state = this.waittingLength;
  }
  receiveChar(char){
    this.state = this.state(char)
  }
  waittingLength(char){
    if(char =='\r'){
      if(this.length == 0){
        this.isFinished = true
        return this.readingEnd
      }
      return this.waittingLengthEnd
    }
    this.length *= 16;
    this.length += parseInt(char,16);
    return this.waittingLength
  }
  waittingLengthEnd(char){
    return this.readingContent
  }
  readingContent(char){
    if(this.length == 0){
      return this.waitingContentEnd
    }
    this.length --;
    this.content += char;
    return this.readingContent
  }
  waitingContentEnd(char){
    return this.waittingLength
  }
  readingEnd(char){
    return this.readingEnd
  }
}
void async function () {
  const request = new Request({
    method: 'POST',
    host: '127.0.0.1',
    port: 8081,
    headers: {
      'X-Foo2': 'customed'
    },
    body: {
      name: 'lhs',
      year: 2020
    }
  });

  var res = await request.send()
  let tree = toyHtml.parse(res.content)
  console.log(JSON.stringify(tree))
}();