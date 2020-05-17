const http = require('http');
var server = http.createServer((req,res)=>{
  console.log('--------receive request-----------');
 req.on('data',(d)=>{console.log(d.toString())})
  res.setHeader('Content-Type','text/html');
  res.setHeader('X-foo','bar');
  res.writeHead(200,{'Content-Type':'text/plain'});
  res.end(
`<html maaa=a >
<head>
    <style>
body div #myid{
    width:100px;
    background-color: #ff5000;
}
body div img{
    width:30px;
    background-color: #ff1111;
}
    </style>
</head>
<body>
    <div>
        <img id="myid"/>
        <img />
    </div>
</body>
</html>`);
console.log('--------response end-----------');
})
server.listen(8081)
console.log('================8081=================')