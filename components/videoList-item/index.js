// components/video-list/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    roomName: {
      type: String,
      value: "房间"
    },
    roomImg: {
      type: String,
      value: "/res/003.png"
    },
    author: {
      type: String,
      value: "阿猛"
    },
    authorImg: {
      type: String,
      value: "/res/003.png"
    },
    videoSrc: {
      type: String,
      value: ""
    },
    btnIsShow: {
      type: Boolean,
      value: false
    }

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

  }
})
