const app = getApp()
const config = require('../config/index')

const uploadFile = uploadConfig => {
  // 拿token
  const requestToken = function(tempFilePaths) {
    request({
      url: '/api/wx/aliyun/form',
      method: 'GET',
      success: function(res) {
        if (res.data.code = 200) {
          console.log(res.data.data)
          uploadAliyun(res.data.data, tempFilePaths)
        }
      },
    })
  };
  //上传阿里云
  const uploadAliyun = function (token, tempFilePaths){
    let that = this
    let {
      endPoint, expire, ossAccessKeyId, policy, signature
    } = token
    //去掉微信中路径
    let filename = tempFilePaths[0].replace('wxfile://', '')
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
      filePath: tempFilePaths[0], //暂时只支持上传一张
      name: 'file',
      formData: {
        name: tempFilePaths[0],
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
        uploadConfig.callback(fileSrc);
      },
      fail: function(res) {
        console.log(res)
      }
    })
  };
  if (uploadConfig.type === 'image') {
    wx.chooseImage({
      count: uploadConfig.count, // 默认9 暂时支持一张
      sizeType: uploadConfig.sizeType, // 可以指定是原图还是压缩图，默认二者都有
      sourceType: uploadConfig.sourceType, // 可以指定来源是相册还是相机，默认二者都有
      success: function(res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths
        // 将文件上传至阿里云
        requestToken(tempFilePaths)
      },
      fail() {}
    });
  } else if (uploadConfig.type = 'video') {
      wx.chooseVideo({
        sourceType:uploadConfig.sourceType,
        compressed:uploadConfig.compressed,
        maxDuration: uploadConfig.maxDuration,
        success: function (res) {
          var tempFilePaths = res.tempFilePaths
          requestToken(tempFilePaths)
        }
      });
  }

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