App({
  onLaunch: function () {
    // 从本地缓存中同步获取token
    var token = wx.getStorageSync('token')
    var that = this
    // 校验用户当前session_key是否有效
    wx.checkSession({
      success: function () {
        if (!token){
          // 没有token的话。登录
          that.login()
        } else {
          // 保存token到全局globalData
          that.globalData.token = token
          
            //由于这里是网络请求，可能会在 Page.onLoad 之后才返回
            // 所以此处加入 callback 以防止这种情况
            if (that.loginCallback){
                that.loginCallback()
            }
        }
      },
      fail: function () {
        //无效则重新登录
        console.log('failed')
        that.login()
      }
    })
  },
  globalData: {
    userInfo: null,
    token: null
  },
  login: function() {
    var that = this
    wx.login({
      success: function (res) {
        if (res.code) {
          //发起网络请求
          wx.request({
            url: 'https://group.mrourou.com/api/wx/user/_login?code=' + res.code,
            method: 'POST',
            success: response => {
              console.log('...')
              console.log(response)
              // 设置token
              wx.setStorageSync('token', response.data.data)
              that.globalData.token = response.data.data
              if (that.loginCallback){
                that.loginCallback(res)
              }
            }
          })
        } else {
          console.log('获取用户登录态失败！' + res.errMsg)
        }
      },
      fail: function(){
        console.log(1)
      }
    });
  }
})