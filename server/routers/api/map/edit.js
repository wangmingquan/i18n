module.exports = async function (ctx, next) {
  let data = ctx.request.body;
  let knex = global.knex;
  let parent_id = data.parent_id || '';
  let app = data.app;
  let key = data.key;
  let value = data.value;
  let id = parseInt(data.id);
  let comment = data.comment;
  let body = {};

  // 必传参数检查
  if (!app || !key || !id) {
    body = {
      status: -1,
      message: `'appname', 'id', 'key' is required`
    }
  } else {
    let error = '';
    // 如果有value，value必须是个JSON
    if (value) {
      try {
        value = JSON.parse(value);
      } catch (e) {
        error = 'value must be a JSON string';
      }
    }
    if (error) {
      body = {
        status: -1,
        message: error
      }
    } else {
      // 查询APP是否存在
      let hasAppSelect = await knex('app').select().where({ appname: app })
      if (!hasAppSelect.length) {
        body = {
          status: -3,
          message: `the app [${app}] is not exist, please add the app first`
        }
      } else {
        // 对APP支持的语言进行过滤，多语的语种不记录到数据库
        if (value) {
          let languages = JSON.parse(hasAppSelect[0]['languages']) || [];
          let _value = {};
          for (var i in languages) {
            if (value[languages[i]]) {
              _value[languages[i]] = value[languages[i]];
            }
          }
          value = JSON.stringify(_value);
        }
        
        let insertData = { app, key, comment };
        let error = '';
        if (value) insertData.value = value;
        if (parent_id) {
          parent_id = parseInt(parent_id);
          // 检查 parent_id是否存在
          let hasParentIdSelect = await knex('map').select().where({ app, _id: parent_id })
          if (!hasParentIdSelect.length) {
            error = `the parent_id [${parent_id}] is not exist`;
          } else {
            insertData.parent_id = parent_id;
          }
        }
        if (error) {
          body = {
            status: -3,
            message: error
          }
        } else {
          // everything is ok 插
          await knex('map').update(insertData).where({_id: id})
          body = {
            status: 0
          }
        }
      }
    }
  }
  ctx.body = body;
};