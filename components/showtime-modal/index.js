const {request, uploadFile} = require('../../utils/request')

Component({
  properties: {
    roomId: {
      type: String,
      value: '',
      observer: function(newVal, oldVal) {}
    },
  },
  data: {
    showtimeProduct:[{time:5, price: 10}, {time: 10, price:20}],
    activeIndex: 0,
    showtimeType: 'IMAGE',
    uploadedImage: '',
    uploadedVideo: '',
  },
  methods: {
    closeDialog() {
      let myEventDetail = {} // detail对象，提供给事件监听函数
      let myEventOption = {} // 触发事件的选项
      this.triggerEvent('close', myEventDetail, myEventOption)
    },
    changeActiveItem(val) {
      let index = val.currentTarget.dataset.ind
      this.setData({
        activeIndex:index
      })
    },
    changeShowtimeType() {
      if(this.data.showtimeType === "IMAGE") {
        this.setData({
          showtimeType:"VIDEO"
        })
      } else {
        this.setData({
          showtimeType: "IMAGE"
        })
      }
    },
    uploadShowtimeFile(val) {
      let that = this;
      const type = val.currentTarget.dataset.type
      const handlerMap = {
        'image': function (fileSrc) {
          that.setData({
            uploadedImage:fileSrc
          })
        },
        'video': function (fileSrc) {
          that.setData({
            uploadedVideo:fileSrc
          })
        }
      }
      const uploadConfig = {
        type: type,
        count: 1,
        sizeType: ['original', 'compressed'],
        sourceType: ['camera'],
        compressed: true,
        maxDuration: 60,
        callback: handlerMap[type]
      }

      uploadFile(uploadConfig);
    },
    bindBlessInput(e) {
      let value = e.detail.value
      this.setData({
        blessing:value
      })
    },
    submit() {
      let obj = {};
      if (this.data.showtimeType === 'VIDEO' && this.data.uploadedVideo) {
        obj = {type: this.data.showtimeType, src: this.data.uploadedVideo}
      }else if (this.data.showtimeType === 'IMAGE' && this.data.uploadedImage) {
        obj = {type: this.data.showtimeType, src: this.data.uploadedImage}
      }else {
        obj = {type: "TEXT"}
      }

      this.getPayOrderInfo(obj)
    },
    //请求红包订单------> 请求支付接口-------> 请求websocket

    //请求订单信息
    getPayOrderInfo(obj) {
      let that = this
      let showtimePayment = this.data.showtimeProduct[this.data.activeIndex];
      request({
        url: '/api/wx/pay/showtime/order',
        data: {
          "blessing": this.data.blessing || "新婚快乐",
          "price": showtimePayment.price,
          "roomId": this.data.roomId,
          "src": obj.src,
          "time": showtimePayment.time,
          "type": obj.type
        },
        success(res) {
          let data = res.data
          if (data.code === 200) {
            // 订单请求成功之后，请求微信支付
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
      wx.requestPayment({
        'timeStamp': val.paymentDTO.timeStamp,
        'nonceStr': val.paymentDTO.nonceStr,
        'package': val.paymentDTO.ppackage,
        'signType': val.paymentDTO.signType,
        'paySign': val.paymentDTO.paySign,
        'success': function (res) {
          // let  myEventDetail = {
          //   money: this.data.cost,
          //   number: this.data.number,
          //   message: this.data.message,
          //   roomId: this.data.roomId
          // }
          // 红包相关信息
          let myEventDetail = val.order
          let myEventOption = {}
          self.triggerEvent('send', myEventDetail,myEventOption)
          self.closeDialog()
        },
        'fail': function (res) {
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
