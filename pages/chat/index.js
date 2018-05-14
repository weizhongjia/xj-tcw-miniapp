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
        focusHeight: '8px'
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
                console.log(data);
                var newMessage = {
                    id: data.message.id,
                    type: 'other',
                    name: data.user.nikename,
                    time: 'message.sendTime',
                    avatarUrl: data.user.avatarurl,
                    message: data.message.type === 'TEXT' ? data.message.detail : ''
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
          this.sendSocketMessage(this.data.inputValue);
          this.setData({
            inputValue: ""
          });
        }
    },
    // 发送websocket信息
    sendSocketMessage: function (msg) {
        var self = this;
        if (self.data.socketOpen) {
            client.send(chatConfig.sendMsgUrl+'/'+self.data.roomId,
                { priority: 9 },
                JSON.stringify({type: 'TEXT', detail: msg}))
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
      console.log()
    },
    focus(e) {
      // this.setData({
      //   focusHeight: '10px'
      // })
    }
});