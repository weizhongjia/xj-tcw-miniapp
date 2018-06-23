const client = require('../../utils/stompclient')
const chatConfig = require('../../config/index')
const app = getApp()
const request = require('../../utils/request')
const emojiArr = require('../../config/emoji2.js') // emoji配置

Page({
  data: {
    animate: true,
    placeholderText: "连接服务器中...",
    messageArray: [{
        id: 1,
        type: 'self',
        isType: 'HB', //'TEXT' 'IMAGE' 'GIFT' 'HB'
        name: '王猛',
        time: 'message.sendTime',
        avatarUrl: 'https://wx.qlogo.cn/mmopen/vi_32/DYAIOgq83er9SswuAdicMomWoY4OCR4mc25ItVJPCreJ5R5Cwqt5ZnEhS5BI9Yt4iaKP7IJSOTjhxoovnZ64IU5g/132',
        message: {costTime:0,
          createTime:1529743936464,
          giftId:0,
          id:155,
          number:1,
          openid:"ozrMn43Gfh7MmWSJ03gF5uObyfzw",
          orderType:"REDPACK",
          outTradeNo:"1529743936464134756",
          price:0,
          roomId:1,
          totalMoney:1,
          blessing:'1'
        }
      },
    ],
    socketOpen: false,
    inputValue: "",
    userInfo: {},
    roomId: -1,
    isLogin: false, //判断是否登录，显示/隐藏登录btn
    focusHeight: '8px',
    showGift: false, //显示礼物组件
    showHB: false,
    indicatorDots: true, //显示dots
    // emojiArr: [["\ud83d\ude02", "\u{1f004}","\u{1f443}",],[],[]],
    emojiArr: emojiArr,
    indicatorActiveColor: '#e80000',
    showEmoji: false,
    giftArr: [], //传给父组件的礼物列表
    showopenHBComp: false, //打开红包
    showBeforeHBComp: false, //显示红包
    showShowtimeModal: false,
    redpackLeft: false,
    redpackAvatarUrl: '',
    redpackName: '',
  },
  onLoad: function(options) {
    this.data.roomId = options.roomId || 1;
    if (app.globalData.token) {
      this.checkUserInfo()
      this.initStompClient()
    } else {
      app.loginCallback = res => {
        this.checkUserInfo()
        this.initStompClient()
      }
    }
    // 请求礼物列表
    // 放到成功回调之后
    // this.requestGiftList()
  },
  onUnload: function() {
    // 关闭socket
    wx.closeSocket();
  },
  requestGiftList() {
    let self = this
    request({
      url: '/api/wx/gift',
      method: 'GET',
      success(res) {
        console.log(res)
        self.setData({
          giftArr: res.data.data
        })
      }
    })
  },
  bindKeyInput: function(e) {
    this.setData({
      inputValue: e.detail.value
    });
  },
  // 连接websocket聊天 接受广播信息
  initStompClient: function() {
    const self = this;
    client.init(() => {
      this.setData({
        socketOpen: true,
        placeholderText: "连接服务器成功，请输入信息。"
      })
    });
    client.connect({
      'wx-group-token': app.globalData.token
    }, function(sessionId) {
      client.subscribe(chatConfig.subcribeUrl + '/' + self.data.roomId,
        function(body, headers) {
          var data = JSON.parse(body.body).data;
          console.log('接收');
          console.log(data);
          // this.handleMessage(data.message)
          var newMessage = {
            id: data.message.id,
            type: data.user.openid === self.data.userInfo.openId ?
              'self' : 'other',
            isType: data.message.type, //'TEXT' 'IMAGE' 'GIFT' 'REDPACK'
            name: data.user.nikename,
            time: 'message.sendTime',
            avatarUrl: data.user.avatarurl,
            message: data.message.detail || data.message.giftMessageDetail || data.message.orderDetail
          };
          var newArray = [...self.data.messageArray, newMessage];
          self.setData({
            messageArray: newArray,
            placeholderText: "请输入信息",
            num: newArray[newArray.length - 1].id
          });
        });
    })
  },
  send: function() {
    if (this.data.inputValue !== "") {
      this.sendSocketMessage({
        type: 'TEXT',
        detail: this.data.inputValue
      });
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
  sendSocketMessage: function(obj) {
    var self = this;
    if (self.data.socketOpen) {
      client.send(chatConfig.sendMsgUrl + '/' + self.data.roomId, {
          priority: 9
        },
        JSON.stringify(obj))
    }
  },
  checkUserInfo: function(e) {
    wx.getUserInfo({
      // 带上登录信息
      withCredentials: true,
      success: res => {
        // 成功获取用户信息
        this.sendEncryptedData(res.encryptedData, res.iv)
          // 获取礼物信息
        this.requestGiftList()
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
  sendEncryptedData: function(encryptedData, iv) {
    let self = this
    request({
      url: '/api/wx/user',
      data: {
        encryptedData: encryptedData,
        iv: iv
      },
      success: function(res) {
        console.log(res)
        if (res.data.code !== 200) {
          // 不成功删掉token让其重新进入
          wx.removeStorageSync('token')
          wx.showModal({
            title: '提示',
            content: 'session过期，请退出小程序重新进入',
            showCancel: false
          })
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
    this.setData({
      showEmoji: true
    })
  },
  //调用图片拍照功能
  showPhone() {
    let that = this
    wx.chooseImage({
      count: 1, // 默认9 暂时支持一张
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function(res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths
          // 将文件上传至阿里云
        that.requestToken(tempFilePaths)
      },
      fail() {}
    })
  },
  // 拿token
  requestToken(tempFilePaths) {
    let that = this
    request({
      url: '/api/wx/aliyun/form',
      method: 'GET',
      success: function(res) {
        if (res.data.code = 200) {
          console.log(res.data.data)
          that.uploadAliyun(res.data.data, tempFilePaths)
        }
      },
    })
  },
  //上传阿里云
  uploadAliyun(token, tempFilePaths) {
    let that = this
    let {
      endPoint, expire, ossAccessKeyId, policy, signature
    } = token
    //去掉微信中路径
    let filename = tempFilePaths[0].replace('wxfile://', '')
      // 过期返回
    if (expire * 1000 < new Date().getTime()) {
      wx.showToast({
        title: '验证过期',
        icon: 'success',
        duration: 2000
      })
      return
    }
    wx.uploadFile({
      url: endPoint,
      header: {
        'content-type': 'multipart/form-data'
      },
      filePath: tempFilePaths[0], //暂时只支持上传一张
      name: 'file',
      formData: {
        name: tempFilePaths[0],
        key: filename,
        policy,
        ossAccessKeyId,
        success_action_status: '200',
        signature,
      },
      success: function(res) {
        console.log('上传阿里云成功')
          // 在微信开发工具中filename改为下面
          // filename = 'http://tmp/' + filename
        that.sendSocketMessage({
          type: 'IMAGE',
          detail: `${chatConfig.httpProtocol}${chatConfig.uploadHost}/${filename}`
        })
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
  closeGift(val) {
    console.log(val)
    this.setData({
      showGift: false
    })
  },
  showGiftComponent() {
    this.setData({
        showGift: true
      })
      // var alert = document.getElementById('box');
      // requestAnimationFrame(function () {
      //   box.setAttribute('class', 'box mov');
      // })
  },
  // 监听子组件close 关闭gift-cont
  closeHB(val) {
    console.log(val)
    this.setData({
      showHB: false
    })
  },
  showHBComponent() {
    this.setData({
      showHB: true
    })
    // var alert = document.getElementById('box');
    // requestAnimationFrame(function () {
    //   box.setAttribute('class', 'box mov');
    // })
  },
  showShowtimeModal() {
    this.setData({
      showShowtimeModal: true
    })
  },
  closeShowtimeModal() {
    this.setData({
      showShowtimeModal: false
    })
  },
  /*
   *监听子组件sendGift事件，触发发送礼物
   */
  sendGift(val) {
    this.sendSocketMessage({
      type: 'GIFT',
      orderDetail: val.detail
    });
  },
  addEmoji(e) {
    let self = this
    let emoji = e.currentTarget.dataset.emoji
    self.setData({
      inputValue: self.data.inputValue + emoji,
      showEmoji: false
    });
  },
  /*
   *监听子组件sendHB事件，触发发送红包
   */
   sendHB(val) {
    console.log(val)
    this.sendSocketMessage({
      type: 'REDPACK',
      orderDetail: val.detail
    });
   },
   /*
   **openHB 打开红包
   */
  openHB(val) {
    let order = val.currentTarget.dataset.order
    let avatarUrl = val.currentTarget.dataset.avatarUrl
    let name = val.currentTarget.dataset.name
    console.log(val)
    let redpackId = order.id
    let redpackNum = order.number
    let self = this
    request({
      url: `/api/wx/pay/repack/${redpackId}/position`,
      method: 'GET',
      success(res) {
        // 红包位置
        let position = res.data.data
        console.log(res)
        if ( position <= redpackNum-1) {
          self.setData({
            redpackLeft: true,
            redpackAvatarUrl: avatarurl,
            redpackName:name
          }) 
        } else {
          // 红包已经抢完
          self.setData({
            redpackLeft: false,
            redpackAvatarUrl: avatarUrl,
            redpackName:name
          })  
        }
        // self.setData({
          
        // })
      }
    })
    this.setData({
      showBeforeHBComp: true,
    })
   },
   closeopenHB() {
    this.setData({
      showopenHBComp: false,
    })
   },
    closeBeforeHB() {
    this.setData({
      showBeforeHBComp: false,
    })  
    }
});
