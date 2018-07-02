module.exports = async function (ctx, next) {
  let knex = global.knex;
  let list = [];
  try {
    let res = await knex('app').select();
    list = res;
    for (var i in list) {
      try {
        list[i]['languages'] = JSON.parse(list[i]['languages']);
      } catch (e) {}
    }
  } catch (e) {
    console.log(e);
  }

  let body = {
    status: 0,
    data: {
      list
    }
  };
  ctx.body = body;
};