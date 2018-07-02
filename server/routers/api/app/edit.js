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
      body = {
        status: -2,
        message: `app [${appname}] is not exist`
      }
      
    } else {
      await knex('app').update({describle, icon, languages}).where({appname})
      body = {
        status: 0
      }
    }
  }
  ctx.body = body;
};