// components/beforeHB-cont.js
const request = require('../../utils/request')

Component({
  /**
   * 组件的属性列表
   */
  properties: {
      redpackLeft: {
      type: Boolean,
      value: false,
      observer: function(newVal, oldVal) {}
    },
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
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    avatarUrl:'../../res/mine1.png',
    bjImg: '../../res/openhb2.png',
    bjImg2: '../../res/no-hb.png',
  },

  /**
   * 组件的方法列表
   */
  methods: {
  closeDialog() {
    let myEventDetail = {} 
    let myEventOption = {} 
    this.triggerEvent('closeBeforeHB', myEventDetail, myEventOption)
  },
  },
  attached() {
    console.log(this.data.redpackAvatarUrl)
  }
})
