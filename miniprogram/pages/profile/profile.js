import { navigateToChat } from '../../navigator'

const app = getApp()

Page({
  /**
   * Page initial data
   */
  data: {
    appBarHeight: app.globalData.toolbarHeight + app.globalData.statusBarHeight,
    statusBarHeight: app.globalData.statusBarHeight,
    menu: app.globalData.menu,
    selfUserId: wx.getStorageSync('userInfo')._id,
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad(options) {
    console.log('options', options.id)
    this.setData({
      userId: options.id,
    })
  },

  handleContactPerson() {
    const id = this.data.userId
    navigateToChat(id)
  },

  backPage() {
    const pages = getCurrentPages()
    console.log(pages)
    if (pages.length == 1) {
      wx.reLaunch({
        url: '/pages/index/index',
      })
    } else {
      wx.navigateBack({
        delta: 1,
      })
    }
  },

  /**
   * Lifecycle function--Called when page is initially rendered
   */
  onReady() {},

  /**
   * Lifecycle function--Called when page show
   */
  onShow() {},

  /**
   * Lifecycle function--Called when page hide
   */
  onHide() {},

  /**
   * Lifecycle function--Called when page unload
   */
  onUnload() {},

  /**
   * Page event handler function--Called when user drop down
   */
  onPullDownRefresh() {},

  /**
   * Called when page reach bottom
   */
  onReachBottom() {},

  /**
   * Called when user click on the top right corner to share
   */
  onShareAppMessage() {},

  onShareTimeline() {
    return {
      title: `${wx.getStorageSync('userInfo').nickname}`,
    }
  },
})
