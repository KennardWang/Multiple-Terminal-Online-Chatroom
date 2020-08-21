// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'kennardwang-fzeuy'
})

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  try{
    const res = await cloud.openapi.security.msgSecCheck({
      media:{
        contentType: 'text/*',
        value: Buffer.from(event.value, 'base64')
      }
    })
    return res;
  }
  catch(err){
    return err;
  }
}