module.exports = (router) => {
  router.get('/api/map/list', require('./api/map/list.js'));
  router.get('/api/map/download', require('./api/map/download.js'));
  router.post('/api/map/upload', require('./api/map/upload.js'));
  router.post('/api/map/add', require('./api/map/add.js'));
  router.post('/api/map/edit', require('./api/map/edit.js'));
  router.post('/api/map/delete', require('./api/map/delete.js'));

  router.get('/api/app/info', require('./api/app/info.js'));
  router.get('/api/app/list', require('./api/app/list.js'));
  router.post('/api/app/add', require('./api/app/add.js'));
  router.post('/api/app/delete', require('./api/app/delete.js'));
  router.post('/api/app/edit', require('./api/app/edit.js'));

  router.get('/api/lang/list', require('./api/lang/list.js'));

  router.post('/api/lang/add', require('./api/lang/add.js'));
  router.post('/api/lang/delete', require('./api/lang/delete.js'));

  router.get('*', async function (ctx, next) {
    let body = {
      status: 1,
      message: 'url not exist'
    };
    ctx.body = body;
  });
};

