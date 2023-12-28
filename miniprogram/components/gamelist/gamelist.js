import { fetchAllUserGames, fetchHostedGames } from '../../api/game'
import { parseFormattedDate, getDateString, formatDate, getDayOfWeek } from '../../api/util'

const START_TIME_REMAINING = 4 * 60 * 60 * 1000
const app = getApp()
const db = wx.cloud.database()

Component({
  options: {
    addGlobalClass: true,
  },
  /**
   * Component properties
   */
  properties: {
    symbol: String,
    gameId: {
      type: String,
      value: '',
    },
  },

  /**
   * Component initial data
   */
  data: {
    showModal: false,
    selectedItem: null,
  },

  pageLifetimes: {
    show() {
      // Refresh data
      if (this.data.games) {
        this.fetchAllGames()
      }
    },
  },

  lifetimes: {
    attached() {
      this.fetchGames(this.data.symbol)
      if (app.globalData.showingGameId) {
        this.setData({
          gameId: app.globalData.showingGameId,
        })
      }
      console.log('gameList', this.data.gameId)
    },
  },

  /**
   * Component methods
   */
  methods: {
    handleAvatarClick(e) {
      navigateToProfile(e.currentTarget.dataset.id)
    },

    showModal(e) {
      const gameId = e.currentTarget.dataset.id
      app.globalData.showingGameId = gameId
      this.setData({
        modalName: e.currentTarget.dataset.target,
        selectedItem: gameId,
        gameId,
      })
    },

    hideModal(e) {
      app.globalData.showingGameId = ''
      this.setData({
        modalName: null,
        selectedItem: '',
        gameId: '',
      })
      this.fetchAllGames()
    },

    fetchAllGames() {
      const preProcessGames = (data) => {
        for (const game of data) {
          game.dayOfWeek = getDateString(game.startDate)
          game.startDateStr = formatDate(game.startDate)
          game.endDateStr = formatDate(game.endDate)
        }
      }

      async function fetchAllGames() {
        let count = await db.collection('games').count()
        count = count.total

        let allGames = []
        for (let i = 0; i < count; i += 20) {
          let games = await db.collection('games').orderBy('endDate', 'desc').skip(i).get()
          allGames = allGames.concat(games.data)
        }
        console.log('🚀 ~ file: gamelist.js:101 ~ fetchAllGames ~ allGames:', allGames)

        return allGames
      }

      fetchAllGames().then((games) => {
        const nowTimestamp = Date.now()
        for (const game of games) {
          const startDateTimestamp = game.startDate
          game.isUpcoming = startDateTimestamp - nowTimestamp > 0 && startDateTimestamp - nowTimestamp <= START_TIME_REMAINING
        }
        preProcessGames(games)

        this.setData({
          games,
        })
      })
    },

    fetchGames(symbol) {
      switch (symbol) {
        case 'allGames':
          this.fetchAllGames()
          break
        case 'hostedGames':
          fetchHostedGames(wx.getStorageSync('userInfo')._openid).then((games) => {
            const nowTimestamp = Date.now()

            for (const game of games) {
              game.dayOfWeek = getDateString(game.startDate)
              game.startDateStr = formatDate(game.startDate)
              game.endDateStr = formatDate(game.endDate)

              const startDateTimestamp = parseFormattedDate(game.startDateStr)
              game.isUpcoming = startDateTimestamp - nowTimestamp > 0 && startDateTimestamp - nowTimestamp <= START_TIME_REMAINING
            }

            this.setData({
              games,
            })
          })
          break
        case 'joinedGames':
          fetchAllUserGames(wx.getStorageSync('userInfo')._id).then((games) => {
            const nowTimestamp = Date.now()

            for (const game of games) {
              game.dayOfWeek = getDateString(game.startDate)
              game.startDateStr = formatDate(game.startDate)
              game.endDateStr = formatDate(game.endDate)

              const startDateTimestamp = parseFormattedDate(game.startDateStr)
              game.isUpcoming = startDateTimestamp - nowTimestamp > 0 && startDateTimestamp - nowTimestamp <= START_TIME_REMAINING
            }

            this.setData({
              games,
            })
          })
          break
        default:
          break
      }
    },
  },
})
