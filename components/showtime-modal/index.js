const { request, uploadFile } = require('../../utils/request')

Component({
    attached() {

    },
    properties: {
        roomId: {
            type: String,
            value: '',
            observer: function(newVal, oldVal) {}
        },
    },
    data: {
        showtimeProduct: [{ time: 5, price: 10 }, { time: 10, price: 20 }],
        activeIndex: 0,
        showtimeType: 'IMAGE',
        uploadedImage: '',
        uploadedVideo: ''
    },
    attached() {
      this.animation()
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
                activeIndex: index
            })
        },
        changeShowtimeType() {
            if (this.data.showtimeType === "IMAGE") {
                this.setData({
                    showtimeType: "VIDEO"
                })
            } else {
                this.setData({
                    showtimeType: "IMAGE"
                })
            }
        },
        uploadImage() {
            const that = this;
            wx.chooseImage({
                count: 1, // 默认9 暂时支持一张
                sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
                sourceType: ['camera'], // 可以指定来源是相册还是相机，默认二者都有
                success: function(res) {
                    // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
                    var tempFilePaths = res.tempFilePaths
                    // 将文件上传至阿里云
                    uploadFile(tempFilePaths[0], function(fileSrc) {
                        that.setData({
                            uploadedImage: fileSrc
                        })
                    })
                },
                fail() {
                    wx.showToast({
                        title: '上传失败',
                        icon: 'success',
                        duration: 2000
                    })
                }
            });
        },
        uploadVideo() {
            const that = this;
            wx.chooseVideo({
                sourceType: ['camera'],
                success: function(res) {
                    uploadFile(res.tempFilePath, function(fileSrc) {
                        that.setData({
                            uploadedVideo: fileSrc,
                            videoInfo: {
                                duration: parseInt(res.duration),
                                thumbTempFilePath: res.thumbTempFilePath
                            }
                        })
                    })
                }
            });
        },
        uploadShowtimeFile(val) {
            let that = this;
            const type = val.currentTarget.dataset.type
            const handlerMap = {
                'image': function(fileSrc) {
                    that.setData({
                        uploadedImage: fileSrc
                    })
                },
                'video': function(fileSrc) {
                    that.setData({
                        uploadedVideo: fileSrc
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
                blessing: value
            })
        },
        submit() {
            let obj = {};
            if (this.data.showtimeType === 'VIDEO' && this.data.uploadedVideo) {
                obj = { type: this.data.showtimeType, src: this.data.uploadedVideo }
            } else if (this.data.showtimeType === 'IMAGE' && this.data.uploadedImage) {
                obj = { type: this.data.showtimeType, src: this.data.uploadedImage }
            } else {
                obj = { type: "TEXT" }
            }

            this.getPayOrderInfo(obj)
        },
        //请求红包订单------> 请求支付接口-------> 请求websocket

        //请求订单信息
        getPayOrderInfo(obj) {
            let that = this
            let showtimePayment;
            if (this.data.activeIndex === this.data.showtimeProduct.length) {
                showtimePayment = {
                    time: this.data.videoInfo.duration,
                    price: 2 * this.data.videoInfo.duration
                }
            } else {
                showtimePayment = this.data.showtimeProduct[this.data.activeIndex];
            }
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
                'success': function(res) {
                    // let  myEventDetail = {
                    //   money: this.data.cost,
                    //   number: this.data.number,
                    //   message: this.data.message,
                    //   roomId: this.data.roomId
                    // }
                    // 红包相关信息
                    let myEventDetail = val.order
                    let myEventOption = {}
                    self.triggerEvent('send', myEventDetail, myEventOption)
                    self.closeDialog()
                },
                'fail': function(res) {
                    wx.showToast({
                        title: '支付失败',
                        icon: 'success',
                        duration: 2000
                    })
                    self.closeDialog()
                }
            })
        },
        animation() {
            var animation = wx.createAnimation({
                duration: 200,
                timingFunction: "linear",
                delay: 0
            })
            this.animation = animation
            animation.translateY(300).step({ duration: 0 })
            this.setData({
                animationData: animation.export(),
                //showModalStatus: true  
            })
            setTimeout(function() {
                animation.translateY(0).step()
                this.setData({
                    animationData: animation.export()
                })
            }.bind(this), 10)
        }
    }
})
