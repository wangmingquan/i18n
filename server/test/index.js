var source = require('./string.js')['resources']['string'];
var newObj = {};
var fs = require('fs');

for (let i = 0, l = source.length; i < l; i++) {
  let item = source[i];
  let key = item['-name'];
  let value = item['#text'];
  if (!value || !key) {
    continue;
  }
  value = JSON.stringify({'zh_cn': value});
  let keys = key.split('_');
  let parent = newObj;

  for (let _i = 0, _l = keys.length; _i < _l; _i++) {
    let _key = keys[_i];
    if (_i + 1 === _l) {
      parent[_key] = {value};
    } else {
      if (!parent[_key]) {
        parent[_key] = {}
      }
      parent = parent[_key];
    }
  }
}

fs.writeFile('result.json', JSON.stringify(newObj), 'utf8', (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log('序列化成功');
  }
});
