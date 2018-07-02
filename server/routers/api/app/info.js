module.exports = async function (ctx, next) {
  let query = ctx.query;
  let appname = query.appname;
  let knex = global.knex;
  let body = {};

  if (!appname) {
    body = {
      status: -1,
      message: '"appname" is required'
    }
  } else {
    try {
      let res = await knex('app').select().where({appname});
      info = res[0];
      try {
        info.languages = JSON.parse(info.languages);
      } catch (e) {}
      body = {
        status: 0,
        data: info
      }
    } catch (e) {
      body = {
        status: 1,
        error: e,
        message: 'server error'
      }
      console.log(e);
    }
  }
  ctx.body = body;
};