const EOF = Symbol('EOF')

let currentToken;
let currentAttrName = '';
let currentAttrValue = '';
let stack = [{type:'doucument',children:[]}]
let parsedTree;
let currentTextNode = null;
function emit(token){
  let top = stack[stack.length-1];
  if(token.type == 'startTag'){
    let element = {
      type: 'element',
      tagName: token.tagName,
      attributes:[],
      children:[]
      
    }
    Object.keys(token).forEach(k => k!='type' && k!='isSelfClosing' && k!='tagName' && element.attributes.push({[k]:token[k]}))
    if(top.type == 'text'){
      stack.pop();
      top = stack[stack.length-1];
    }
    top.children.push(element)
    if(token.isSelfClosing !==true){
      stack.push(element)
    }
    currentTextNode = null;
  }else if(token.type == 'text'){
    if(currentTextNode){
      currentTextNode.content += token.content;
      return;
    }
    currentTextNode = {
      ...token
    }
    top.children.push(currentTextNode)
  }else if(token.type == 'endTag'){
    if(top.tagName != token.tagName){
      throw '标签不匹配'
    }
    currentTextNode = null;
    stack.pop()
  }else if(token.type == 'EOF'){
    parsedTree = stack[0]
  }
  
}

function data(char){
  if(char == '<'){
    return tagOpen
  }
  if(char == EOF){
    emit({
      type:'EOF'
    })
    return;
  }
  emit({
    type:'text',
    content: char
  })
  return data
}

function tagOpen(char){
  //只支持纯英文字母tagName
  if(char.match(/[A-Za-z]/)){
    currentToken = {
      type:'startTag',
      tagName: ''
    }
    return tagName(char)
  }
  if(char == '/'){
    return endTagOpen
  }
}
function endTagOpen(char){
  if(char.match(/[A-Za-z]/)){
    currentToken = {
      type:'endTag',
      tagName: ''
    }
    return tagName(char)
  }
}
function tagName(char){
  if(char == '/'){
    return selfClosingTag
  }
  if(char == '>'){
    emit(currentToken)
    return data
  }
  if(char.match(/[\t\f\n ]/)){
    return beforeAttributeName
  }
  currentToken.tagName +=char;
  return tagName
}
function beforeAttributeName(char){
  if(char.match(/[\t\f\n ]/)){
    return beforeAttributeName
  }
  if(char == '/'){
    return selfClosingTag
  }
  if(char == '>'){
    emit(currentToken)
    return data
  }
  if(char == '='){
    return beforeAttributeValue
  }
  currentAttrName += char
  return beforeAttributeName
}
function beforeAttributeValue(char){
  if(char.match(/[\t\f\n ]/)){
    return beforeAttributeValue
  }
  if(char == '"'){
    return doubleQuotedValue
  }
  if(char == "'"){
    return singleQuotedValue
  }
  return unQuotedValue(char)
}
function doubleQuotedValue(char){
  if(char == '"'){
    currentToken[currentAttrName] = currentAttrValue
    currentAttrName = '';
    currentAttrValue = '';
    return beforeAttributeName
  }
  currentAttrValue+=char;
  return doubleQuotedValue
}
function singleQuotedValue(char){
  if(char == "'"){
    currentToken[currentAttrName] = currentAttrValue
    currentAttrName = '';
    currentAttrValue = '';
    return beforeAttributeName
  }
  currentAttrValue+=char;
  return singleQuotedValue
}
function unQuotedValue(char){
  if(char.match(/[\t\f\n ]/)){
    currentToken[currentAttrName] = currentAttrValue
    currentAttrName = '';
    currentAttrValue = '';
    return beforeAttributeName
  }
  if(char == '/'){
    currentToken[currentAttrName] = currentAttrValue
    currentAttrName = '';
    currentAttrValue = '';
    return selfClosingTag
  }
  if(char == '>'){
    currentToken[currentAttrName] = currentAttrValue
    currentAttrName = '';
    currentAttrValue = '';
    emit(currentToken)
    return data
  }
  currentAttrValue+=char;
  return unQuotedValue
}
function selfClosingTag(char){
  if(char == '>'){
    currentToken.isSelfClosing = true;
    emit(currentToken)
    return data
  }
}
module.exports.parse = function(html){
  let state = data;
  for(let char of html){
    state = state(char)
  }
  state(EOF);
  return parsedTree
}