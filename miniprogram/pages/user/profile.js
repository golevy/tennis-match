import { fetchAllUserGames } from "../../api/game"
import { fetchUserProfile } from "../../api/user"
import { navigateToProfileSettings, navigateToFeedback, navigateToIndex, navigateToProfile } from "../../navigator"
import { getAppConfig } from "../../api/util"

const app = getApp()
const MONTHS = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"]
const WEEK_OFFSET = 24 * 60 * 60 * 1000
const TEN_DAYS = 10 * 24 * 60 * 60 * 1000
const IMAGE_URL = "https://636c-cloud1-6g8o2pkfb1003081-1318343987.tcb.qcloud.la/user-avatars/miniprogram_code.jpg?sign=fd44ea26698ed98b267033c2f5fac8cc&t=1694593175"

function getDayOfWeekFromTimestamp(timestamp) {
  const date = new Date(timestamp)
  return date.getDay()
}

Component({
  options: {
    addGlobalClass: true,
  },
  /**
   * Component properties
   */
  properties: {
    userId: {
      type: String,
      value: "",
    },
    from: {
      type: String,
    },
    distance: Number,
  },

  /**
   * Component initial data
   */
  data: {
    width: 0,
    height: 0,
    selfUserId: wx.getStorageSync("userInfo")._id,
    activeTab: "info",
    tennisPlayers: [],
    tennisPlayersInfo: [],
    showQR_code: false,
    isRemark: true,
    userFeatureEnabled: false,
  },

  pageLifetimes: {
    show() {
      if (this.data.userId) {
        this.loadUserInfo()
      }
      this.loadUserInfo()
    },
  },

  lifetimes: {
    attached() {
      if (this.data.from === "personal") {
        this.loadUserInfo()
      }

      if (this.data.distance) {
        this.setData({
          distance: this.data.distance,
        })
      }

      getAppConfig().then((config) => {
        const { userFeatureEnabled } = config

        this.setData({
          userFeatureEnabled,
        })
      })
    },

    ready() {
      if (!this.data.userId) {
        wx.onUserCaptureScreen((res) => {
          this.setData({
            showQR_code: true,
          })
        })
      }
    },

    detached() {
      wx.offUserCaptureScreen()
    },
  },

  /**
   * Component methods
   */
  methods: {
    async switchTab(e) {
      const { tabid } = e.currentTarget.dataset
      console.log(tabid)
      this.setData({
        activeTab: tabid,
      })
      if (tabid === "record" && this.data.userInfo.activeTimestamps.length !== 0) {
        this.loadActivity()
      }
    },

    handleSettingClick() {
      navigateToProfileSettings(true)
    },

    async drawActivityGrid(activeTimestamps) {
      const canvas = await this.getCanvasNode(".myCanva")
      const ctx = canvas.getContext("2d")
      const dpr = wx.getSystemInfoSync().pixelRatio
      //宽高乘像素比
      canvas.width = this.data.width * dpr
      canvas.height = this.data.height * dpr
      //再缩放
      ctx.scale(dpr, dpr)
      const today = new Date()
      const week = today.getDay()
      const date = new Date(today - week * WEEK_OFFSET)
      console.log(date)
      let x = 288
      let y = 30 + week * 12
      const WIDTH = 8
      const sundayTime = this.getSundayTimestamp(date)
      this.drawSquares(ctx, x, y, week, WIDTH)
      this.drawMonthLabels(ctx, date, x)
      this.drawActiveSquares(ctx, activeTimestamps, sundayTime, WIDTH, week)
    },

    loadUserInfo() {
      fetchUserProfile(this.data.userId).then((userInfo) => {
        if (userInfo) {
          const nowTimestamp = Date.now()
          if (userInfo.activeTimestamps && userInfo.activeTimestamps.length > 0) {
            const lastTimestamp = userInfo.activeTimestamps[userInfo.activeTimestamps.length - 1]
            userInfo.isWithinTenDays = nowTimestamp - lastTimestamp <= TEN_DAYS
          } else {
            userInfo.isWithinTenDays = false
          }
          this.setData({
            userInfo,
          })
          fetchAllUserGames(userInfo._id).then((games) => {
            console.log(games)
            const inlineNumber = Math.floor((app.globalData.screenWidth - 60) / 42) //Calculate how many avatars can be obtained in a row
            games.forEach((item) =>
              this.setData({
                tennisPlayers: [...this.data.tennisPlayers, ...item.participants].filter((item) => item._id !== (this.data.from === "personal" ? this.data.selfUserId : this.data.userId)),
              })
            ) // get all the tennisPlayers except myself
            this.data.tennisPlayers.forEach((item) => {
              this.data.tennisPlayersInfo.push({
                avatarUrl: item.avatarUrl,
                _id: item._id,
              })
            })
            this.setData({
              tennisPlayersInfo: [...new Set(this.data.tennisPlayersInfo.map(JSON.stringify))].map(JSON.parse).slice(0, inlineNumber),
            }) // get different tennisPlayers’ avatars
          })
        }
      })
    },

    async getCanvasNode(selector) {
      return new Promise((resolve) => {
        const query = this.createSelectorQuery()
        query
          .select(selector)
          .fields({ node: true, size: true })
          .exec((res) => {
            console.log(res)
            this.setData({
              width: res[0].width,
              height: res[0].height,
            })
            resolve(res[0].node)
          })
      })
    },

    getSundayTimestamp(date) {
      date.setHours(0, 0, 0, 0)
      return date - date.getDay() * WEEK_OFFSET
    },

    drawSquares(ctx, x, y, week, WIDTH) {
      for (let index = 1; index <= 500; index++) {
        ctx.fillStyle = "#343434"
        ctx.fillRect(x, y, WIDTH, WIDTH)
        if (week-- === 0) {
          week = 6
          x -= WIDTH + 4
          y = 30 + week * 12
        } else {
          y = 30 + week * 12
        }
        ctx.fillStyle = "#343434"
        ctx.fillRect(x, y, WIDTH, WIDTH)
      }
    },

    drawMonthLabels(ctx, date, x) {
      const gap = date.getDate() / 7
      x -= (Math.floor(gap) + 1) * 12
      const monthIndex = date.getMonth()
      ctx.font = "13px PingFang HK"
      ctx.fillStyle = "#fff"
      ctx.fillText(MONTHS[monthIndex], x, 20)
      for (let count = monthIndex - 1; count >= 0 && x >= 0; count--) {
        x -= 4 * 12
        x < 0 ? "return" : ctx.fillText(MONTHS[count], x, 20)
      }
    },

    drawActiveSquares(ctx, activeTimestamps, sundayTime, WIDTH, week) {
      for (const item of activeTimestamps) {
        let x = 288
        const dayOfWeek = getDayOfWeekFromTimestamp(item)
        const y = 30 + dayOfWeek * 12
        if (sundayTime - item < 0) {
          x = 288
        } else {
          const gap = (sundayTime - item) / (7 * WEEK_OFFSET)
          x -= (Math.floor(gap) + 1) * 12
          if (x < 0) {
            return
          }
        }
        ctx.fillStyle = "#DDF638"
        ctx.fillRect(x, y, WIDTH, WIDTH)
      }
    },

    navigateToFeedback() {
      navigateToFeedback()
    },

    exploreGame() {
      navigateToIndex("home")
    },

    openQR_Code() {
      this.setData({
        showQR_code: true,
      })
    },

    onClose() {
      wx.requestSubscribeMessage({
        tmplIds: [""],
        success(res) {
          console.log(res)
        },
      })
      this.setData({
        showQR_code: false,
      })
      if (this.data.activeTab === "record") {
        this.loadActivity()
      }
    },

    async loadActivity() {
      let activeTimestamps = []
      if (this.data.userId) {
        const res = await fetchUserProfile(this.data.userId)
        activeTimestamps = res.activeTimestamps
      } else {
        activeTimestamps = wx.getStorageSync("userInfo").activeTimestamps
      }
      this.drawActivityGrid(activeTimestamps)
    },

    previewImage() {
      wx.previewImage({
        urls: [IMAGE_URL],
      })
    },

    handlePreviewAvatar() {
      wx.previewImage({
        urls: [this.data.userInfo.avatarUrl],
      })
    },

    handleViewUserProfile(e) {
      navigateToProfile(e.currentTarget.dataset.id)
    },

    handleSaveCard() {
      wx.navigateTo({
        url: "/pages/share/share?isSave=true",
      })
    },
  },
})
