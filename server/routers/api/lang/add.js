module.exports = async function (ctx, next) {
  let data = ctx.request.body;
  let knex = global.knex;
  let language = data.language;
  let comment = data.comment;
  let body = {};
  if (!language || !comment) {
    body = {
      status: -1,
      message: '"language" and "comment" is required'
    }
  } else {
    let hasLangSelect = await knex('languages').select().where({ language })
    if (!hasLangSelect.length) {
      await knex('languages').insert({language, comment})
      body = {
        status: 0
      }
    } else {
      body = {
        status: -2,
        message: `language [${language}] is exist`
      }
    }
  }
  ctx.body = body;
};