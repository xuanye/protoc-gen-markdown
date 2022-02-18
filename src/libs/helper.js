const template = require('art-template');

module.exports = {
  formatMessageType:formatMessageType
}

function formatMessageType(text) {
    if(!text){
      return text
    }
    const arr = text.split('.');
    return arr[arr.length - 1];
  }
  
function getFieldTypeName(field) {
    const type = parseInt(field.type);
    let typeName = 'UNKNOWN ';
    switch (type) {
      case 1:
        typeName = 'double';
        break;
      case 2:
        typeName = 'float';
        break;
      case 3:
        typeName = 'int64';
        break;
      case 4:
        typeName = 'uint64';
        break;
      case 5:
        typeName = 'int32';
        break;
      case 6:
        typeName = 'fixed64';
        break;
      case 7:
        typeName = 'fixed32';
        break;
      case 8:
        typeName = 'bool';
        break;
      case 9:
        typeName = 'string';
        break;
      case 10:
        typeName = 'group';
        break;
      case 11:
        typeName = getAnchor4Type(field.fullTypeName);
        break;
      case 12:
        typeName = 'bytes';
        break;
      case 13:
        typeName = 'uint32';
        break;
      case 14:
        typeName = getAnchor4Type(field.fullTypeName);
        break;
      case 15:
        typeName = 'sfixed32';
        break;
      case 16:
        typeName = 'sfixed64';
        break;
      case 17:
        typeName = 'sint32';
        break;
      case 18:
        typeName = 'sint64';
        break;
      default:
        typeName = 'UNKNOWN';
        break;
    }
    return typeName;
  }
  
function getAnchor4Type(typeName) {
    typeName = formatMessageType(typeName);
    return '[' + typeName + '](#' + typeName.toLowerCase() + ')';
}
  


template.defaults.imports.formatMessage = formatMessageType;
template.defaults.imports.getFieldTypeName = getFieldTypeName;