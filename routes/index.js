const router = require('koa-router')()
const server = require('./server')
var DB = require('../module/db')
const md5 = require('blueimp-md5')
const _filter = {
  'pwd': 0,
  '__v': 0
} // 查询时过滤掉
const sms_util = require('../util/sms_util')
const users = {}
let captchaaa = ''
// let shopCart = [] //购物车列表
// const ajax = require('../api/ajax')
var svgCaptcha = require('svg-captcha')

router.prefix('/api')

//登陆注册区域
//1.获取一次性图形验证
router.get('/captcha', async (ctx) => {
  var captcha = svgCaptcha.create({
    ignoreChars: '0o1l',
    noise: 2,
    color: true
  });
  // ctx.session.captcha = captcha.text.toLowerCase();
  ctx.response.type = 'image/svg+xml'
  ctx.body = (captcha.data)
  captchaaa = captcha.text.toLowerCase();
  console.log('图形验证码' + captchaaa)
  console.log(ctx.session.userid)
  console.log(users)
})

//2.用户名密码登陆
router.post('/login_pwd', async (ctx) => {
  const name = ctx.request.body.name
  const pwd = ctx.request.body.pwd
  const captcha = ctx.request.body.captcha
  var user = await DB.find('user', {
    name
  })
  console.log(ctx.session.captcha)
  console.log(name, pwd, captcha)
  if (!user.length) {
    ctx.body = {
      code: 1,
      msg: '用户不存在'
    }
  } else if (captchaaa !== captcha || user[0].pwd != pwd) {
    console.log(captchaaa)
    ctx.body = {
      code: 1,
      msg: '验证码错误或密码错误'
    }
    captchaaa = ''
  } else {
    ctx.session.userid = user[0]._id
    ctx.body = {
      code: 0,
      data: user
    }
  }
})


//3.获取手机短信
router.get('/sendcode', async (ctx) => {
  //1. 获取请求参数数据
  var phone = ctx.request.query.phone;
  console.log(phone + '发送的机号码1111111111111111111111111111111111111111111111111111111111111111111111111111111')
  console.log(ctx)
  //2. 处理数据
  //生成验证码(6位随机数)
  var code = sms_util.randomCode(6);
  //发送给指定的手机号
  console.log(`向${phone}发送验证码短信: ${code}`);
  sms_util.sendCode(phone, code, function (success) { //success表示是否成功
    if (success) {
      users[phone] = code
      console.log('保存验证码: ', phone, code)
      // ctx.body = {
      //   code: 0
      // }
    } else {
      //3. 返回响应数据
      // ctx.body = {
      //   code: 1,
      //   msg: '短信验证码发送失败'
      // }
      console.log(ctx)
    }
  })
})

//4. 手机短信登陆
router.post('/login_sms', async (ctx) => {
  var phone = ctx.request.body.phone;
  var code = ctx.request.body.code;
  console.log('/login_sms', phone, code);
  if (users[phone] != code) {
    ctx.body = {
      code: 1,
      mgs: '手机号或验证码不正确'
    }

    return;
  }
  //删除保存的code
  delete users[phone];
  var user = await DB.find('user', {
    tel: phone
  })
  if (user.length) {
    ctx.body = {
      code: 0,
      data: user
    }
    ctx.session.userid = user[0]._id
  } else {
    var randomCode = sms_util.randomCode(6);
    var json = {
      name: '',
      nickname: '新用户' + randomCode,
      pwd: '',
      tel: phone
    }
    var newuser = await DB.insert('user', json)
    ctx.session.userid = newuser.ops[0]._id
    ctx.body = {
      code: 0,
      data: newuser.ops[0]
    }
  }
})

//5. 注册
router.post('/register', async (ctx) => {
  var userTel = await DB.find('user', {
    tel: ctx.request.body.tel
  })
  console.log(userTel)
  if (userTel.length !== 0) {
    ctx.body = {
      code: 1,
      msg: '此手机号已被注册'
    }
    return
  }
  var userName = await DB.find('user', {
    name: ctx.request.body.name
  })
  console.log(userName)
  console.log(userName.length)
  if (userName.length !== 0) {
    ctx.body = {
      code: 1,
      msg: '用户名已被注册'
    }
    return
  }
  var result = await DB.insert('user', ctx.request.body)
  if (result.insertedCount === 1) {
    ctx.session.userid = result.ops[0]._id
    ctx.body = {
      code: 0,
      data: result.ops[0]
    }
  }
})

//6. 根据sesion中的userid, 查询对应的user
router.get('/userinfo', async (ctx) => {
  // 取出userid
  const userid = ctx.session.userid
  // 查询
  // console.log(userid)
  // ObjectId(userid)
  var user = await DB.find('user', {
    _id: DB.getObjectId(userid)
  })
  // var user = await DB.getObjectId(userid)
  // console.log(user)
  if (user.length === 0) {
    delete ctx.session.userid
    ctx.body = {
      code: 1,
      msg: '请先登陆'
    }
  } else {
    ctx.body = {
      code: 0,
      data: user[0]
    }
  }
})

//7.清除浏览器保存的userid的cookie
router.get('/logout', async (ctx) => {
  // 清除浏览器保存的userid的cookie
  delete ctx.session.userid
  // 返回数据
  ctx.body = {
    code: 0
  }
})

//8.把购物车列表写入到session
router.post('/setshopcat', async (ctx) => {
  const data = ctx.request.body.data
  if (ctx.session.shopCart) {
    const goodIndex = ctx.session.shopCart.findIndex((item) => {
      return item.goodsid === data.goodsid
    })
    if (goodIndex === -1) {
      ctx.session.shopCart.push(data)
    } else {
      ctx.session.shopCart[goodIndex] = data
    }
  } else {
    ctx.session.shopCart = []
    ctx.session.shopCart[0] = data
  }
  ctx.body = {
    data: ctx.session.shopCart
  }
})

//9. 获取session中的购物车列表
router.get('/getshopcart', async (ctx) => {
  data = ctx.session.shopCart
  if (data) {
    ctx.body = {
      code: 0,
      data
    }
  } else {
    ctx.body = {
      code: 1,
      msg: '请登录'
    }
  }
})

//10. 清除购物车
router.post('/clearshopcart', async (ctx) => {
  data = ctx.request.body.data
  const shopCart = ctx.session.shopCart
  // console.log(data)
  let newAyy = []
  if (!data.length) {
    delete ctx.session.shopCart
  } else {
    shopCart.forEach(element => {
      data.forEach(item => {
        if (element.goodsid === item.goodsid) {
          newAyy.push(element)
        }
      })
    });
    ctx.session.shopCart = newAyy
  }
  ctx.body = {
    code: 0,
    msg: '删除成功'
  }
})

router.get('/swiper', server.test) //获取首页轮播图
router.get('/category', server.getcategory) //获取首页分类
router.get('/recommend', server.recommend) //获取首页推荐

router.get('/area', server.area) //获取地区列表

router.get('/enterprise', server.getenterprise) //获取企业商品
// router.post('/add',server.add)

router.get('/product', server.getproduct) //获取产品列表

router.get('/getaddress',server.getaddress) //通过username查询收货地址

router.post('/setaddress',server.setaddress) //设置收货地址

router.post('/upaddress',server.upaddress) //更新收货地址

router.post('/checkaddress',server.checkaddress) //设置默认收货地址

router.get('/getorder',server.getorder) //根据用户id获取订单
router.post('/setorder',server.setorder) //添加订单
router.get('/delorder',server.delorder) //根据缩影删除订单

module.exports = router