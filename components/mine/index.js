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

  },

})
