const router = require('koa-router')()
const server = require('./server')
router.prefix('/api')
router.get('/swiper',server.test)  //获取首页轮播图

router.post('/add',server.add)



module.exports = router
