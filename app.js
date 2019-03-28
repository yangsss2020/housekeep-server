const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const session = require('koa-session')
const index = require('./routes/index')
const users = require('./routes/users')

// error handler
onerror(app)

//session设置
app.keys = ['some secret hurr'];
const CONFIG = {
key: 'koa:sess', //cookie key (default is koa:sess)
maxAge: 86400000, // cookie 的过期时间 maxAge in ms (default is 1 days)
overwrite: true, //是否可以 overwrite (默认 default true)
httpOnly: true, //cookie 是否只有服务器端可以访问 httpOnly or not (default true)
signed: true, //签名默认 true
rolling: false, //在每次请求时强行设置 cookie，这将重置 cookie 过期时间（默认：false）
renew: false, //(boolean) renew session when session is nearly expired,
};
app.use(session(CONFIG, app));


// middlewares
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))
app.use(require('koa-static')(__dirname + '/dist'))
app.use(views(__dirname + '/views', {
  extension: 'pug'
}))

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// routes
app.use(index.routes(), index.allowedMethods())
app.use(users.routes(), users.allowedMethods())

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

module.exports = app
