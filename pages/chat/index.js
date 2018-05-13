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
        isLogin: false,
        focusHeight: '4px'
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
        wx.closeSocket();
    },
    setNum(data) {
        this.setData({
            num: data[data.length-1].id
        })
    },
    bindKeyInput: function (e) {
        this.setData({
            inputValue: e.detail.value
        });
    },
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
                var newArray = self.data.messageArray.concat(newMessage);
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
            withCredentials: true,
            success: res => {
                this.sendEncryptedData(res.encryptedData, res.iv)
            },
            fail: res => {
                console.log(res)
                this.setData({
                  isLogin: false,
                })
            }
        })
    },
    updateUserInfo: function(res) {
        console.log(res)
        this.sendEncryptedData(res.detail.encryptedData, res.detail.iv)
    },
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