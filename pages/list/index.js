//获取应用实例
const app = getApp()
const {request} = require('../../utils/request')
Page({
  /**
   * 页面的初始数据
   */
  data: {
    MovieList:[
      {
        name: '教父',
        comment: '最精彩的剧本，最真是的黑帮故事。',
        imagePath: '/res/jiaofu.jpg',
        isHighlyRecommended: true
      },
      {
        name: '这个杀手不太冷',
        comment: '法国故事。',
        imagePath: '/res/jiaofu.jpg',
        isHighlyRecommended: false
      },
      {
        name: '功夫足球',
        comment: '魔幻巨作。',
        imagePath: '/res/jiaofu.jpg',
        isHighlyRecommended: true
      },
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (app.globalData.token) {
      this.checkUserInfo()
    } else {
      app.loginCallback = res => {
        this.checkUserInfo()
      }
    }
    this.setData({
      // 并没有像vue一样做代理所以不能this.MovieList调用
      currentIndex: this.data.MovieList.length - 1
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    console.log('监听页面显示2')
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    console.log('监听页面隐藏2')    
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    console.log('监听页面卸载2')    
    
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function (val) {
    console.log("上拉")   
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    console.log("转发")
  },
  getHistoryVideo: function () {
    const self = this;
    request({
      url: '/api/wx/video',
      data: {
        orderId: 100000,
        size: 10
      },
      method: "GET",
      success: function(res) {
        console.log(res)
        self.setData({
          MovieList: res.data.data
        })
      }
    })
  },
  checkUserInfo: function(e) {
    wx.getUserInfo({
      // 带上登录信息
      withCredentials: true,
      success: res => {
        // 成功获取用户信息
        this.sendEncryptedData(res.encryptedData, res.iv)
        this.getHistoryVideo()
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
  updateUserInfo: function(res) {
    console.log(res)
    this.sendEncryptedData(res.detail.encryptedData, res.detail.iv)
  },
  // 获取用户信息
  sendEncryptedData: function(encryptedData, iv) {
    let self = this
    request({
      url: '/api/wx/user',
      data: {
        encryptedData: encryptedData,
        iv: iv
      },
      success: function(res) {
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