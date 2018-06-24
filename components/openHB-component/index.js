// components/hb-cont/openHB-cont.js
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
  },

  /**
   * 组件的初始数据
   */
  data: {

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
  }
})
