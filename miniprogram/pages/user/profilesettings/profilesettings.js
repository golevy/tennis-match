import { fetchUserInfo, signup, updateUserInfo } from "../../../api/user"

const NICKNAME_LENGTH = 10

Page({
  data: {
    gender: "male",
    level: "1.0",
    workday: [{ value: "Workday", name: "工作日", checked: false }],
    weekend: [{ value: "Weekend", name: "周末", checked: false }],
    workdayDaylightSelected: false,
    workdayNightSelected: false,
    weekendDaylightSelected: false,
    weekendNightSelected: false,
    originalData: null,
  },

  handleAvatarChoosen() {
    const that = this
    wx.chooseMedia({
      count: 1,
      mediaType: ["image"],
      sizeType: ["original"],
      sourceType: ["album", "camera"],
      maxDuration: 30,
      camera: "back",
      success(res) {
        console.log("选择成功", res)
        that.upLoadImg(res.tempFiles[0].tempFilePath)
      },
    })
  },

  upLoadImg(fileUrl) {
    const that = this
    wx.cloud.uploadFile({
      cloudPath: `user-avatars/${Date.now()}.png`,
      filePath: fileUrl,
      success: (res) => {
        console.log("上传成功", res)
        that.setData({
          avatarUrl: res.fileID,
          avatarChanged: true,
        })
        console.log("avatarUrl:", that.data.avatarUrl)
      },
      fail: console.error,
    })
  },

  handleLevelChange(e) {
    this.setData({
      level: e.detail.value,
    })
  },

  handleGenderSelect(e) {
    const gender = e.currentTarget.dataset.gender
    this.setData({
      gender,
    })
  },

  handleWorkdayCheckboxChange(e) {
    console.log("checkbox发生change事件，携带value值为：", e.detail.value)

    const workday = this.data.workday
    const values = e.detail.value
    for (let i = 0, lenI = workday.length; i < lenI; ++i) {
      workday[i].checked = false

      for (let j = 0, lenJ = values.length; j < lenJ; ++j) {
        if (workday[i].value === values[j]) {
          workday[i].checked = true
          break
        }
      }
    }

    if (!workday[0].checked) {
      this.setData({
        workdayDaylightSelected: false,
        workdayNightSelected: false,
      })
    }

    this.setData({
      workday,
    })

    if (workday[0].checked) {
      this.setData({
        availableWorkday: "工作日",
      })
    } else {
      this.setData({
        availableWorkday: "",
      })
    }
  },

  handleWorkdayTimeSelect(e) {
    const workdayTime = e.currentTarget.dataset.workday

    if (workdayTime === "daylight") {
      this.setData({
        workdayDaylightSelected: !this.data.workdayDaylightSelected,
      })
    } else if (workdayTime === "night") {
      this.setData({
        workdayNightSelected: !this.data.workdayNightSelected,
      })
    }

    // If either of the time selections is true, ensure the workday checkbox is checked.
    if (this.data.workdayDaylightSelected || this.data.workdayNightSelected) {
      this.setData({
        "workday[0].checked": true,
        availableWorkday: "工作日",
      })
    } else {
      // If both time selections are false, uncheck the workday checkbox.
      this.setData({
        "workday[0].checked": false,
        availableWorkday: "",
      })
    }
  },

  handleWeekendCheckboxChange(e) {
    console.log("checkbox发生change事件，携带value值为：", e.detail.value)

    const weekend = this.data.weekend
    const values = e.detail.value
    for (let i = 0, lenI = weekend.length; i < lenI; ++i) {
      weekend[i].checked = false

      for (let j = 0, lenJ = values.length; j < lenJ; ++j) {
        if (weekend[i].value === values[j]) {
          weekend[i].checked = true
          break
        }
      }
    }

    if (!weekend[0].checked) {
      this.setData({
        weekendDaylightSelected: false,
        weekendNightSelected: false,
      })
    }

    this.setData({
      weekend,
    })

    if (weekend[0].checked) {
      this.setData({
        availableWeekend: "周末",
      })
    } else {
      this.setData({
        availableWeekend: "",
      })
    }
  },

  handleWeekendTimeSelect(e) {
    const weekendTime = e.currentTarget.dataset.weekend

    if (weekendTime === "daylight") {
      this.setData({
        weekendDaylightSelected: !this.data.weekendDaylightSelected,
      })
    } else if (weekendTime === "night") {
      this.setData({
        weekendNightSelected: !this.data.weekendNightSelected,
      })
    }

    // If either of the time selections is true, ensure the weekend checkbox is checked.
    if (this.data.weekendDaylightSelected || this.data.weekendNightSelected) {
      this.setData({
        "weekend[0].checked": true,
        availableWeekend: "周末",
      })
    } else {
      // If both time selections are false, uncheck the weekend checkbox.
      this.setData({
        "weekend[0].checked": false,
        availableWeekend: "",
      })
    }
  },

  handleNicknameChange(e) {
    this.setData({
      nickname: e.detail.value,
    })
  },

  handleClubChange(e) {
    this.setData({
      club: e.detail.value,
    })
  },

  handleResidenceChange(e) {
    this.setData({
      residence: e.detail.value,
    })
  },

  handleCourtChange(e) {
    this.setData({
      court: e.detail.value,
    })
  },

  handleIntroductionChange(e) {
    this.setData({
      introduction: e.detail.value,
    })
  },

  getCurrentData() {
    return {
      avatarUrl: this.data.avatarUrl,
      gender: this.data.gender,
      level: this.data.level,
      workdayChecked: this.data.workday[0].checked,
      weekendChecked: this.data.weekend[0].checked,
      workdayDaylightSelected: this.data.workdayDaylightSelected,
      workdayNightSelected: this.data.workdayNightSelected,
      weekendDaylightSelected: this.data.weekendDaylightSelected,
      weekendNightSelected: this.data.weekendNightSelected,
      nickname: this.data.nickname,
      club: this.data.club,
      court: this.data.court,
      residence: this.data.residence,
      introduction: this.data.introduction,
    }
  },

  handleSubmit(e) {
    const currentData = this.getCurrentData()

    if (
      JSON.stringify(currentData) === JSON.stringify(this.data.originalData)
    ) {
      wx.navigateBack()
      return
    }

    const {
      avatarUrl,
      gender,
      edit,
      avatarChanged,
      level,
      nickname,
      court,
      club,
      residence,
      introduction,
    } = this.data

    if (nickname.length > NICKNAME_LENGTH) {
      wx.showToast({
        title: `用户昵称最大字数为 ${NICKNAME_LENGTH}`,
        icon: "none",
      })
      return
    }

    // Check if user selected workday or weekend but didn't specify the time
    if (
      this.data.workday[0].checked &&
      !this.data.workdayDaylightSelected &&
      !this.data.workdayNightSelected
    ) {
      wx.showToast({
        title: "请选择工作日的常打时间",
        icon: "none",
      })
      return
    }

    if (
      this.data.weekend[0].checked &&
      !this.data.weekendDaylightSelected &&
      !this.data.weekendNightSelected
    ) {
      wx.showToast({
        title: "请选择周末的常打时间",
        icon: "none",
      })
      return
    }

    let { availableWorkday, availableWeekend } = this.data
    let workdayAvailability = ""
    let weekendAvailability = ""

    if (this.data.workdayDaylightSelected && this.data.workdayNightSelected) {
      workdayAvailability = "全天"
    } else {
      if (this.data.workdayDaylightSelected) workdayAvailability = "白天"
      if (this.data.workdayNightSelected) workdayAvailability = "晚上"
    }

    if (this.data.weekendDaylightSelected && this.data.weekendNightSelected) {
      weekendAvailability = "全天"
    } else {
      if (this.data.weekendDaylightSelected) weekendAvailability = "白天"
      if (this.data.weekendNightSelected) weekendAvailability = "晚上"
    }

    if (!avatarUrl || avatarUrl.length === 0) {
      wx.showToast({
        title: "请上传头像",
        icon: "none",
      })
      return
    }

    if (!nickname || nickname.length === 0) {
      wx.showToast({
        title: "昵称不能为空",
        icon: "none",
      })
      return
    }

    if (!residence || residence.length === 0) {
      wx.showToast({
        title: "常住地不能为空",
        icon: "none",
      })
      return
    }

    wx.showLoading({
      title: "正在记下来...",
    })

    if (edit) {
      const userId = this.data.userInfo._id
      if (avatarChanged) {
        updateUserInfo(userId, {
          nickname,
          level,
          gender,
          court,
          residence,
          club,
          availableWorkday,
          availableWeekend,
          workdayAvailability,
          weekendAvailability,
          introduction,
          avatarUrl,
        }).then(() => {
          wx.hideLoading()
          wx.navigateBack()
        })
      } else {
        updateUserInfo(userId, {
          nickname,
          level,
          gender,
          residence,
          court,
          club,
          availableWorkday,
          availableWeekend,
          workdayAvailability,
          weekendAvailability,
          introduction,
        }).then(() => {
          wx.hideLoading()
          wx.navigateBack()
        })
      }
    } else {
      this.signup(
        nickname,
        level,
        avatarUrl,
        gender,
        court,
        residence,
        club,
        availableWorkday,
        availableWeekend,
        workdayAvailability,
        weekendAvailability,
        introduction
      )
    }
  },

  signup(
    nickname,
    level,
    avatarUrl,
    gender,
    residence,
    court,
    club,
    availableWorkday,
    availableWeekend,
    workdayAvailability,
    weekendAvailability,
    introduction
  ) {
    signup({
      nickname,
      level,
      avatarUrl: avatarUrl || "",
      gender,
      residence,
      court,
      club,
      availableWorkday,
      availableWeekend,
      workdayAvailability,
      weekendAvailability,
      introduction,
      activeTimestamps: [],
    })
      .then((res) => {
        wx.hideLoading()
        wx.navigateBack({
          delta: 2,
        })
        fetchUserInfo().then((userInfo) => {
          getApp().globalData.userInfo = userInfo
        })
      })
      .catch((err) => {
        wx.hideLoading()
        console.log(err)
        wx.showToast({
          title: "注册失败",
          icon: "none",
        })
      })
  },
  fail: (err) => {
    wx.hideLoading()
    console.log(err)
    wx.showToast({
      title: "上传头像失败",
      icon: "none",
    })
  },

  onLoad(options) {
    if (options.edit === "true") {
      this.setData({
        edit: true,
      })

      fetchUserInfo().then((userInfo) => {
        if (userInfo) {
          const {
            avatarUrl,
            nickname,
            level,
            gender,
            club,
            residence,
            court,
            introduction,
            availableWorkday,
            availableWeekend,
            workdayAvailability,
            weekendAvailability,
          } = userInfo

          // Convert backend data to frontend's checkbox format
          const workdayChecked = availableWorkday === "工作日"
          const weekendChecked = availableWeekend === "周末"

          // Convert backend data to frontend's time selection format
          const workdayDaylightSelected =
            workdayAvailability.includes("白天") ||
            workdayAvailability === "全天"
          const workdayNightSelected =
            workdayAvailability.includes("晚上") ||
            workdayAvailability === "全天"
          const weekendDaylightSelected =
            weekendAvailability.includes("白天") ||
            weekendAvailability === "全天"
          const weekendNightSelected =
            weekendAvailability.includes("晚上") ||
            weekendAvailability === "全天"

          this.setData({
            userInfo,
            avatarUrl,
            gender,
            nickname,
            level,
            club,
            residence,
            court,
            introduction,
            workday: [
              { value: "Workday", name: "工作日", checked: workdayChecked },
            ],
            weekend: [
              { value: "Weekend", name: "周末", checked: weekendChecked },
            ],
            workdayDaylightSelected,
            workdayNightSelected,
            weekendDaylightSelected,
            weekendNightSelected,
            originalData: {
              avatarUrl,
              gender,
              level,
              workdayChecked,
              weekendChecked,
              workdayDaylightSelected,
              workdayNightSelected,
              weekendDaylightSelected,
              weekendNightSelected,
              nickname,
              club,
              residence,
              court,
              introduction,
            },
          })
        }
      })
    }
  },
})
