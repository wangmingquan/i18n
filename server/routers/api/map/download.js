module.exports = async function (ctx, next) {
  let data = ctx.query;
  let knex = global.knex;
  let app = data.app;
  let type = data.type;
  let lang = data.lang
  let allData = [];
  let langsObject = {};
  
  // 必传参数检查
  if (!app || !type || !lang) {
    body = {
      status: -1,
      message: `'app'、'type'、'lang' is required`
    }
  } else {
    let allData = await knex('map').select('full_key', 'value').where({ app: app }).where('value', '!=', 'Null');
    for (var i in allData) {
      let langs = {}
      let key = allData[i]['full_key'];
      key = key.replace(/\./g, '_');
      try {
        langs = JSON.parse(allData[i].value)
      } catch (e) {}
      for (var _i in langs) {
        if (!langsObject[_i]) {
          langsObject[_i] = {};
        }
        langsObject[_i][key] = langs[_i];
      }
    }
    ctx.set({
      'Content-Disposition': 'attachment; filename=' + encodeURI(lang + '.' + type)
    });
    let output_data = langsObject[lang];
    if (type === 'json') {
      let json = [];
      for (var i in output_data) {
        let key = i;
        let value = output_data[i];
        console.log(`\t"${key}": "${value}"`)
        value = value
          .replace(/"'"/g, '\'')
          .replace(/"'/g, '\\"')
          .replace(/'"/g, '\\"');
        json.push(`\t"${key}": "${value}"`);
      }
      json = `{
${json.join(',\n')}
}`;
      body = json;
    } else if (type === 'xml') {
      let xml = [`<?xml version="1.0" encoding="utf-8"?>
<resources>`];
      for (var i in output_data) {
        xml.push(`\t<string name="${i}">${output_data[i]}</string>`)
      }
      xml.push(`</resources>`)
      xml = xml.join('\n');
      body = xml;
    }
    else if (type === 'strings') {
      let strings = [];
      for (var i in output_data) {
        strings.push(`"${i}"="${output_data[i]}";`)
      }
      strings = strings.join('\n');
      body = strings;
    }
    
  }
  ctx.body = body;
};