const client = require('../../utils/stompclient')
const chatConfig = require('../../config/index')
const app = getApp()
const {request, uploadFile} = require('../../utils/request')
const emojiArr = require('../../config/emoji2.js') // emoji配置
const utils = require('./../../utils/util')

Page({
  data: {
    animate: true,
    placeholderText: "连接服务器中...",
    messageArray: [{
        id: 800,
        type: 'other',  //self other
        type: 'self',
        isType: 'HB', //'TEXT' 'IMAGE' 'GIFT' 'HB'
        name: '王猛',
        time: 'message.sendTime',
        avatarUrl: 'https://wx.qlogo.cn/mmopen/vi_32/DYAIOgq83er9SswuAdicMomWoY4OCR4mc25ItVJPCreJ5R5Cwqt5ZnEhS5BI9Yt4iaKP7IJSOTjhxoovnZ64IU5g/132',
        message: {costTime:0,
          createTime:1529743936464,
          giftId:0,
          id:179,
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
      {
        id: 2,
        type: 'other',
        isType: 'SHOWTIME', //'TEXT' 'IMAGE' 'GIFT' 'HB'
        name: '王猛',
        time: 'message.sendTime',
        avatarUrl: 'https://wx.qlogo.cn/mmopen/vi_32/DYAIOgq83er9SswuAdicMomWoY4OCR4mc25ItVJPCreJ5R5Cwqt5ZnEhS5BI9Yt4iaKP7IJSOTjhxoovnZ64IU5g/132',
        message: {costTime:0,
          createTime:1529743936464,
          giftId:0,
          id:179,
          number:1,
          openid:"ozrMn43Gfh7MmWSJ03gF5uObyfzw",
          orderType:"REDPACK",
          outTradeNo:"1529743936464134756",
          price:0,
          roomId:1,
          totalMoney:1,
          blessing:'新婚快乐',
          showtimeType:'VIDEO',
          showtimeSrc:'https://res.mrourou.com/http://tmp/wx47cff4eafcfd4568.o6zAJs9hE4PAyyqv59qYQuYEeyiE.P80hQ7efTZSc809bba2942d789442c0ab761906cdaf1.mp4'
        }
      }
    ],
    socketOpen: false,
    inputValue: "",
    userInfo: {},
    roomId: -1,
    isLogin: false, //判断是否登录，显示/隐藏登录btn
    focusHeight: '',
    showGift: false, //显示礼物组件
    showHB: false,
    indicatorDots: true, //显示dots
    // emojiArr: [["\ud83d\ude02", "\u{1f004}","\u{1f443}",],[],[]],
    emojiArr: emojiArr,
    indicatorActiveColor: '#e80000',
    showEmoji: false,
    giftArr: [], //传给父组件的礼物列表
    giftMap: null, //gift列表转换成map
    giftLikeMap: {}, //类map
    showopenHBComp: false, //打开红包
    showBeforeHBComp: false, //显示红包
    showShowtimeModal: false,
    redpackLeft: false,
    redpackAvatarUrl: '',
    redpackName: '',
    redpackId:'', // 红包ID
    redpackPosition:'', //红包排队
    redpackOrder: '',// 对应打开红包信息
    redpackList:[], // 对应领取的红包列表
    imgHeight: '300rpx',
    imgWidth: '300rpx',
    imgPosition: 'inherit',
    imgMargin: '15rpx',
    clickedImageIndex: null,
    notSendBtn: true, //zbs: 是不是发送按钮
    showKeyboard: false, //zbs: 键盘是否显示
    pullDownId: 500, //zbs: 记录messageArray第一项的id值，下拉刷新时候用到
    doRefresh: true, //zbs: 什么时候刷新
    systemInfo: null,
    videoId: ""
    
  },
  onReady: function () {
    this.videoContext = wx.createVideoContext('myVideo')
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
    this.setData({
      pullDownId: this.data.messageArray[0].id
    })
    // 请求礼物列表
    // 放到成功回调之后
    // this.requestGiftList()
  },
  onShow: function() {
    try {
      var res = wx.getSystemInfoSync();
      this.data.systemInfo = res;
    } catch (e) {
      console.log("获取信息失败")
    }

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
        let data = res.data.data
        // let map = new Map()
        let mapLike = {}
        // data.forEach(item =>{
        //   map.set(item.id,item)
        // })
        data.forEach( item => {
          mapLike[item.id] = item
        })
        self.setData({
          giftArr: data,
          giftLikeMap: mapLike
        })
      }
    })
  },
  bindKeyInput: function(e) {
    let btnFlag = this.data.notSendBtn;
    if(e.detail.value) {
      btnFlag = false;
    }else {
      btnFlag = true;
    }
    this.setData({
      inputValue: e.detail.value,
      notSendBtn: btnFlag
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
              'other' : 'other',
            isType: data.message.type, //'TEXT' 'IMAGE' 'GIFT' 'REDPACK'
            name: data.user.nickname,
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
        inputValue: "",
        inputFocus: true
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
  uploadImage() {
    let that = this;
    wx.chooseImage({
      count: 1, // 默认9 暂时支持一张
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function(res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths
        // 将文件上传至阿里云
        uploadFile(tempFilePaths[0], function (fileSrc) {
          that.sendSocketMessage({
            type: 'IMAGE',
            detail: fileSrc
          })
        })
      },
      fail() {}
    });
  },
  focus(e) {
    // console.log(e);
    const {platform} = this.data.systemInfo;
    console.log(platform);
    let btnFlag = this.data.notSendBtn;
    if (e.detail.value !== '') {
      btnFlag = false;
    } else {
      btnFlag = true;
    }
    this.setData({
      //zbs: 红米note和ios有区别：苹果focusHeight设置为0， 红米设置为下面的
      focusHeight: platform == 'ios' ? "" : e.detail.height + "px",
      showKeyboard: true,
      notSendBtn: btnFlag
    })
    console.log(this.data.focusHeight);
  },
  blur(e) {
    let btnFlag = this.data.notSendBtn;
    if(e.detail.value !== '') {
      btnFlag = false;
    }else {
      btnFlag = true;
    }
    this.setData({
      showKeyboard: false,
      notSendBtn: btnFlag
    })
  },
  // 监听子组件close 关闭gift-cont
  closeGift(val) {
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
    this.setData({
      showHB: false
    })
  },
  showHBComponent() {
    this.setData({
      showHB: true
    })
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
  sendShowtime(val) {
    this.sendSocketMessage({
      type:'SHOWTIME',
      orderDetail:val.detail
    })
  },
  /*
   *监听子组件sendGift事件，触发发送礼物
   */
  sendGift(val) {
    // const {avatar,des,name} = this.data.giftArr.filter( item => item.giftId == val.detail.giftId)
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
    let avatarUrl = val.currentTarget.dataset.avatarurl
    let name = val.currentTarget.dataset.name
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
        // TODO 判断 是否领取过
        if (position == -1) {
          // 说明已经领取过
          self.requestRedpackList(redpackId)
        } else if ( position <= redpackNum-1) {
          // 还有红包
          self.setData({
            redpackLeft: true,
            redpackId: redpackId,
            redpackPosition:position,
            showBeforeHBComp: true,
          }) 
        } else {
          // 红包已经抢完
          self.setData({
            redpackLeft: false,
            showBeforeHBComp: true,
          })  
        }
        self.setData({
          redpackAvatarUrl: avatarUrl,
          redpackName:name,
          redpackOrder: order, // 将对应红包信息赋值给中间变量 redpackOrder 再传递给 beforeHB 和openHB
        }) 
      }
    })

   },
   // 同一个人领取红包，直接调到红包列表
   requestRedpackList(redpackId) {
    let self = this
    let position = -1;
      request({
          url: `/api/wx/pay/redpack/${redpackId}/open/${position}`,
          method: 'GET',
          success(res) {
            console.log(res)
            self.openHBList(res.data.data,'clicked')
          }
      })
   },
   closeopenHB() {
    this.setData({
      showopenHBComp: false,
    })
   },
   // 监听beforeHB 子组件事件，并将红包list信息传过来
   // 或者 同一个人红包第二次开启
   openHBList(val,type) {
    let data = (type === 'clicked' ? val : val.detail) // clicked则是同一个人第二次打开，否则 直接是父组件的事件
    let redpackList = data.map(item => item.openTime = utils.formatTime(new Date(item.openTime)))
    this.setData({
      showopenHBComp: true,
      redpackList: data  
    })    
   },
    closeBeforeHB() {
    this.setData({
      showBeforeHBComp: false,
    })  
    },
    elargeImage(e) {
      let idx = e.currentTarget.dataset.idx
      if (this.data.clickedImageIndex != idx) {
        this.setData({
          clickedImageIndex: idx
        })       
      } else {
        this.setData({
          clickedImageIndex: null
        })
      }


    },

    /*zbs: 下拉刷新  */
    pullDownRefresh() {
      var that = this;
      if(this.data.doRefresh) {
        that.data.doRefresh = false;
        request({
          url: `/api/wx/message/1/before/${that.data.pullDownId}/10`,
          method: 'GET',
          success(res) {
            // console.log("success进来了")
            var appendArr = res.data.data.map((item, key) => ({
              id: item.message.id,
              type: 'other',
              isType: item.message.type, //'TEXT' 'IMAGE' 'GIFT' 'REDPACK'
              name: item.user.nickname,
              time: item.message.sendTime,
              avatarUrl: item.user.avatarurl,
              message: item.message.detail || item.message.orderDetail,
            }));

            var newArr = appendArr.concat(that.data.messageArray);
            // console.log(newArr);
            that.setData({
              messageArray: newArr,
              pullDownId: newArr[0].id,
              doRefresh: true
            })

            //限制下拉刷新的间隔时间
            /* 
            setTimeout(() => {
              that.data.doRefresh = true;
            }, 2000)
            */
          }
        })
      }  
    },

    /*zbs: 视频组件的处理*/
    videoPlay(e) {
      this.setData({
        videoId: e.currentTarget.dataset.id
      })
      this.videoContext.play()

    },

    videoEnd(){
      console.log("视频结束");
      this.setData({
        videoId: ""
      })
    }
});
