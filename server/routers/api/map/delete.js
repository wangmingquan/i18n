module.exports = async function (ctx, next) {
  let data = ctx.request.body;
  let knex = global.knex;
  let id = data.id;
  let body = {};
  
  // 必传参数检查
  if (!id) {
    body = {
      status: -1,
      message: `'id' is required`
    }
  } else {
    let children = await knex('map').select().where({ parent_id: id });
    if (children.length) {
      body = {
        status: 1,
        message: '当前字段有子字段，删除前请先删除掉所有子字段'
      };
    } else {
      await knex('map').delete().where({ _id: id })
      body = {
        status: 0
      };
    }
  }
  ctx.body = body;
};