// components/hb-cont.js
const request = require('../../utils/request')

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    roomId: {
      type: String,
      value: '',
      observer: function(newVal, oldVal) {}
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    cost: null,
    number:null,
    message: null,
  },

  /**
   * 组件的方法列表
   */
  methods: {
  closeDialog() {
    let myEventDetail = {} // detail对象，提供给事件监听函数
    let myEventOption = {} // 触发事件的选项
    this.triggerEvent('closeHB', myEventDetail, myEventOption)
  },
  // 处理金额数
  bindcost(e) {
    let value = e.detail.value
    let reg = /^([1-9]\d*|0)(\.\d{0,2})?$/

    if(!value) {
      this.setData({
        cost: value
      })      
    } else if (value.match(reg)) {
      this.setData({
        cost: value
      })
    } else {
      let cost = this.data.cost
      this.setData({
        cost: cost
      })
    }
    console.log(this.data.cost)
  },
  //处理红包个数
  bindnum(e) {
    if (Number.isNaN(+e.detail.value)) {
      this.setData({
        number: ''
      })    
      wx.showToast({
        title: '请输入数字',
        icon: 'none',
        image: './../../res/emoj.png',
        duration: 2000
      })
      return
    }
    this.setData({
      number: e.detail.value
    })
  },
  bindmessage(e) {
    this.setData({
      message: e.detail.value
    })
  },
  submit() {
    this.vallidate()
    this.getPayOrderInfo()
  },
  vallidate() {
    //判断金额
    if (!this.data.cost) {
      wx.showToast({
        title: '请输入总金额',
        icon: 'none',
        image: './../../res/emoj.png',
        duration: 2000
      })
      return
    } 

    if (Number.isNaN((parseFloat(this.data.cost)))) {
      wx.showToast({
        title: '请输入数字',
        icon: 'none',
        image: './../../res/emoj.png',
        duration: 2000
      })
      return 
    }  
    // 判断个数
    if (!this.data.number) {
      wx.showToast({
        title: '请输入红包个数',
        icon: 'none',
        image: './../../res/emoj.png',
        duration: 2000
      })
      return 
    } 
    if(!this.data.message) {
      wx.showToast({
        title: '请输入留言',
        icon: 'none',
        image: './../../res/emoj.png',
        duration: 2000
      })     
      return 
    }
  },
  requestHB() {
    //请求红包订单------> 请求支付接口-------> 请求websocket
    let myEventDetail = {} 
    let myEventOption = {}
    myEventDetail = {
      money: this.data.cost,
      number: this.data.number,
      message: this.data.message,
      roomId: this.data.roomId
    }
    this.triggerEvent('sendHB', myEventDetail, myEventOption)
    this.closeDialog()
  },
      //请求订单信息
  getPayOrderInfo() {
    let that = this
    request({
      url: '/api/wx/pay/redpack/order',
      data: {
        // 'money': this.data.money,
        // 'number': this.data.number,
        //  'roomId': this.data.roomId
        "money": 0,
        "number": 0,
        "roomId": 0
      },
      success(res) {
        let data = res.data
        if (data.code === 200) {
          that.payAll(data.data)
        } else {
          wx.showToast({
            title: '失败',
            icon: 'success',
            duration: 2000
          })
        }
      },
    })
  },
  payAll(val) {
    let self = this
    console.log(gift)
    wx.requestPayment({
      'timeStamp': val.timeStamp,
      'nonceStr': val.nonceStr,
      'package': val.ppackage,
      'signType': val.signType,
      'paySign': val.paySign,
      'success': function (res) {
        let  myEventDetail = {
          money: this.data.cost,
          number: this.data.number,
          message: this.data.message,
          roomId: this.data.roomId
        } 
        let myEventOption = {} 
        self.triggerEvent('sendHB', myEventDetail,
          myEventOption)

        //关闭
        self.closeDialog()
      },
      'fail': function (res) {
        // 便于测试
        let myEventDetail = {
          money: this.data.cost,
          number: this.data.number,
          message: this.data.message,
          roomId: this.data.roomId
        }  
        let myEventOption = {} 
        self.triggerEvent('sendGift', myEventDetail,
          myEventOption)
        wx.showToast({
          title: '支付失败',
          icon: 'success',
          duration: 2000
        })
        self.closeDialog()
      }
    })
  }
  }
})
