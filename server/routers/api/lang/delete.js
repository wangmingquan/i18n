module.exports = async function (ctx, next) {
  let data = ctx.request.body;
  let knex = global.knex;
  let language = data.language;
  let body = {};
  if (!language) {
    body = {
      status: -1,
      message: '"language" is required'
    }
  } else {
    await knex('languages').delete().where({language})
    body = {
      status: 0
    }
  }
  ctx.body = body;
};