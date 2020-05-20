const css = require('css')
let rules = [];

function match(element,selector){
  if(selector.startsWith('.')){
    let attr = element.attributes.class;
    if(attr && '.'+attr==s ){
      return true
    }
  }else if(selector.startsWith('#')){
    let attr = element.attributes.id;
    if(attr && '#'+attr==selector ){
      return true
    }
  }else{
    if(element.tagName == selector){
      return true
    }
  }
  return false;
}
function specificity(selector){
  var p = [0,0,0,0];
  var selectos = selector.split(' ');
  for(let s of selectos){
    if(s.startsWith('#')){
      p[1] += 1;
    }else if(s.startsWith('.')){
      p[2] += 1;
    }else {
      p[3] += 1;
    }
  }
  return p;
}

function compare(spec1,spec2){
  if(spec1[0] - spec2[0]){
    return spec1[0] - spec2[0]
  }
  if(spec1[1] - spec2[1]){
    return spec1[1] - spec2[1]
  }
  if(spec1[2] - spec2[2]){
    return spec1[2] - spec2[2]
  }
  return spec1[3] - spec2[3]
}

module.exports.parse = function(cssStr){
  let ast = css.parse(cssStr);
  rules.push(...ast.stylesheet.rules)
}
module.exports.computeCss = function(element){
  element.computedStyle={}
  for(let rule of rules){
   let selectors = rule.selectors[0].split(' ').reverse();
   if(!match(element,selectors[0])){
     continue;
   }
   let len = 1;
   let currentNode = element.parent;
   let matched = false;
   while(len < selectors.length){
     if(match(currentNode,selectors[len])){
       len++;
       if(len >= selectors.length) matched = true;
     }else{
       currentNode = currentNode.parent;
       if(!currentNode){
         break;
       }
     }
   }
   if(matched){
     let computedStyle = element.computedStyle;
     for(let declaration of rule.declarations){
      let spec = specificity(rule.selectors[0]);
       if(!computedStyle[declaration.property]){
        computedStyle[declaration.property] = {}
        computedStyle[declaration.property].value = declaration.value;
        computedStyle[declaration.property].specificity = spec;
       }else if(compare(computedStyle[declaration.property].specificity,spec)<0){
        computedStyle[declaration.property].value = declaration.value;
        computedStyle[declaration.property].specificity = spec;
       }
       
     }
   }
  }

}