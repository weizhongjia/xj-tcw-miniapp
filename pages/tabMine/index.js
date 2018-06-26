const app = getApp()
const request = require('../../utils/request')

Page({
  data: {
    money: "189.45",
    userInfo: {},
  },

  onLoad: function () {
    if (app.globalData.token) {
      this.checkUserInfo()
    } else {
      app.loginCallback = res => {
        this.checkUserInfo()
      }
    }
  },

  checkUserInfo: function (e) {
    wx.getUserInfo({
      // 带上登录信息
      withCredentials: true,
      success: res => {
        // 成功获取用户信息
        this.sendEncryptedData(res.encryptedData, res.iv)
      },
      fail: res => {
        console.log(res)
        // 显示登录按钮，引导登录
        this.setData({
          isLogin: false,
        })
      }
    })
  },

  // 手动授权登录
  updateUserInfo: function (res) {
    console.log(res)
    this.sendEncryptedData(res.detail.encryptedData, res.detail.iv)
  },

  // 获取用户信息
  sendEncryptedData: function (encryptedData, iv) {
    let self = this
    request({
      url: '/api/wx/user',
      data: {
        encryptedData: encryptedData,
        iv: iv
      },
      success: function (res) {
        console.log(res)
        if (res.data.code !== 200) {
          // 不成功删掉token让其重新进入
          wx.removeStorageSync('token')
          wx.showModal({
            title: '提示',
            content: 'session过期，请退出小程序重新进入',
            showCancel: false
          })
        }
        app.globalData.userInfo = res.data.data
        self.setData({
          userInfo: res.data.data,
          isLogin: true
        })
      }
    })
  },

})
