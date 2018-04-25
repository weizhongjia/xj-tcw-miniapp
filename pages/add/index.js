const app = getApp()
Page({
  data: {
    src: "../../res/003.png",
    shareTicket: "",
    openGId:"",
    groupName:"",
    groupDesc:""
  },
  onLoad: function (option) {
    var that = this
    wx.getShareInfo({
      shareTicket: option.shareTicket,
      success: function(res) {
        console.log(res)
        wx.request({
          url: 'https://group.mrourou.com/wx/decrypt/data',
          header: {
            'content-type': 'application/json', // 默认值
            'wx-group-token': app.globalData.token
          },
          method: 'POST',
          data: {
            encryptedData: res.encryptedData,
            iv: res.iv
          },
          success: res => {
            console.log(res)
            that.setData({
              openGId:res.data.data.openGId
            })
          }
        })
      }
    })
  },
  chooseImg: function(){
    var that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'], 
      success: function (res) {
        that.setData({
          src: res.tempFilePaths
        })
      }
    })
  },
  formSubmit: function (e) {
    console.log('form发生了submit事件，携带数据为：', e)
    wx.request({
      url: 'https://group.mrourou.com/wx/group',
      header: {
        'content-type': 'application/json', // 默认值
        'wx-group-token': app.globalData.token
      },
      method: 'PUT',
      data: {
        groupName: groupNa,
        groupImage: groupImg,
        groupDesc:groupDesc
      },
      success: res => {
        console.log(res)
      }
    })
  },
})