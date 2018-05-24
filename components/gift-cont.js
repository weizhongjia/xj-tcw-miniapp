// components/gift-cont.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {

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
      price:'0.01'
    }, {
      imgURL: '../res/003.png',
      name: '小飞机',
      price: '0.1'
      }, {
        imgURL: '../res/003.png',
        name: '打飞机',
        price: '1.00'
    }, {
      imgURL: '../res/003.png',
      name: '打飞机',
      price: '10.00'
    }],
    // 默认应该是第一个的单价
    unitPrice: 0.01
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
        unitPrice: val.currentTarget.dataset.price
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
      // 计算总价
      let total = this.data.unitPrice * this.data.num
      console.log(total)
      wx.requestPayment({
        'timeStamp': '',
        'nonceStr': '',
        'package': 'prepay_id=',
        'signType': 'MD5',
        'paySign': '',
        'success': function (res) {
        },
        'fail': function (res) {
        }
      })
    }
  }
})
