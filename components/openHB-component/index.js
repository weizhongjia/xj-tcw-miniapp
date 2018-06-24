// components/hb-cont/openHB-cont.js
const app = getApp()
const utils = require('./../../utils/util')

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    roomId: {
      type: String,
      value: '',
      observer: function(newVal, oldVal) {}
    },
    redpackAvatarUrl: {
        type: String,
        value: '',
        observer: function(newVal, oldVal) {}
    },
    redpackName: {
        type: String,
        value: '',
        observer: function(newVal, oldVal) {}
    },
    redpackOrder: {
      type: Object,
      value: {},
      observer: function(newVal, oldVal) {}
    },
    redpackList: {
      type: Array,
      value: [],
      observer: function(newVal, oldVal) {}
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    // openId: app.globalData.userInfo.openId
    totalMoney: '',
    totalNumber: '',
    myMoney:''
  },

  /**
   * 组件的方法列表
   */
  methods: {
  closeDialog() {
    let myEventDetail = {} // detail对象，提供给事件监听函数
    let myEventOption = {} // 触发事件的选项
    this.triggerEvent('closeopenHB', myEventDetail, myEventOption)
  },
  filterData() {
    let myredpack;
    myredpack = this.data.redpackList.filter(item => item.openId = app.globalData.userInfo.openId)
    myredpack.forEach( item => item.formatOpenTime = utils.formatTime(new Date(item.openTime)))
    console.log(myredpack)
    this.setData({
      myMoney: myredpack[0].money/100
    })
  }
  },
  attached() {
    this.filterData()
  }
})
