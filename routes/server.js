const router = require('koa-router')()
var DB = require('../module/db')

exports.test = async (ctx) => {

  var result = await DB.find('swiper', {});
  ctx.body = result
}

exports.add = async (ctx) => {
  var result = await DB.insert('swiper',ctx.request.body)
  console.log(result)
  console.log(ctx.request.body)
}