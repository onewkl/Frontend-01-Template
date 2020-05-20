HTTP报文格式

1. 请求报文
   起始行：方法（如GET、POST），请求地址，http版本，由空格分隔。
   headers：内容为 名字后面跟冒号(:)，然后跟上可选的空格，在跟上字段值。
   空行。
   body: body有多种格式，需要在header 中用Content-Type标识body的格式，并使用Content-Lenght标识body的长度。
2. 响应报文
   起始行：响应报文使用的http版本，数字状态码，状态原因文本，由空格分隔。
   headers: 格式与请求报文的headers一样。
   空行。
   响应体也有多种格式和编码方式 本次课程用到的chunked格式如下：
   首先是一个16进制数，表示本chunk内容长度。
   chunk内容
   chunk长度
   chunk内容
   ...
   0
   最后一定会以一个长度为0的chunk结尾。

状态机

状态机重点不在状态而在机，每个状态都是一个独立的机器。

状态机的每个状态都是一个纯函数，接收同样格式的参数，机器内部根据接收到的参数进行状态的变换。

状态机比较适合用来做字符串的解析。

DOM树构建

采用状态机对html文本进行解析，解析成一个个的token。

token分为文本token，标签开始token，标签结束token，自封闭标签token。

使用栈来存储解析完的token，栈底放一个document element作为根节点。

当新的token是文本token，如果栈顶是文本token则与栈顶内容合并，不入栈，如果栈顶不是文本token则插入栈顶token的children中，并入栈成为栈顶。

当新的token是标签开始token，如果栈顶是文本token则栈顶出栈。插入栈顶的children中并入栈成为栈顶。

当新的token是结束标签，如果栈顶是文本token则栈顶出栈。如果与栈顶的标签名一样则栈顶出栈，否则解析出错。

当新的token是自封闭标签，如果栈顶是文本token则栈顶出栈。插入栈顶的children中，不必入栈。

最后取出栈底的document element即可得到DOM树。

添加css样式

在解析DOM树时，如果遇到style标签，则使用npm包css来解析style标签的内容。记录所有样式规则。

当标签解析完插入到父级标签的children中时，因为此时这个标签的所有祖先元素都已确定，所以在此时对该标签匹配的样式规则进行判断。

这个判断过程稍有些复杂，不再描述，可以移步我的代码。

样式的优先级：

important>>id选择器>>class选择器>>标签选择器。

同优先级，后面的覆盖前面的。
