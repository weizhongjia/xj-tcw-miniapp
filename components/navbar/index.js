// components/navbar/navbar.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    list: {
          type: Array,
          value: [],
          observer: function(newVal, oldVal) {}
        },
  },

  /**
   * 组件的初始数据
   */
  data: {
    activeIndex:0
  },
  attached() {
    const sliderWidth = 96; // 需要设置slider的宽度，用于计算中间位置
    let res = wx.getSystemInfoSync();
    this.setData({
      sliderLeft: (res.windowWidth / this.data.list.length - sliderWidth) / 2,
      sliderOffset: res.windowWidth / this.data.list.length * this.activeIndex,
    })
  },
  /**
   * 组件的方法列表
   */
  methods: {
    tabClick(e) {
        let myEventDetail = {
          typeid: e.currentTarget.dataset.typeid
        }
        let myEventOption = {}
        this.triggerEvent('activeTypeId', myEventDetail, myEventOption)

        this.setData({
          activeIndex: e.currentTarget.dataset.index,
          sliderOffset: e.currentTarget.offsetLeft
        })
    }
  }
})
