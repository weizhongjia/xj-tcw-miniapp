const app = getApp()
const request = require('../../utils/request')

Page({
  data: {
    groupList: []
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {
    if (app.globalData.token) {
      this.updateUserInfo()
    } else {
      app.loginCallback = res => {
        this.updateUserInfo()
      }
    }
  },
  updateUserInfo: function(e) {
    wx.getUserInfo({
      withCredentials: true,
      success: res => {
        console.log(res)
        request({
          url: '/api/wx/user',
          data:{
            encryptedData: res.encryptedData,
            iv: res.iv
          },
          success: function (res) {
            console.log(res.data)
          }
        })
      }
    })
  },
  onShareAppMessage: function (res) {
    return {
      title: '各种各样的群',
      path: '/pages/add/index',
      success: function (res) {
        console.log(res)
        var navUrl = '/pages/add/index?shareTicket=' + res.shareTickets[0]
        console.log(navUrl)
        wx.navigateTo({
          url: navUrl
        })
      },
      fail: function (res) {
        console.log(res)
        // 转发失败
      }
    }
  }
})
