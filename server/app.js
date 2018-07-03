const Koa = require('koa');
const Router = require('koa-router');
const Knex = require('knex');
const koaBody = require('koa-body');

const conf = require('./conf');
const routers = require('./routers');

const app = new Koa();
const router = new Router();

global.knex = Knex(conf.knex);

app.knex = global.knex;

routers(router);

app
  .use(koaBody({
    multipart: true,
    formidable: {
      uploadDir: 'uploads',
      keepExtensions: true,
      maxFieldsSize: 2 * 1024 * 1024
    }
  }))
  .use(require('koa-bigpipe'))
  .use(router.routes())
  .use(router.allowedMethods())
  .listen(conf.port);

console.log(new Date() + ' | app started with port: ' + conf.port);

