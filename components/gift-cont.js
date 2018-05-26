// components/gift-cont.js
const request = require('../utils/request')
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    roomId: {
      type: String, 
      value: '', 
      observer: function(newVal, oldVal){} 
      }
  },

  /**
   * 组件的初始数据
   */
  data: {
    num: 1,
    wish:'恭喜恭喜~',
    activeIndex:0,
    giftArr: [{
      imgURL: '../res/003.png',
      name: '打飞机',
      giftId: 1,
      price:'0.01'
    }, {
      imgURL: '../res/003.png',
      name: '小飞机',
      giftId: 2,      
      price: '0.1'
      }, {
        imgURL: '../res/003.png',
        name: '打飞机',
        giftId: 3,
        price: '1.00'
    }, {
      imgURL: '../res/003.png',
      name: '打飞机',
      giftId: 4,
      price: '10.00'
    }],
    // 默认应该是第一个的单价
    unitPrice: 0.01,
    giftId: 1,
    // roomId:-1,
  },
  attached() {
    console.log(this.data.roomId)
  },
  /**
   * 组件的方法列表
   */
  methods: {
    //  广播事件close  父组件监听bindclose 
    closeDialog() {
      var myEventDetail = {} // detail对象，提供给事件监听函数
      var myEventOption = {} // 触发事件的选项
      this.triggerEvent('close', myEventDetail, myEventOption)
    },
    bindKeyInput(e) {
      this.setData({
        num: e.detail.value
      });
    },
    changeActiveItem(val) {
      // 无法在wxml中传值
      this.setData({
        activeIndex: val.currentTarget.dataset.ind,
        unitPrice: val.currentTarget.dataset.price,
        giftId: val.currentTarget.dataset.giftId,
      })
    },
    minus() {
      if (this.data.num ==1) {
        return 
      }
      this.setData({
          num: + this.data.num - 1
      });
    },
    plus() {
      let num = +this.data.num + 1
      this.setData({
        num: num
      });
    },
    bindwishInput(e) {
      this.setData({
        wish: e.detail.value
      });
    },
    pay() {
      // 请求订单签名
      this.getPayOrderInfo()
    },
    getPayOrderInfo() {
      let total = this.data.unitPrice * this.data.num  
      let that = this
      request({
        url:'/api/wx/pay/unified/order',
        data:{
            // 'giftId': this.data.giftId,
            // 'number': total,
            //  'roomId': this.data.roomId 
          'giftId': 1,
          'number': 1,
          'roomId': 1
        },
        success(res) {
          let data = res.data
            if (data.code ===  200) {
              that.payAll(data.data)
            } else {
              wx.showToast({
                title: '支付失败',
                icon: 'success',
                duration: 2000
              })
            }
        },
      })
    },
    payAll(val) {
      wx.requestPayment({
        'timeStamp': val.timeStamp,
        'nonceStr': val.nonceStr,
        'package': val.ppackage,
        'signType': val.timeStamp,
        'paySign': val.paySign,
        'success': function (res) {
          console.log(res)
        },
        'fail': function (res) {
          console.log(res)
          wx.showToast({
            title: '支付失败',
            icon: 'success',
            duration: 2000
          })
        }
      })
    }
  }
})
