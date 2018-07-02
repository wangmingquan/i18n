module.exports = async function (ctx, next) {
  let data = ctx.request.body;
  let knex = global.knex;
  let appname = data.appname;
  let describle = data.describle;
  let icon = data.icon;
  let languages = data.languages;
  let body = {};

  if (!appname) {
    body = {
      status: -1,
      message: '"appname" is required'
    }
  } else {
    let hasAppSelect = await knex('app').select().where({ appname })
    if (!hasAppSelect.length) {
      await knex('app').insert({appname, describle, icon, languages})
      body = {
        status: 0
      }
    } else {
      body = {
        status: -2,
        message: `app [${appname}] is exist`
      }
    }
  }
  ctx.body = body;
};