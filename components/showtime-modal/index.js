Component({
  properties: {
    roomId: {
      type: String,
      value: '',
      observer: function(newVal, oldVal) {}
    },
  },
  data: {
    showtimeProduct:[{time:5, price: 10}, {time: 10, price:20}],
    activeIndex: 0
  },
  methods: {
    closeDialog() {
      let myEventDetail = {} // detail对象，提供给事件监听函数
      let myEventOption = {} // 触发事件的选项
      this.triggerEvent('closeShowtimeModal', myEventDetail, myEventOption)
    },
  }
})
