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
    var self = this;
    console.log("将要连接服务器。");
    wx.connectSocket({
      url: 'wss://group.mrourou.com/ws'
    });

    wx.onSocketOpen(function (res) {
      console.log("连接服务器成功。");
      self.setData({
        placeholderText: "连接服务器成功，请输入信息。",
        socketOpen: true
      });
    });
    wx.onSocketError(function (res) {
      console.log('WebSocket连接打开失败，请检查！')
    })
    wx.onSocketMessage(function (res) {
      console.log('收到服务器内容：' + res.data);
      var data = res.data;
      var dataArray = data.split("_");
      var newMessage = {
        // id
        id:'id',
        type: dataArray[0],
        name: dataArray[1],
        time: dataArray[2],
        message: dataArray[3]
      };
      var newArray = self.data.messageArray.concat(newMessage);
      self.setData({
        messageArray: newArray,
        placeholderText: "请输入信息",
        num: newArray[newArray.length-1].id
      });
    });
    //初始化滚动位置
    this.setNum(this.data.messageArray)
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

  send: function () {
    if (this.data.inputValue != "") {
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
      wx.sendSocketMessage({
        data: message
      })

      this.setData({
        messageArray: self.data.messageArray.concat(message),
        num: lastnum+1
      });
    }
  }
});