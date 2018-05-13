const client = require('../../utils/stompclient')
const chatConfig = require('../../config/index')
const app = getApp()
const request = require('../../utils/request')

Page({
    data: {
        animate: true,
        placeholderText: "连接服务器中...",
        messageArray: [{
            id:'0',
            type: 'self',
            name: 'wang',
            time: '2000-2-2',
            message: 'zhongjiashigedashabi'
        }, {
            id:'1',
            type: 'else',
            name: 'wang',
            time: '2000-2-2',
            message: '确实是确实是确实是确实是确实是确实是确实是确实是确实是确实是确实是确实是确实是确实是确实是确实是确实是确实是'
        }],
        socketOpen: false,
        inputValue: "",
        userInfo: {},
        roomId: -1
    },
    onLoad: function (options) {
        const self = this;
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
        client.connect('user', 'pass', function (sessionId) {
            client.subscribe(chatConfig.subcribeUrl+'/'+self.data.roomId, function (body, headers) {
                var data = JSON.parse(body.body);
                console.log(data.data);
                var newMessage = {
                    id: data.message.id,
                    type: 'other',
                    name: data.user.nikename,
                    time: 'message.sendTime',
                    message: data.type === 'TEXT' ? 'data.message.detail' : ''
                };
                var newArray = self.data.messageArray.concat(newMessage);
                self.setData({
                    messageArray: newArray,
                    placeholderText: "请输入信息",
                    num: newArray[newArray.length-1].id
                });
            });
            client.send(chatConfig.sendMsgUrl+'/'+self.data.roomId, { priority: 9 }, JSON.stringify({type: 'TEXT', detail: "zhongjia"}));
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
        let lastnum = self.data.messageArray[self.data.messageArray.length-1].id
        if (self.data.socketOpen) {
            let message = {
              id: lastnum+1,
              type: 'self',
              name: 'wang',
              time: '2000-2-2',
              message: msg
            }
            client.send(chatConfig.sendMsgUrl, { priority: 9 }, JSON.stringify({type: 'TEXT', detail: msg}))

            this.setData({
                messageArray: self.data.messageArray.concat(message),
                num: lastnum+1
            });
        }
    },
    checkUserInfo: function (e) {
        wx.getUserInfo({
            withCredentials: true,
            success: res => {
                app.globalData.userInfo = res.userInfo
                this.setData({
                    userInfo: res.userInfo
                })
                this.sendEncryptedData(res.encryptedData, res.iv)
            },
            fail: res => {
                console.log(res)
            }
        })
    },
    updateUserInfo: function(res) {
        console.log(res)
        app.globalData.userInfo = res.detail.userInfo
        this.setData({
            userInfo: res.detail.userInfo
        })
        this.sendEncryptedData(res.detail.encryptedData, res.detail.iv)
    },
    sendEncryptedData: function (encryptedData, iv) {
        request({
            url: '/api/wx/user',
            data:{
                encryptedData: encryptedData,
                iv: iv
            },
            success: function (res) {
                console.log(res)

            }
        })
    },
    showEmoj() {
      console.log('待开发')
    }
});