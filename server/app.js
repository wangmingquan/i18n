const Koa = require('koa');
const Router = require('koa-router');
const Knex = require('knex');
const bodyParser = require('koa-bodyparser');
// const koaBody = require('koa-body');
const multer = require('koa-multer');

const conf = require('./conf');
const routers = require('./routers');

const app = new Koa();
const router = new Router();

global.knex = Knex(conf.knex);

app.knex = global.knex;

routers(router);

app
  .use(multer({dest: './uploads/'}))
  .use(bodyParser())
  .use(require('koa-bigpipe'))
  .use(router.routes())
  .use(router.allowedMethods())
  .listen(conf.port);

console.log(new Date() + ' | app started with port: ' + conf.port);

