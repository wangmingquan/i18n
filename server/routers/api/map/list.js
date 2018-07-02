module.exports = async function (ctx, next) {
  let data = ctx.query;
  let parent_id = data.parent_id;
  let app = data.app;
  let select = null;
  let body = {};
  let knex = global.knex;

  if (!app) {
    body = {
      status: -1,
      message: `'app' is required`
    }
  } else {
    if (parent_id) {
      parent_id = parseInt(parent_id);
      select = knex('map').select().where({ parent_id: parent_id, app })
    } else {
      select = knex('map').select().where({ parent_id: null, app })
    }
    let result = await select;
    body = {
      status: 0,
      data: {
        parent_id,
        list: result
      }
    }
  }
  ctx.body = body;
};