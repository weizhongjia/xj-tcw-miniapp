// pages/chatlist/index.js
const { request } = require('../../utils/request')

Page({

    /**
     * 页面的初始数据
     */
    data: {
        chatList: [],
        beforeId: ''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.fetchData()
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {
        this.fetchData()
    },
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {

    },
    fetchData() {
        let self = this
        request({
            url: '/api/wx/room',
            method: 'GET',
            data: {
                pageSize: '10',
                beforeId: self.data.beforeId
            },
            success(res) {
                if (res.data.code == 200) {
                    if (res.data.data.length) {
                        let data = res.data.data
                        let len = data.length
                        self.setData({
                            chatList: [...self.data.chatList, ...data],
                            beforeId: data[len - 1] ? data[len - 1].id : ''
                        })
                    } else {
                        wx.showToast({
                            title: '没有更多数据',
                            icon: 'none',
                            duration: 1000
                        })
                    }
                }
            }
        })
    }
})
