const app = getApp()
const config = require('../config/index')

const uploadFile = function(tempFilePath, callback) {

    request({
      url: '/api/wx/aliyun/form',
      method: 'GET',
      success: function(res) {
        if (res.data.code = 200) {
          console.log(res.data.data)
          uploadAliyun(res.data.data, tempFilePath)
        }
      },
    });

  //上传阿里云
  const uploadAliyun = function (token, tempFilePath){
    let {
      endPoint, expire, ossAccessKeyId, policy, signature
    } = token
    //去掉微信中路径
    let filename = tempFilePath.replace('wxfile://', '')
    // 过期返回
    if (expire * 1000 < new Date().getTime()) {
      wx.showToast({
        title: '验证过期',
        icon: 'success',
        duration: 2000
      })
      return
    }
    wx.uploadFile({
      url: endPoint,
      header: {
        'content-type': 'multipart/form-data'
      },
      filePath: tempFilePath, //暂时只支持上传一张
      name: 'file',
      formData: {
        name: tempFilePath,
        key: filename,
        policy,
        ossAccessKeyId,
        success_action_status: '200',
        signature,
      },
      success: function(res) {
        console.log('上传阿里云成功')
        // 在微信开发工具中filename改为下面
        // filename = 'http://tmp/' + filename
        let fileSrc = `${config.httpProtocol}${config.uploadHost}/${filename}`;
        callback(fileSrc);
      },
      fail: function(res) {
        console.log(res)
      }
    })
  };
}
const request = function (obj) {
  obj['header'] = obj.head || {};
  obj.header['content-type'] = obj.header['content-type'] || "application/json"
  obj.url = config.httpProtocol + config.host + obj.url
  obj.header['wx-group-token'] = app.globalData.token
  obj.method = obj.method || "POST"
  wx.request(obj)
}
module.exports = {
    request: request,
    uploadFile : uploadFile
}