import { navigateToIndex, navigateToPostGame, navigateToProfile } from '../../navigator'
import { fetchUserProfile } from '../../api/user'
import { sendMessage, getMessage } from '../../api/message'
import { newMessagesSend } from '../../api/notification'

const app = getApp()
const CHECK_MESSAGE_INTERVAL = 2000
const SCROLL_BOTTOM_DURATION = 2500
const SCROLL_TOP_POSITION = 99999
const SCROLL_TOP_DURATION = 200
const PAGE_DESTROY_DURATION = 10 * 60 * 1000
const currentDate = new Date()
const year = currentDate.getFullYear()
const month = String(currentDate.getMonth() + 1).padStart(2, '0')
const day = String(currentDate.getDate()).padStart(2, '0')
const hours = String(currentDate.getHours()).padStart(2, '0')
const minutes = String(currentDate.getMinutes()).padStart(2, '0')
const seconds = String(currentDate.getSeconds()).padStart(2, '0')
const currentTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
let isSending = false
let timer = null
let pageDestroyTimer = null

Page({
  data: {
    inputMessage: '',
    chatData: [],
    receiverInfo: {},
    senderInfo: {},
    receiverId: '',
    senderId: '',
    lastMessageCount: 0,
  },

  onLoad: async function (options) {
    if (options.id) {
      const receiverId = options.id
      const receiverInfo = await fetchUserProfile(receiverId)
      const localChatKey = `localChatData_${receiverId}`
      const localChatData = wx.getStorageSync(localChatKey) || []
      const lastMessages = localChatData.slice(-10)

      this.setData({
        receiverInfo: receiverInfo,
        senderInfo: app.userInfo,
        receiverId: receiverId,
        senderId: app.userInfo._id,
        chatData: lastMessages,
      })

      this.scrollToBottom()

      this.startDestroyPageTimer()
    }
  },

  onShow: function () {
    this.startPolling()
    console.log('打开了吗？？？？')

    this.scrollToBottom()

    setTimeout(() => {
      this.scrollToBottom()
    }, SCROLL_BOTTOM_DURATION)
  },

  onUnload: function () {
    this.clearPollingTimer()

    const localChatKey = `localChatData_${this.data.receiverId}`
    wx.setStorageSync(localChatKey, this.data.chatData)

    this.stopDestroyPageTimer()
  },

  scrollToBottom: function () {
    wx.pageScrollTo({
      scrollTop: SCROLL_TOP_POSITION,
      duration: SCROLL_TOP_DURATION,
    })
  },

  startPolling: async function () {
    timer = setInterval(async () => {
      await this.checkNewMessages()
    }, CHECK_MESSAGE_INTERVAL)
  },

  checkNewMessages: async function () {
    try {
      const res = await getMessage(app.userInfo._id, this.data.receiverId)
      console.log('New message:', res)
      const remoteChatData = res
      const messageCount = remoteChatData && remoteChatData.length > 0 ? remoteChatData[0].messages.length : 0
      const newMessageCount = messageCount - this.data.lastMessageCount

      if (newMessageCount > 0) {
        this.setData({
          chatData: remoteChatData,
        })
        this.sortMessages()

        const limitedChatData = remoteChatData.slice(-100)
        wx.setStorageSync('localChatData', limitedChatData)

        this.scrollToBottom()
      }

      this.setData({
        lastMessageCount: messageCount,
      })
    } catch (err) {
      console.log('Error fetching new messages:', err)
    }
  },

  sortMessages: function () {
    const messages = this.data.chatData[0].messages
    const sortedMessages = messages.sort((a, b) => a.sendTime - b.sendTime)

    this.setData({
      'chatData[0].messages': sortedMessages,
    })
  },

  startDestroyPageTimer() {
    this.stopDestroyPageTimer()

    pageDestroyTimer = setTimeout(() => {
      wx.navigateBack({
        delta: 1,
      })
    }, PAGE_DESTROY_DURATION)
  },

  stopDestroyPageTimer() {
    if (!pageDestroyTimer) {
      return
    }

    clearTimeout(pageDestroyTimer)
    pageDestroyTimer = null
  },

  bindTapPost() {
    const id = JSON.stringify(this.data.receiverId)
    navigateToPostGame(id)
    this.clearPollingTimer()
  },

  onInputMessage(event) {
    const inputMessage = event.detail.value
    this.setData({
      inputMessage,
    })
  },

  truncateMessage(message) {
    if (message.length > 10) {
      return message.substring(0, 10) + '...'
    }
    return message
  },

  bindTapSend() {
    const receiverInfo = this.data.receiverInfo
    const messageType = '文本消息'

    if (isSending) {
      return
    }

    const inputMessage = this.data.inputMessage.trim()

    if (!inputMessage) {
      return
    }

    pageDestroyTimer = null

    const truncatedMessage = this.truncateMessage(inputMessage)
    console.log('truncatedMessage', truncatedMessage)

    const action = 'newMessagesSend'
    const data = {
      senderName: app.userInfo.nickname,
      toReceiver: receiverInfo._openid,
      sendContent: truncatedMessage,
      sendTime: currentTime,
      messageType: messageType,
    }

    newMessagesSend(action, data)
      .then((response) => {
        console.log('Message sent successfully', response)
      })
      .catch((error) => {
        console.error('Error sending message', error)
      })

    isSending = true
    const newMessage = {
      content: this.data.inputMessage,
      sendTime: Date.now(),
      senderId: app.userInfo._id,
      receiverId: this.data.receiverId,
      type: 'text',
    }

    const { chatData } = this.data

    if (chatData && chatData.length > 0) {
      const updatedLocalChat = [...this.data.chatData[0].messages, newMessage]
      this.setData({
        'chatData[0].messages': updatedLocalChat,
      })
    }

    try {
      sendMessage(newMessage)

      this.setData({
        inputMessage: '',
      })

      this.scrollToBottom()
    } catch (err) {
      console.log(err)
    } finally {
      isSending = false
    }
  },

  handleViewGamedetail(e) {
    const gameId = e.currentTarget.dataset.gameid
    var that = this
    const tab = 'home'
    wx.showModal({
      title: '提示',
      content: '是否离开当前页面查看球局详情？',
      success(res) {
        if (res.confirm) {
          app.globalData.pendingFocusTab = 'home'
          app.globalData.showingGameId = gameId

          navigateToIndex(tab)
          that.clearPollingTimer()
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      },
    })
  },

  handleViewUserInfo(e) {
    const userId = e.currentTarget.dataset.userid
    navigateToProfile(userId)
    this.clearPollingTimer()
  },

  clearPollingTimer: function () {
    console.log('关闭了吗？？？？')
    clearInterval(timer)
  },
})
