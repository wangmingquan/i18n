module.exports = async function (ctx, next) {
  let knex = global.knex;
  let langs = [];
  try {
    let res = await knex('languages').select();
    langs = res;
  } catch (e) {
    console.log(e);
  }

  let body = {
    status: 0,
    data: {
      langs
    }
  };
  ctx.body = body;
};