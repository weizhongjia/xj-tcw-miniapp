const app = getApp()
const config = require('../config/index')
module.exports = function (obj) {
    obj['header'] = obj.head || {};
    obj.header['content-type'] = obj.header['content-type'] || "application/json"
    obj.url = config.httpProtocol + config.host + obj.url
    obj.header['wx-group-token'] = app.globalData.token
    obj.method = obj.method || "POST"
    wx.request(obj)
}