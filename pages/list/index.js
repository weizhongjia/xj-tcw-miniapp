//获取应用实例
const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    MovieList:[
      {
        name: '教父',
        comment: '最精彩的剧本，最真是的黑帮故事。',
        imagePath: '/res/jiaofu.jpg',
        isHighlyRecommended: true
      },
      {
        name: '这个杀手不太冷',
        comment: '最精彩的剧本，最真是的黑帮故事。',
        imagePath: '/res/jiaofu.jpg',
        isHighlyRecommended: true
      },
      {
        name: '功夫足球',
        comment: '最精彩的剧本，最真是的黑帮故事。',
        imagePath: '/res/jiaofu.jpg',
        isHighlyRecommended: true
      },
    ],
    currentIndex: 0,
    count:1,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    this.setData({
      // 并没有像vue一样做代理所以不能this.MovieList调用
      currentIndex: this.data.MovieList.length - 1
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    console.log('监听页面显示2')
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    console.log('监听页面隐藏2')    
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    console.log('监听页面卸载2')    
    
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function (val) {
    console.log("上拉")   
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    console.log("转发")
  },
  func1: function(arg) {
    this.setData({
      count: this.data.count+1
    })
  }
})