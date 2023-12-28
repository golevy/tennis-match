const qrCodeFileId =
  "cloud://cloud1-6g8o2pkfb1003081.636c-cloud1-6g8o2pkfb1003081-1318343987/user-avatars/miniprogram_code.jpg"
const iconUrlFileId =
  "cloud://cloud1-6g8o2pkfb1003081.636c-cloud1-6g8o2pkfb1003081-1318343987/share-images/Icon.png"
const logoUrlFileId =
  "cloud://cloud1-6g8o2pkfb1003081.636c-cloud1-6g8o2pkfb1003081-1318343987/share-images/Logo.png"
const SAVE_IMAGE_DURATION = 1200
const SHOW_TOAST_DURATION = 3000
const CREATE_SHARE_CARD_DURATION = 500
const app = getApp()

Page({
  data: {
    canvasWidth: 750,
    canvasHeight: 1100,
    userAvatarUrl: "",
    iconUrl: "",
    logoUrl: "",
    qrCodeUrl: "",
    isSave: false,
  },

  async onLoad(options) {
    const isSave = options.isSave
    await Promise.all([
      this.getUserAvatar(),
      this.getQRCode(),
      this.getIconUrl(),
      this.getLogoUrl(),
    ])

    this.setData({
      isSave: isSave,
      userInfo: wx.getStorageSync("userInfo"),
    })

    if (this.data.isSave) {
      this.handleSaveCard()
    }
  },

  getUserAvatar() {
    return new Promise((resolve, reject) => {
      wx.cloud
        .downloadFile({
          fileID: app.userInfo.avatarUrl,
        })
        .then((res) => {
          console.log("🚀 ~ file: share.js:48 ~ userAvatar:", res.tempFilePath)
          this.setData({
            userAvatarUrl: res.tempFilePath,
          })
          resolve(res.tempFilePath)
        })
        .catch((error) => {
          console.error("download error", error)
          reject(error)
        })
    })
  },

  getQRCode() {
    return new Promise((resolve, reject) => {
      wx.cloud
        .downloadFile({
          fileID: qrCodeFileId,
        })
        .then((res) => {
          console.log("🚀 ~ file: share.js:65 ~ QRcode:", res.tempFilePath)
          this.setData({
            qrCodeUrl: res.tempFilePath,
          })
          resolve(res.tempFilePath)
        })
        .catch((error) => {
          console.error("download error", error)
          reject(error)
        })
    })
  },

  getIconUrl() {
    return new Promise((resolve, reject) => {
      wx.cloud
        .downloadFile({
          fileID: iconUrlFileId,
        })
        .then((res) => {
          console.log("🚀 ~ file: share.js:82 ~ Icon:", res.tempFilePath)
          this.setData({
            iconUrl: res.tempFilePath,
          })
          resolve(res.tempFilePath)
        })
        .catch((error) => {
          console.error("download error", error)
          reject(error)
        })
    })
  },

  getLogoUrl() {
    return new Promise((resolve, reject) => {
      wx.cloud
        .downloadFile({
          fileID: logoUrlFileId,
        })
        .then((res) => {
          console.log("🚀 ~ file: share.js:99 ~ Logo:", res.tempFilePath)
          this.setData({
            logoUrl: res.tempFilePath,
          })
          resolve(res.tempFilePath)
        })
        .catch((error) => {
          console.error("download error", error)
          reject(error)
        })
    })
  },

  // Handle save card
  handleSaveCard() {
    wx.showLoading({
      title: "保存图片中...",
    })
    setTimeout(() => this.createShareCard(), CREATE_SHARE_CARD_DURATION)
  },

  // Draw share card
  createShareCard() {
    const that = this

    const {
      userAvatarUrl,
      canvasWidth,
      canvasHeight,
      iconUrl,
      logoUrl,
      qrCodeUrl,
    } = this.data
    const {
      availableWorkday,
      workdayAvailability,
      availableWeekend,
      weekendAvailability,
      level,
      court,
      introduction,
    } = this.data.userInfo
    const ctx = wx.createCanvasContext("canvas")
    const paddingTop = 100
    const paddingBottom = 100
    const paddingLeft = 60
    const paddingRight = 60
    const borderRadius = 24
    const offsetX = 180
    const offsetY = 160
    const introductionContent = introduction

    let gradient = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight)
    gradient.addColorStop(0, "#fff") // start color
    gradient.addColorStop(1, "#ddf638") // end color

    // use gradient for background
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)

    // set fill color to white
    ctx.setFillStyle("#FFFFFF")

    // draw rounded rect
    ctx.beginPath()
    ctx.moveTo(paddingLeft + borderRadius, paddingTop)
    ctx.arcTo(
      canvasWidth - paddingRight,
      paddingTop,
      canvasWidth - paddingRight,
      canvasHeight - paddingBottom,
      borderRadius
    )
    ctx.arcTo(
      canvasWidth - paddingRight,
      canvasHeight - paddingBottom,
      paddingLeft,
      canvasHeight - paddingBottom,
      borderRadius
    )
    ctx.arcTo(
      paddingLeft,
      canvasHeight - paddingBottom,
      paddingLeft,
      paddingTop,
      borderRadius
    )
    ctx.arcTo(
      paddingLeft,
      paddingTop,
      canvasWidth - paddingRight,
      paddingTop,
      borderRadius
    )
    ctx.closePath()

    // 使用clip()函数将此区域裁剪为带有圆角的矩形
    ctx.clip()

    // 填充白色背景，同时要考虑padding
    ctx.fillRect(
      paddingLeft,
      paddingTop,
      canvasWidth - paddingLeft - paddingRight,
      canvasHeight - paddingTop - paddingBottom
    )

    // 绘制头像背景
    ctx.save() // 先保存状态 已便于画完圆再用
    ctx.beginPath() //开始绘制

    const avatarWidth = 200 // 头像宽度
    const avatarCenterY = 86 + offsetY // 加上Y偏移量
    const avatarCenterX = canvasWidth / 2 - offsetX // 减去X偏移量
    ctx.arc(
      avatarCenterX,
      avatarCenterY,
      avatarWidth / 2,
      0,
      Math.PI * 2,
      false
    )
    ctx.setFillStyle("#eeeeee")
    ctx.fill()
    ctx.clip()
    console.log("🚀 ~ file: share.js:171 ~ userAvatarUrl", userAvatarUrl)
    ctx.drawImage(
      userAvatarUrl,
      avatarCenterX - avatarWidth / 2,
      avatarCenterY - avatarWidth / 2,
      avatarWidth,
      avatarWidth
    )
    ctx.restore()

    // User name
    ctx.setFontSize(48)
    ctx.setFillStyle("#151515")
    const nickName = wx.getStorageSync("userInfo").nickname
    const usernameX = avatarCenterX + avatarWidth / 2 + 20
    const rightPadding = 80
    const maxUsernameWidth = canvasWidth - usernameX - rightPadding

    function calculateLines(context, text, maxWidth) {
      var words = text.split("")
      var line = ""
      var lineCount = 0

      for (var n = 0; n < words.length; n++) {
        var testLine = line + words[n]
        var metrics = context.measureText(testLine)
        var testWidth = metrics.width
        if (testWidth > maxWidth && n > 0) {
          line = words[n]
          lineCount++
        } else {
          line = testLine
        }
      }
      if (line != "") lineCount++
      return lineCount
    }

    const lines = calculateLines(ctx, nickName, maxUsernameWidth)
    let initialY

    if (lines === 1) {
      initialY = avatarCenterY - 30
    } else {
      initialY = avatarCenterY - 40
    }

    function wrapText(context, text, x, y, maxWidth, lineHeight) {
      var words = text.split("")
      var line = ""

      for (var n = 0; n < words.length; n++) {
        var testLine = line + words[n]
        var metrics = context.measureText(testLine)
        var testWidth = metrics.width
        if (testWidth > maxWidth && n > 0) {
          context.fillText(line, x, y)
          line = words[n]
          y += lineHeight
        } else {
          line = testLine
        }
      }
      context.fillText(line, x, y)
    }

    wrapText(ctx, nickName, usernameX, initialY, maxUsernameWidth, 52)

    // icon and level
    const iconSize = 24
    const levelFontSize = 20
    ctx.setFontSize(levelFontSize)
    const levelText = "NTRP " + level

    const rectPadding = 12
    const levelMetrics = ctx.measureText(levelText)
    const levelWidth = levelMetrics.width

    const rectWidth = iconSize + 10 + levelWidth + 2 * rectPadding
    const rectHeight = Math.max(iconSize, levelFontSize) + 2 * rectPadding

    const rectX = usernameX

    const distanceFromAvatar = 48
    const additionalSpacing = 20
    let rectY
    if (lines === 1) {
      rectY = avatarCenterY + additionalSpacing
    } else {
      rectY = avatarCenterY + distanceFromAvatar
    }

    const gradientSmall = ctx.createLinearGradient(
      rectX,
      rectY,
      rectX + rectWidth,
      rectY
    )
    gradientSmall.addColorStop(0.0504, "#ddf638")
    gradientSmall.addColorStop(0.9665, "#fff")

    const borderRadiusSmall = 24
    ctx.beginPath()
    ctx.moveTo(rectX + borderRadiusSmall, rectY)
    ctx.arcTo(
      rectX + rectWidth,
      rectY,
      rectX + rectWidth,
      rectY + rectHeight,
      borderRadiusSmall
    )
    ctx.arcTo(
      rectX + rectWidth,
      rectY + rectHeight,
      rectX,
      rectY + rectHeight,
      borderRadiusSmall
    )
    ctx.arcTo(rectX, rectY + rectHeight, rectX, rectY, borderRadiusSmall)
    ctx.arcTo(rectX, rectY, rectX + rectWidth, rectY, borderRadiusSmall)
    ctx.closePath()
    ctx.setFillStyle(gradientSmall)
    ctx.fill()

    // 在渐变矩形内部先绘制图标
    const iconX = rectX + rectPadding
    const iconY = rectY + (rectHeight - iconSize) / 2
    console.log("🚀 ~ file: share.js:275 ~ iconUrl", iconUrl)
    ctx.drawImage(iconUrl, iconX, iconY, iconSize, iconSize)

    // 再在图标旁边绘制等级文本
    ctx.setFillStyle("#151515")
    ctx.fillText(
      levelText,
      iconX + iconSize + 10,
      rectY + (rectHeight + levelFontSize) / 2
    )

    // player availability
    const availabilityTitle = "常打时间"
    let availabilityContent
    if (
      availableWorkday &&
      workdayAvailability &&
      availableWeekend &&
      weekendAvailability
    ) {
      availabilityContent =
        availableWorkday +
        workdayAvailability +
        "，" +
        availableWeekend +
        weekendAvailability
    } else if (availableWorkday && workdayAvailability) {
      availabilityContent = availableWorkday + workdayAvailability
    } else if (availableWeekend && weekendAvailability) {
      availabilityContent = availableWeekend + weekendAvailability
    } else {
      availabilityContent = "暂无"
    }

    const titleFontSize = 24
    const contentFontSize = 28
    const verticalSpacing = 16
    const availabilityY = introductionContent
      ? rectY + rectHeight + 270
      : rectY + rectHeight + 120

    // 绘制标题
    ctx.setFontSize(titleFontSize)
    ctx.setFillStyle("#888888")
    ctx.fillText(
      availabilityTitle,
      avatarCenterX - avatarWidth / 2,
      availabilityY
    )

    // 绘制内容
    ctx.setFontSize(contentFontSize)
    ctx.setFillStyle("#151515")
    const contentY = availabilityY + titleFontSize + verticalSpacing
    ctx.fillText(availabilityContent, avatarCenterX - avatarWidth / 2, contentY)

    // 计算并截断文本的函数
    function drawTextWithEllipsis(
      ctx,
      text,
      x,
      y,
      maxWidth,
      fontSize,
      maxLines
    ) {
      const lineHeight = fontSize * 1.3 // 约定行高为字体大小的1.2倍
      let lines = []
      let currentLine = ""
      let words = text.split("")
      let lineCount = 0

      ctx.setFontSize(fontSize)

      for (let word of words) {
        if (lineCount === maxLines - 1) {
          // 在最后一行时，尝试添加省略号
          let testLine = currentLine + word + "..."
          if (ctx.measureText(testLine).width > maxWidth) {
            // 如果加上新词和省略号超出宽度，就结束循环
            break
          }
          currentLine = currentLine + word
        } else {
          // 其他行正常处理
          let testLine = currentLine + word
          if (ctx.measureText(testLine).width > maxWidth) {
            lines.push(currentLine)
            currentLine = word
            lineCount++
          } else {
            currentLine = testLine
          }
        }
      }

      // 处理最后一行
      if (lines.length < maxLines) {
        currentLine += "..."
        lines.push(currentLine)
      }

      // 绘制每一行
      for (let line of lines) {
        ctx.fillText(line, x, y) // 直接使用传入的x坐标
        y += lineHeight
      }
    }

    // 个人简介
    const introductionTitle = "个人简介"
    let introductionContentY

    // 绘制个人简介
    if (introductionContent) {
      const introductionTitleY = availabilityY - 170

      // Introduction Title
      ctx.setFontSize(titleFontSize)
      ctx.setFillStyle("#888888")
      ctx.fillText(
        introductionTitle,
        avatarCenterX - avatarWidth / 2,
        introductionTitleY
      )

      // Introduction Content
      introductionContentY =
        introductionTitleY + titleFontSize + verticalSpacing
      ctx.setFontSize(contentFontSize)
      ctx.setFillStyle("#151515")
      drawTextWithEllipsis(
        ctx,
        introductionContent,
        avatarCenterX - avatarWidth / 2, // 使用 paddingLeft 作为文本区域的起始X坐标
        introductionContentY,
        canvasWidth - paddingLeft - paddingRight - 62, // 最大宽度考虑左右padding
        contentFontSize,
        3
      )
    }

    // player court
    const courtTitle = "常去球场"
    const courtContent = court

    let courtContentY

    if (courtContent) {
      const courtTitleY = contentY + contentFontSize + 40 // 在"常打时间"的内容下方40rpx

      // 绘制常去球场的标题
      ctx.setFontSize(titleFontSize)
      ctx.setFillStyle("#888888")
      ctx.fillText(courtTitle, avatarCenterX - avatarWidth / 2, courtTitleY)

      // 绘制常去球场的内容
      courtContentY = courtTitleY + titleFontSize + verticalSpacing
      ctx.setFontSize(contentFontSize)
      ctx.setFillStyle("#151515")
      ctx.fillText(courtContent, avatarCenterX - avatarWidth / 2, courtContentY)
    }

    // 绘制logo及二维码
    // 确定常去球场的内容的Y坐标。如果有courtContent，那么我们使用courtContentY，否则使用contentY
    let lastContentY = courtContent ? courtContentY : contentY

    // 在常去球场下方一定距离处开始绘制
    const logoAndTextStartY = lastContentY + 60 // 60rpx 作为间距

    // logo
    const logoSize = 60
    const logoX = avatarCenterX - avatarWidth / 2
    console.log("🚀 ~ file: share.js:340 ~ logoUrl", logoUrl)
    ctx.drawImage(logoUrl, logoX, logoAndTextStartY, logoSize, logoSize)

    const textContent1 = "扫一扫或长按二维码，"
    const textContent2 = "来也球找我约球"

    // 绘制文本
    const textX = logoX // 使文本的起始位置和logo对齐
    const textY1 = logoAndTextStartY + logoSize + 60 // 在logo下方60rpx处开始绘制文本
    const textY2 = textY1 + 24 + 10 // 文本大小为24px，并且两行文本之间的间距为10px

    ctx.setFontSize(24)
    ctx.setFillStyle("#151515")

    ctx.fillText(textContent1, textX, textY1)
    ctx.fillText(textContent2, textX, textY2)

    // 获取左侧内容的总高度
    const leftContentHeight = logoSize + 60 + 24 * 2 + 10 // logo的高度 + 60rpx的间隙 + 2行文本高度（24px每行） + 两行文本间的10px间距

    // 设置二维码大小
    const qrCodeSize = 200

    // 设置二维码的起始Y坐标，使其垂直居中
    const qrCodeStartY =
      logoAndTextStartY + (leftContentHeight - qrCodeSize) / 2

    // 二维码的X坐标，保持一定的间隔
    const qrCodeX = canvasWidth - qrCodeSize - rightPadding - 20

    // 绘制二维码
    console.log("🚀 ~ file: share.js:372 ~ qrCodeUrl", qrCodeUrl)
    ctx.drawImage(qrCodeUrl, qrCodeX, qrCodeStartY, qrCodeSize, qrCodeSize)

    // 绘制图片
    ctx.draw(false, function () {
      // 延时生成图片 否则真机测试文字会样式混乱
      setTimeout(() => {
        // 生成图片
        wx.canvasToTempFilePath({
          canvasId: "canvas",
          success: (res) => {
            wx.hideLoading()
            that.createShareImgSuccess(res.tempFilePath)
          },
          fail: () => {
            wx.showToast({
              title: "图片生成失败~",
              icon: "none",
            })
          },
        })
      }, SAVE_IMAGE_DURATION)
    })
  },

  // Save poster to album success
  createShareImgSuccess(tempFilePath) {
    const that = this
    this.setData({
      showPoster: true,
      tempShareImg: tempFilePath,
    })
    wx.saveImageToPhotosAlbum({
      filePath: tempFilePath, //这个只是测试路径，没有效果
      success(res) {
        wx.showToast({
          title: "图片已保存至相册，快去分享吧!",
          icon: "none",
          duration: SHOW_TOAST_DURATION,
        })
      },
      // Save poster to album failed
      fail: (err) => {
        wx.hideLoading()
        if (err.errMsg === "saveImageToPhotosAlbum:fail cancel") {
          that.saveShareImgErr()
        } else if (
          err.errMsg === "saveImageToPhotosAlbum:fail:auth denied" ||
          err.errMsg === "saveImageToPhotosAlbum:fail auth deny" ||
          err.errMsg === "saveImageToPhotosAlbum:fail authorize no response"
        ) {
          wx.showModal({
            title: "温馨提示",
            content: "请开启保存到相册权限，开启后自动保存相册",
            success(res) {
              if (res.confirm) {
                wx.openSetting({
                  success(settingData) {
                    if (settingData.authSetting["scope.writePhotosAlbum"]) {
                      that.createShareImgSuccess(tempFilePath)
                    } else {
                      that.saveShareImgErr()
                    }
                  },
                })
              } else if (res.cancel) {
                that.saveShareImgErr()
              }
            },
          })
        } else {
          that.saveShareImgErr()
        }
      },
    })
  },

  // Save poster to album failed
  saveShareImgErr() {
    wx.showToast({
      title: "图片保存失败~ ",
      icon: "none",
      duration: SHOW_TOAST_DURATION,
    })
  },

  closePoster() {
    this.setData({
      showPoster: false,
    })
    wx.navigateBack({
      delta: 1,
    })
  },
})
