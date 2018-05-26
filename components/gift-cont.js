// components/gift-cont.js
/**
*礼物弹窗组件 
*properties 接受父组件传来的roomId showGift(用于触发动画 TODO)
* triggerEvent close（父组件监听并关闭弹窗） sendGift（把支付订单信息传给父组件，并触发弹幕功能....因为发送信息时间在父组件）
**/ 
const request = require('../utils/request')
Component({
  /**
   * 组件的属性列表
   * 接受父组件传值
   */
  properties: {
    roomId: {
      type: String,
      value: '',
      observer: function (newVal, oldVal) { }
    },
    showGift: {
      type: Boolean,
      value: false,
      observer: function (newVal, oldVal) { }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    num: 1,
    wish: '恭喜恭喜~',
    activeIndex: 0,
    giftArr: [{
      imgURL: 'http://msh.mrourou.com/addons/meepo_xianchang/template/mobile/app/images/baping/images/gift/qixi.png',
      name: '祝福',
      giftId: 1,
      price: '0.01'
    }, {
      imgURL: 'http://msh.mrourou.com/addons/meepo_xianchang/template/mobile/app/images/baping/images/gift/hug.png',
      name: '抱一抱',
      giftId: 2,
      price: '0.1'
    }, {
      imgURL: 'http://msh.mrourou.com/addons/meepo_xianchang/template/mobile/app/images/baping/images/gift/rose.png',
      name: '红玫瑰',
      giftId: 3,
      price: '1.00'
    }, {
      imgURL: 'http://msh.mrourou.com/addons/meepo_xianchang/template/mobile/app/images/baping/images/gift/mmd.png',
      name: '么么哒',
      giftId: 4,
      price: '10.00'
    }, {
      imgURL: 'http://msh.mrourou.com/addons/meepo_xianchang/template/mobile/app/images/baping/images/gift/car.png',
      name: '跑车',
      giftId: 5,
      price: '10.00'
    }, {
      imgURL: 'http://msh.mrourou.com/addons/meepo_xianchang/template/mobile/app/images/baping/images/gift/like.png',
      name: '爱心',
      giftId: 6,
      price: '10.00'
    }, {
      imgURL: 'http://msh.mrourou.com/addons/meepo_xianchang/template/mobile/app/images/baping/images/gift/star.png',
      name: '星星',
      giftId: 7,
      price: '10.00'
    }, {
      imgURL: 'http://msh.mrourou.com/addons/meepo_xianchang/template/mobile/app/images/baping/images/gift/666.png',
      name: '666',
      giftId: 8,
      price: '10.00'
    }, {
      imgURL: 'http://msh.mrourou.com/addons/meepo_xianchang/template/mobile/app/images/baping/images/gift/ams.png',
      name: '爱马仕',
      giftId: 9,
      price: '10.00'
    }, {
      imgURL: 'http://msh.mrourou.com/addons/meepo_xianchang/template/mobile/app/images/baping/images/gift/jiezhi.png',
      name: '钻戒',
      giftId: 10,
      price: '10.00'
    }, {
      imgURL: 'http://msh.mrourou.com/addons/meepo_xianchang/template/mobile/app/images/baping/images/gift/lafei.png',
      name: '拉菲',
      giftId: 11,
      price: '10.00'
    }],
    // 默认应该是第一个的单价
    unitPrice: 0.01,
    giftId: 1,
    // roomId:-1,
  },
  attached() {
    console.log(this.data)
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
      if (this.data.num <= 1) {
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
      if (this.data.num <= 0) {
        wx.showToast({
          title: '亲数量要大于1哦~',
          icon: 'success',
          // image:'/../res/003.png',
          duration: 2000
        })
        return 
      }
      this.getPayOrderInfo()
    },
    getPayOrderInfo() {
      let total = this.data.unitPrice * this.data.num
      let that = this
      request({
        url: '/api/wx/pay/unified/order',
        data: {
          // 'giftId': this.data.giftId,
          // 'number': this.data.num,
          //  'roomId': this.data.roomId 
          'giftId': 1,
          'number': 1,
          'roomId': 1
        },
        success(res) {
          let data = res.data
          if (data.code === 200) {
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
      let that = this
      wx.requestPayment({
        'timeStamp': val.timeStamp,
        'nonceStr': val.nonceStr,
        'package': val.ppackage,
        'signType': val.signType,
        'paySign': val.paySign,
        'success': function (res) {
          // 触发父组件事件
          let myEventDetail = {a:1} // detail对象，提供给事件监听函数
          let myEventOption = {} // 触发事件的选项
          that.triggerEvent('sendGift', myEventDetail, myEventOption)
        },
        'fail': function (res) {
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
