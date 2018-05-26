const client = require('../../utils/stompclient')
const chatConfig = require('../../config/index')
const app = getApp()
const request = require('../../utils/request')

Page({
    data: {
        animate: true,
        placeholderText: "连接服务器中...",
        messageArray: [
        //   {
        //     id:'0',
        //     type: 'self',
        //     name: 'wang',
        //     time: '2000-2-2',
        //     message: 'zhongjiashigedashabi'
        // }
        ],
        socketOpen: false,
        inputValue: "",
        userInfo: {},
        roomId: -1,
        isLogin: false, //判断是否登录，显示/隐藏登录btn
        focusHeight: '8px',
        showGift: false, //显示礼物组件
    },
    onLoad: function (options) {
        this.data.roomId = options.roomId;
        if (app.globalData.token) {
            this.checkUserInfo()
            this.initStompClient()
        } else {
            app.loginCallback = res => {
                this.checkUserInfo()
                this.initStompClient()
            }
        }
    },
    onUnload: function () {
        // 关闭socket
        wx.closeSocket();
    },
    bindKeyInput: function (e) {
        this.setData({
            inputValue: e.detail.value
        });
    },
    // 连接websocket聊天 接受广播信息
    initStompClient: function () {
        const self = this;
        client.init(() => {
            this.setData({
                socketOpen:true,
                placeholderText: "连接服务器成功，请输入信息。"
            })
        });
        client.connect({'wx-group-token':app.globalData.token}, function (sessionId) {
            client.subscribe(chatConfig.subcribeUrl+'/'+self.data.roomId, function (body, headers) {
                var data = JSON.parse(body.body).data;
                console.log('接收');
                console.log(data);
                // this.handleMessage(data.message)
                var newMessage = {
                    id: data.message.id,
                    type: 'other',
                    isText: data.message.type === 'TEXT' ? true : false, 
                    name: data.user.nikename,
                    time: 'message.sendTime',
                    avatarUrl: data.user.avatarurl,
                    message:  data.message.detail 
                };
                newMessage.type = data.user.openid === self.data.userInfo.openId ? 'self' : 'other';
                var newArray = [...self.data.messageArray,newMessage];
                self.setData({
                    messageArray: newArray,
                    placeholderText: "请输入信息",
                    num: newArray[newArray.length-1].id
                });
            });
        })
    },
    send: function () {
        if (this.data.inputValue !== "") {
          this.sendSocketMessage({ type: 'TEXT', detail: this.data.inputValue });
          this.setData({
            inputValue: ""
          });
        }
    },
    // 发送websocket信息
    // @param {
    //    type: '',
    //    detail:
    // }
    sendSocketMessage: function (obj) {
        var self = this;
        if (self.data.socketOpen) {
            client.send(chatConfig.sendMsgUrl+'/'+self.data.roomId,
                { priority: 9 },
                JSON.stringify(obj))
        }
    },
    checkUserInfo: function (e) {
        wx.getUserInfo({
            // 带上登录信息
            withCredentials: true,
            success: res => {
                // 成功获取用户信息
                this.sendEncryptedData(res.encryptedData, res.iv)
            },
            fail: res => {
                console.log(res)
                // 显示登录按钮，引导登录
                this.setData({
                  isLogin: false,
                })
            }
        })
    },
    // 手动授权登录
    updateUserInfo: function(res) {
        console.log(res)
        this.sendEncryptedData(res.detail.encryptedData, res.detail.iv)
    },
    // 获取用户信息
    sendEncryptedData: function (encryptedData, iv) {
        let self = this
        request({
            url: '/api/wx/user',
            data:{
                encryptedData: encryptedData,
                iv: iv
            },
            success: function (res) {
                console.log(res)
                if (res.data.code !== 200) {
                    // 不成功删掉token让其重新进入
                    wx.removeStorageSync('token')
                    wx.showModal({title: '提示', content:'session过期，请退出小程序重新进入', showCancel:false})
                }
                app.globalData.userInfo = res.data.data
                self.setData({
                    userInfo: res.data.data,
                    isLogin: true
                })
            }
        })
    },
    showEmoj() {
    },
    //调用图片拍照功能
    showPhone() {
      let that = this
      wx.chooseImage({
        count: 1, // 默认9 暂时支持一张
        sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
        sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
        success: function (res) {
          // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
          var tempFilePaths = res.tempFilePaths
          // 将文件上传至阿里云
          that.requestToken(tempFilePaths)
        },
        fail() {
          // wx.showModal({
          //   title: '提示',
          //   content: '调用失败，请稍后重试',
          //   success: function (res) {
          //     if (res.confirm) {
          //       console.log('用户点击确定')
          //     } else if (res.cancel) {
          //       console.log('用户点击取消')
          //     }
          //   }
          // })
        }
      })
    },
    // 拿token
    requestToken(tempFilePaths) {
      let that = this
      request({
        url: '/api/wx/aliyun/form', 
        method:'GET',
        success: function (res) {
          if (res.data.code =200) {
            console.log(res.data.data)
            that.uploadAliyun(res.data.data, tempFilePaths)
          }
        },
      })
    },
    //上传阿里云
    uploadAliyun(token, tempFilePaths) {
      let that = this
      let { endPoint,expire, ossAccessKeyId, policy, signature } = token
      //去掉微信中路径
      let filename = tempFilePaths[0].replace('wxfile://', '')
      // 过期返回
      if (expire*1000 < new Date().getTime()) {
        wx.showToast({
          title: '验证过期',
          icon: 'success',
          duration: 2000
        })
        return
      }
      wx.uploadFile({
        url: endPoint, 
        header: { 'content-type':'multipart/form-data'},
        filePath: tempFilePaths[0], //暂时只支持上传一张
        name: 'file',
        formData: {
          name: tempFilePaths[0],
          key: filename ,
          policy,
          ossAccessKeyId,
          success_action_status:'200',
          signature,
        },
        success: function (res) {
          console.log('上传阿里云成功')
          // 在微信开发工具中filename改为下面
          // filename = 'http://tmp/' + filename
          that.sendSocketMessage({ type: 'IMAGE', detail: `${chatConfig.httpProtocol}${chatConfig.uploadHost}/${filename}` })
        },
        fail: function(res) {
          console.log(res)
        }
      })
    },
    focus(e) {
      // this.setData({
      //   focusHeight: '10px'
      // })
    },
    // 监听子组件close 关闭gift-cont
    close(val) {
      console.log(val)
      this.setData({
        showGift: false
      })
    },
    showGiftComponent() {
      this.setData({
        showGift: true
      })
    },
    // toggleDialog(show) {
    //   var animationClass = show ? "slipUp" : "slipBottom";
    //   var animation = function () {
    //     var ele = document.getElementById("dialog-face");
    //     ele.className = "dialog-face " + animationClass;
    //     ele = document.getElementById("dialog");
    //     ele.className = "dialog-root " + animationClass;
    //     ele = document.getElementById("dialog-wrapper");
    //     ele.className = "dialog-wrapper " + animationClass;
    //   };
    //   setTimeout(animation, 100);
    // }
});