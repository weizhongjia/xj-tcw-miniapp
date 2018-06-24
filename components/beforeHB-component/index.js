// components/beforeHB-cont.js
const request = require('../../utils/request')

Component({
    /**
     * 组件的属性列表
     */
    properties: {
        // 是否有红包剩下
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
        },
        redpackId: {
            type: String,
            value: '',
            observer: function(newVal, oldVal) {}
        },
        redpackPosition: {
            type: String,
            value: '',
            observer: function(newVal, oldVal) {}
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        avatarUrl: '../../res/mine1.png',
        bjImg: '../../res/openhb2.png',
        bjImg2: '../../res/no-hb.png',
        animationData: {},
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
        openRedpack() {
            this.data.redpackLeft && this.requestRedpack()
        },
        requestRedpack() {
        	let self = this
            request({
                url: `/api/wx/pay/redpack/${this.data.redpackId}/open/${this.data.redpackPosition}`,
                method: 'GET',
                success(res) {
                	console.log(res)
                	// 
                	self.triggerEvent('openHBList',{},{})
                	self.closeDialog()
                	
                }
            })
        },
        animation() {
	        var animation = wx.createAnimation({
	            duration: 1000,
	            timingFunction: 'ease',
	        })
	        this.animation = animation
	        animation.opacity(0.1).scale(0.1).step()
	        this.setData({
	            animationData: animation.export()
	        })
	        setTimeout(function() {
	            animation.opacity(1).scale(1).step()
	            this.setData({
	                animationData: animation.export()
	            })
	        }.bind(this), 100)
        },
        rotateAndScale: function() {
            // 旋转同时放大
            this.animation.rotate(45).scale(2, 2).step()
            this.setData({
                animationData: animation.export()
            })
        },
        rotateThenScale: function() {
            // 先旋转后放大
            this.animation.rotate(45).step()
            this.animation.scale(2, 2).step()
            this.setData({
                animationData: animation.export()
            })
        },
        rotateAndScaleThenTranslate: function() {
            // 先旋转同时放大，然后平移
            this.animation.rotate(45).scale(2, 2).step()
            this.animation.translate(100, 100).step({ duration: 1000 })
            this.setData({
                animationData: animation.export()
            })
        }
    },

    attached: function() {
    	this.animation()
    },
})