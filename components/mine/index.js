const {request} = require('../../utils/request')

Component({

  properties: {
    avatarUrl: {
      type: String,
      value: "/res/003.png"
    },
    nickName: {
      type: String,
      value: "金正恩"
    },
    money: {
      type: String,
      value: "0.00元"
    }

  },

  data: {
    
  },
  ready: function () {
    const self = this;
    request({
      url: '/api/wx/pay/account',
      method: "GET",
      success: function(res) {
        console.log(res)
        self.setData({
          money: res.data.data / 100
        })
      }
    })
  },
  methods: {
    wait() {
      wx.showModal({
        title: '',
        content: '敬请期待!',
        success: function (res) {
          if (res.confirm) {
            console.log('用户点击确定')
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    }
  },

})
