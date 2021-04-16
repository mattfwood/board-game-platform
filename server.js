const Router = require('@koa/router');
// const { createServer } = require('http');
const next = require('next');
const { Server } = require('boardgame.io/server');

const { TicTacToe } = require('./lib/Game');

const appPort = parseInt(process.env.PORT, 10) || 3000;
const apiPort = parseInt(process.env.API_PORT, 10) || 8000;
// const port = parseInt(process.env.PORT, 10) || 3000
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// gameServer.run(appPort);

app.prepare().then(() => {
  const gameServer = Server({ games: [TicTacToe] });
  const router = new Router();

  router.all('(.*)', async (ctx) => {
    await handle(ctx.req, ctx.res);
    ctx.respond = false;
  });

  gameServer.app.use(async (ctx, next) => {
    ctx.res.statusCode = 200;
    await next();
  });

  gameServer.app.use(router.routes());

  gameServer.run({
    port: appPort,
    lobbyConfig: { apiPort },
  });
});

// app.prepare().then(() => {
//   createServer((req, res) => {
//     const parsedUrl = new URL(req.url, 'http://w.w');
//     const { pathname, query } = parsedUrl;

//     handle(req, res, parsedUrl);

//     // if (pathname === '/a') {
//     //   app.render(req, res, '/a', query)
//     // } else if (pathname === '/b') {
//     //   app.render(req, res, '/b', query)
//     // } else {
//     //   handle(req, res, parsedUrl)
//     // }
//   }).listen(appPort, (err) => {
//     if (err) throw err;
//     console.log(`> Ready on http://localhost:${appPort}`);
//   });
// });
