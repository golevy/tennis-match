Component({
  data: {
    privacyContractName: "",
    showPrivacy: false,
  },

  pageLifetimes: {
    show() {
      const that = this
      const version = wx.getAppBaseInfo().SDKVersion
      if (that.compareVersion(version, "2.32.3") >= 0) {
        wx.getPrivacySetting({
          success(res) {
            if (res.errMsg == "getPrivacySetting:ok") {
              that.setData({
                privacyContractName: res.privacyContractName,
                showPrivacy: res.needAuthorization,
              })
            }
          },
        })
      }
    },
  },

  methods: {
    openPrivacyContract() {
      wx.openPrivacyContract({
        fail: () => {
          wx.showToast({
            title: "遇到错误",
            icon: "error",
          })
        },
      })
    },

    exitMiniProgram() {
      wx.showToast({
        title: "必须同意后才可以继续使用当前小程序",
        icon: "none",
      })
    },

    handleAgreePrivacyAuthorization() {
      this.setData({
        showPrivacy: false,
      })
    },

    compareVersion(v1, v2) {
      v1 = v1.split(".")
      v2 = v2.split(".")
      const len = Math.max(v1.length, v2.length)

      while (v1.length < len) {
        v1.push("0")
      }
      while (v2.length < len) {
        v2.push("0")
      }

      for (let i = 0; i < len; i++) {
        const num1 = parseInt(v1[i])
        const num2 = parseInt(v2[i])

        if (num1 > num2) {
          return 1
        } else if (num1 < num2) {
          return -1
        }
      }

      return 0
    },

    handleCatchTouchMove() {
      return
    },
  },
})
