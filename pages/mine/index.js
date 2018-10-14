const app = getApp()
const {request} = require('../../utils/request')

Page({
  data: {
    money: "0元",
    userInfo: {},
  },

  onLoad: function () {
    this.setData({
      userInfo: app.globalData.userInfo
    })
  },

  onShow: function() {
    //在这里更新数据

  }

})
