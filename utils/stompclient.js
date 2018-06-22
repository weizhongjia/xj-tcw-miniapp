const Stomp = require('stomp.js').Stomp;
const socketMsgQueue = []
const app = getApp()
const config = require('../config/index')
let socketOpen = false;
function sendSocketMessage(msg) {
    console.log('send msg:')
    console.log(msg);
    if (socketOpen) {
        wx.sendSocketMessage({
            data: msg
        })
    } else {
        socketMsgQueue.push(msg)
    }
}
function closeWebSocket() {
    wx.closeSocket();
}
const ws = {
    send: sendSocketMessage,
    close: closeWebSocket
}
Stomp.setInterval = function (interval, f) {
    return setInterval(f, interval);
};
Stomp.clearInterval = function (id) {
    return clearInterval(id);
};
const client = Stomp.over(ws);
client.init = function (callback) {
    function openSocket() {
        wx.connectSocket({
            url: config.webSocketProtocol+config.host+'/ws',
            header:{
                'Session-Id': 'xxxxxxxx'
            },
            success: res => {
                console.log("open socket fail")
                console.log(res)
            },
            fail: res => {
                console.log("open socket fail")
                console.log(res)
            },
            complete: res => {
                console.log("open socket complete")
                console.log(res)
            }
        })
    }
    openSocket();
    wx.onSocketOpen(function (res) {
        console.log('WebSocket连接已打开！')
        socketOpen = true;
        while (socketMsgQueue.length !== 0) {
            sendSocketMessage(socketMsgQueue.shift())
        }
        ws.onopen && ws.onopen()
    })
    wx.onSocketMessage(function (res) {
        console.log('收到onmessage事件:', res)
        callback()
        ws.onmessage && ws.onmessage(res)
    })
    wx.onSocketClose(function () {
        socketOpen = false;
        openSocket();
    })
}
module.exports = client;