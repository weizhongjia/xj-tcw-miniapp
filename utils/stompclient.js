const Stomp = require('stomp.js').Stomp;
const socketMsgQueue = []
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
const ws = {
    send: sendSocketMessage,
    onopen: null,
    onmessage: null
}
Stomp.setInterval = function () { }
Stomp.clearInterval = function () { }
const client = Stomp.over(ws);
client.init = function (callback) {
    wx.connectSocket({
        url: 'ws://localhost:8080/ws'
    })
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
}
module.exports = client;