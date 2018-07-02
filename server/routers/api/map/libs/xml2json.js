let parser = require('xml2json');
let fs = require('fs');

module.exports = (xml) => {
  let xmlData = fs.readFileSync(xml);
  json = parser.toJson(xmlData);
  json = JSON.parse(json).resources.string;
  for (var i = 0, l = json.length; i < l; i++) {
    if (json[i].font) {
      if (!json[i].font.length) {
        json[i].$t = json[i].font.$t;
      } else {
        let font = json[i].font;
        for (var _i in font) {
          let newName = json[i].name + '_font' + _i;
          json.splice(i, 0, {
            name: newName,
            $t: font[_i].$t
          });
          l++;
          i++;
        }
      }
      delete (json[i].font);
    } else {
    }
  }
  return json;
};
