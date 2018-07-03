let xml2json = require('./libs/xml2json.js');
let insertodb = require('./libs/inserttodb.js');
let fs = require('fs');
let writeHeader = (ctx) => {
  ctx.write(`<style>
    body{
      color: green;
      padding: 10px;
    }
    .success{
      font-size: 40px;
      height: 240px;
      line-height: 240px;
      text-align: center;
      box-sizing: border-box;
      margin: 20px;
      border: 2px solid green;
      background: rgba(0, 255, 0, 0.2);
    }
    </style>
    <script>
    function scb () {
      window.scrollTo(0, 10000000);
    }
    </script>
    `)
};

module.exports = async function (ctx, next) {
  writeHeader(ctx);
  let writeInfo = (info) => {
    ctx.write(`${info}<br><script>scb();</script>`);
  };
  let lang = ctx.request.body.lang;
  let app = ctx.request.body.app;
  let type = ctx.request.body.type;
  let file = ctx.request.files.file;
  let filepath = file.path;
  let knex = global.knex;
  let json = [];
  if (type === 'xml') {
    json = xml2json(filepath);
  } else if (type === 'json') {
    let data = fs.readFileSync(filepath, 'utf8');
    data = JSON.parse(data);
    for (var i in data) {
      let item = {};
      json.push({
        name: i,
        $t: data[i]
      })
    }
  } else if (type === 'strings') {
    let data = fs.readFileSync(filepath, 'utf8').split('\n');
    for (var i in data) {
      let item = data[i].split('=');
      let key = item[0];
      let value = item[1];
      key = key.replace(/^"(.*)"$/, '$1');
      json.push({
        name: key,
        $t: value
      })
    }
  }

  fs.unlinkSync(filepath);
  await insertodb (({
    json,
    app,
    lang,
    knex,
    writeInfo
  }))
  
  writeInfo('<p class="success">任务全部完成</p>');
  ctx.end();
}
