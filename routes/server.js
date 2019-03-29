const router = require('koa-router')()
var DB = require('../module/db')

// http://127.0.0.1:3000/images/swiper/01.jpg
exports.test = async (ctx) => {
  var data = await DB.find('swiper', {});
  if (data) {
    ctx.body = {
      code: 0,
      data
    }
  }
}

exports.getcategory = async (ctx) => {
  var data = await DB.find('category', {})
  if (data) {
    ctx.body = {
      code: 0,
      data
    }
  }
}

exports.recommend = async (ctx) => {
  var data = await DB.find('recommend', {})
  if (data) {
    ctx.body = {
      code: 0,
      data
    }
  }
}

exports.area = async (ctx) => {
  var data = await DB.find('area', {})
  if (data) {
    ctx.body = {
      code: 0,
      data
    }
  }
}

exports.getenterprise = async (ctx) => {
  var data = await DB.find('enterprise', {})
  if (data) {
    ctx.body = {
      code: 0,
      data
    }
  }
}

exports.getproduct = async (ctx) => {
  var data = await DB.find('product', {})
  // console.log(data)
  if (data) {
    ctx.body = {
      code: 0,
      data
    }
  }
}

exports.getaddress = async (ctx) => {
  const username = ctx.query.username
  console.log(username)
  const data = await DB.find('address', {
    username
  })
  if (data) {
    ctx.body = {
      code: 0,
      data
    }
  }
}

exports.setaddress = async (ctx) => {
  const address = ctx.request.body.data.data
  const data = await DB.insert('address', address)
  if (data.insertedCount === 1) {
    ctx.body = {
      code: 0,
      msg: '添加成功'
    }
  }
}

exports.upaddress = async (ctx) => {
  const newadd = ctx.request.body.data.data
  const username = ctx.request.body.data.data.username
  console.log(newadd)
  // console.log(username)
  const data = await DB.update('address', {
    username
  }, newadd)
  if (data.matchedCount === 1) {
    ctx.body = {
      code: 0,
      msg: '修改成功'
    }
  }
}


//选择当前地址
exports.checkaddress = async (ctx) => {
  const _id = ctx.request.body.index
  await DB.update('address', {
    check: true
  }, {
    check: false
  })
  const result = await DB.update('address', {
    _id: DB.getObjectId(_id)
  }, {
    check: true
  })
  ctx.body = {
    code: 0
  }
}

exports.getorder = async (ctx) => {
  const userid = ctx.query.userid
  console.log(ctx.query)
  const data = await DB.find('order', {
    userid
  })
  if (data.length) {
    ctx.body = {
      code: 0,
      data
    }
  } else {
    ctx.body = {
      code: 1,
      msg: '没有订单'
    }
  }
}

exports.setorder = async (ctx) => {
  const data = ctx.request.body.data
  const result = await DB.insert('order',
    data
  )
  if (result.insertedCount >= 0) {
    ctx.body = {
      code: 0,
      mgs: '添加成功'
    }
  }
}

exports.delorder = async (ctx) => {
  const index = ctx.query.index
  console.log(index)
  const result = await DB.find('order')
  const id = result[index]._id
  console.log(id)
  const data = await DB.remove('order', {
    _id: DB.getObjectId(id)
  })
  if (data.deletedCount === 1) {
    ctx.body = {
      code: 0,
      msg: '删除成功'
    }
  }
}
// exports.add = async (ctx) => {
//   var result = await DB.insert('swiper',ctx.request.body)
//   console.log(result)
//   console.log(ctx.request.body)
// }