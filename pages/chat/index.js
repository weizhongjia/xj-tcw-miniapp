const client = require('../../utils/stompclient')
const chatConfig = require('../../config/chatconfig')
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
        inputValue: ""
    },
    onLoad: function (options) {
        const self = this;
        if (app.globalData.token) {
            this.updateUserInfo()
            this.initStompClient()
        } else {
            app.loginCallback = res => {
                this.updateUserInfo()
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
            client.subscribe(chatConfig.subcribeUrl, function (body, headers) {
                var data = JSON.parse(body.body);
                var newMessage = {
                    // id
                    id:'id',
                    type: 'other',
                    name: 'wang',
                    time: '2000-2-2',
                    message: data.content
                };
                var newArray = self.data.messageArray.concat(newMessage);
                self.setData({
                    messageArray: newArray,
                    placeholderText: "请输入信息",
                    num: newArray[newArray.length-1].id
                });
            });
            client.send(chatConfig.sendMsgUrl, { priority: 9 }, JSON.stringify({name: 'zhongjia'}));
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
            client.send(chatConfig.sendMsgUrl, { priority: 9 }, JSON.stringify({name: msg}))

            this.setData({
                messageArray: self.data.messageArray.concat(message),
                num: lastnum+1
            });
        }
    },
    updateUserInfo: function(e) {
        wx.getUserInfo({
            withCredentials: true,
            success: res => {
                console.log(res)
                request({
                    url: '/api/wx/user',
                    data:{
                        encryptedData: res.encryptedData,
                        iv: res.iv
                    },
                    success: function (res) {
                        console.log(res.data)
                    }
                })
            }
        })
    }
});