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
    wish:''
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
    minus() {
      if (this.data.num ==1) {
        return 
      }
      let num = this.data.num - 1
      this.setData({
        num: num
      });
    },
    plus() {
      let num = this.data.num + 1
      console.log(num)
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
      wx.requestPayment({
        'timeStamp': '',
        'nonceStr': '',
        'package': 'prepay_id=1232131221',
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
