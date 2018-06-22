// components/gift-cont.js
/**
 *礼物弹窗组件
 *properties 接受父组件传来的roomId showGift(用于触发动画 TODO)  giftArr 礼物列表
 * triggerEvent close（父组件监听并关闭弹窗） sendGift（把支付订单信息传给父组件，并触发弹幕功能....因为发送信息时间在父组件）
 **/
const request = require('../../utils/request')
Component({
  /**
   * 组件的属性列表
   * 接受父组件传值
   */
  properties: {
    roomId: {
      type: String,
      value: '',
      observer: function(newVal, oldVal) {}
    },
    showGift: {
      type: Boolean,
      value: false,
      observer: function(newVal, oldVal) {}
    },
    giftArr: {
      type: Array,
      value: [],
      observer: function(newVal, oldVal) {}
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    num: 1, // 礼物数量
    wish: '恭喜恭喜~', // 祝福语
    activeIndex: 0,
    // giftArr: [],
    // roomId:-1,
    giftId: null,
    giftName: null,
    giftAvatar: null,
    giftGif: null,
    // giftDes: '',
    // giftNumber: '',
    giftTime: null,
    costTime: null,
  },
  created() {

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
      // 选择礼物
      changeActiveItem(val) {
        // 无法在wxml中传值
        console.log(val)
        let giftObj = val.currentTarget.dataset.giftobj
        this.setData({
          activeIndex: val.currentTarget.dataset.ind,
          giftId: giftObj.id,
          giftName: giftObj.name,
          giftAvatar: giftObj.avatar,
          costTime: giftObj.costTime,
          giftGif: giftObj.gif,
        })
      },
      minus() {
        if (this.data.num <= 1) {
          return
        }
        this.setData({
          num: +this.data.num - 1
        });
      },
      plus() {
        let num = +this.data.num + 1
        this.setData({
          num: num
        });
      },
      // 祝福语
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
      //请求订单信息
      getPayOrderInfo() {
        let that = this
        request({
          url: '/api/wx/pay/gift/order',
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
        let gift = self.data.giftArr[0]
        console.log(gift)
        wx.requestPayment({
          'timeStamp': val.timeStamp,
          'nonceStr': val.nonceStr,
          'package': val.ppackage,
          'signType': val.signType,
          'paySign': val.paySign,
          'success': function(res) {
            // 触发父组件事件
            let myEventDetail = {
                giftId: self.data.giftId || gift.id,
                giftName: self.data.giftName || gift.name,
                giftAvatar: self.data.giftAvatar || gift.avatar,
                giftGif: self.data.giftGif || gift.gif,
                giftDes: self.data.wish,
                giftNumber: self.data.num,
                giftTime: self.data.costTime || gift.costTime
              } // detail对象，提供给事件监听函数
            let myEventOption = {} // 触发事件的选项
            self.triggerEvent('sendGift', myEventDetail,
              myEventOption)

            //关闭
            self.closeDialog()
          },
          'fail': function(res) {
            let myEventDetail = {
                giftId: self.data.giftId || gift.id,
                giftName: self.data.giftName || gift.name,
                giftAvatar: self.data.giftAvatar || gift.avatar,
                giftGif: self.data.giftGif || gift.gif,
                giftDes: self.data.wish,
                giftNumber: self.data.num,
                giftTime: self.data.costTime || gift.costTime
              } // detail对象，提供给事件监听函数
            let myEventOption = {} // 触发事件的选项
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
