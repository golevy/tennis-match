import { fetchUserInfo, needAuthenticate } from "../../api/user"
import { navigateToPostGame, navigateToWelcome } from "../../navigator"
import { fetchAllUserGames } from "../../api/game"
import { getAppConfig } from "../../api/util"
const app = getApp()

Page({
  data: {
    currentTab: "home",
    messageFeatureEnabled: false,
    matchFeatureEnabled: false,
    navigationBarHeight: app.globalData.navigationBarHeight, // Safe area
    pages: [
      {
        id: "home",
      },
      {
        id: "user",
      },
      {
        id: "message",
      },
      {
        id: "explore",
      },
    ],
  },

  onTabSelect: function (e) {
    const targetTab = e.currentTarget.dataset.tabid
    if (targetTab === "user" && needAuthenticate()) {
      return
    }

    this.setData({
      currentTab: targetTab,
    })

    if (targetTab === "message") {
      wx.requestSubscribeMessage({
        tmplIds: ["Z5Rcb4pLINMrQRso6KS0zjgtkyXnQzXYbjHvBTZhGlw"],
      }).then((res) => {
        console.log(res)
      })
    }
  },

  handlePostGame(e) {
    if (needAuthenticate()) {
      return
    }

    navigateToPostGame()
  },

  onShow() {
    const { pendingFocusTab } = app.globalData
    console.log("pendingFocusTab", pendingFocusTab)
    if (pendingFocusTab) {
      this.setData({
        currentTab: pendingFocusTab,
      })
      app.globalData.pendingFocusTab = null
    }
  },

  onLoad(options) {
    wx.setStorageSync("throttling", false)
    console.log(options)
    const gameId = options.gameId || app.globalData.showingGameId
    this.setData({
      gameId,
    })
    wx.setStorageSync("throttling", true)
    const tab = options.tab || "home"
    // If tab is valid in pages, set currentTab to tab
    // Else set currentTab to home
    const currentTab = this.data.pages.find((page) => page.id === tab) ? tab : "home"
    this.setData({
      currentTab,
    })

    fetchUserInfo()
      .then((res) => {
        if (res === null) {
          navigateToWelcome()
        }
      })
      .catch((err) => {
        navigateToWelcome()
      })

    fetchAllUserGames(wx.getStorageSync("userInfo")._id).then((games) => {
      let gameHours = 0
      for (const game of games) {
        if (game.participants.length > 1 && game.endDate < Date.now()) {
          gameHours += (game.endDate - game.startDate) / 60 / 60 / 1000
        }
      }
      app.globalData.gameHours = gameHours
    })

    getAppConfig().then((config) => {
      const { messageFeatureEnabled, matchFeatureEnabled } = config

      this.setData({
        messageFeatureEnabled,
        matchFeatureEnabled,
      })
    })
  },

  // 分享到对话框
  onShareAppMessage() {
    return {
      title: "快来加入我吧!",
      path: `/pages/index/index?gameId=${app.globalData.showingGameId}`,
    }
  },

  // 分享到朋友圈
  onShareTimeline() {
    return {
      title: `${wx.getStorageSync("userInfo").nickname}`,
    }
  },
})
