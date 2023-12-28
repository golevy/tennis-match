import { navigateToPostGame, navigateToExploreDetail } from "../../navigator"
import { matchUsers } from "../../api/match"

const app = getApp();
const TIMESTAMP = 1000 * 60 * 60 * 24;
const TEN_DAYS = 1000 * 60 * 60 * 24 * 10;
const PAGE_SIZE = 10;

Component({
  options: {
    addGlobalClass: true,
  },

  properties: {},

  data: {
    handleDelay: false,
    currentPage: 1,
    matchedUsers: [],
    loading: false,
    noMoreData: false,
    hasRequestedAuth: false,
    isLocationAuthenticated: true,
  },

  lifetimes: {
    attached() {
      this.handleDelay()
      this.checkLocationAuthorization()
      const dateStr = Date.now()
      if (!wx.getStorageSync("filteredUsers")) {
        wx.setStorageSync("filteredUsers", [])
      } else {
        const filteredUsers = wx.getStorageSync("filteredUsers").filter((item) => (dateStr - item.filterTimestamp) / TIMESTAMP <= 3)
        wx.setStorageSync("filteredUsers", filteredUsers)
      }
    },
  },

  pageLifetimes: {
    show() {
      this.checkLocationAuthorization()
    },
  },

  methods: {
    handleLocationAuth() {
      if (this.data.hasRequestedAuth) {
        wx.openSetting({
          success: (res) => {
            if (res.authSetting["scope.userLocation"] || res.authSetting["scope.userFuzzyLocation"]) {
              this.setData({ hasRequestedAuth: false })
              this.getLocationAndFetchUsers()
            }
          },
        })
      } else {
        this.requestLocationAuth()
      }
    },

    requestLocationAuth() {
      const that = this
      wx.authorize({
        scope: "scope.userFuzzyLocation",
        success() {
          that.getLocationAndFetchUsers()
        },
        fail() {
          that.setData({ hasRequestedAuth: true })
        },
      })
    },

    checkLocationAuthorization: function () {
      const that = this
      wx.getSetting({
        success(res) {
          if (res.authSetting["scope.userLocation"] || res.authSetting["scope.userFuzzyLocation"]) {
            that.setData({ isLocationAuthenticated: true })
            that.getLocationAndFetchUsers()
          } else {
            that.setData({
              isLocationAuthenticated: false,
            })
          }
        },
      })
    },

    disableMatchFunction() {
      this.setData({
        isLocationAuthenticated: false,
      })
    },

    getLocationAndFetchUsers: function () {
      const that = this
      wx.getFuzzyLocation({
        type: "wgs84",
        success(res) {
          const latitude = res.latitude
          const longitude = res.longitude
          app.globalData.latitude = latitude
          app.globalData.longitude = longitude
          that.setData({
            isLocationAuthenticated: true,
          })
          that.getMatchedUsers()
        },
        fail() {
          console.log("Cannot get location")
        },
      })
    },

    postGame() {
      navigateToPostGame();
    },

    handleViewInfo(e) {
      const info = JSON.stringify(this.data.matchedUsers[e.currentTarget.dataset.index]);
      navigateToExploreDetail(info);
    },

    handleDelay() {
      this.setData({
        handleDelay: true,
      });
    },

    getMatchedUsers() {
      matchUsers({
        userId: app.userInfo._id,
        filteredUsers: wx.getStorageSync("filteredUsers") || [],
        latitude: app.globalData.latitude,
        longitude: app.globalData.longitude,
        level: app.userInfo.level,
        weekendAvailability: app.userInfo.weekendAvailability,
        workdayAvailability: app.userInfo.workdayAvailability,
        availableWeekend: app.userInfo.availableWeekend,
        availableWorkday: app.userInfo.availableWorkday,
        page: this.data.currentPage,
        pageSize: PAGE_SIZE,
      })
        .then((res) => {
          const nowTimestamp = Date.now();

          const matchedUsers = res.result.matchedUsers.map((user) => {
            const modifiedUser = { ...user };
            if (modifiedUser.activeTimestamps && modifiedUser.activeTimestamps.length > 0) {
              const lastTimestamp = modifiedUser.activeTimestamps[modifiedUser.activeTimestamps.length - 1];
              modifiedUser.isWithinTenDays = nowTimestamp - lastTimestamp <= TEN_DAYS;
            } else {
              modifiedUser.isWithinTenDays = false;
            }
            modifiedUser.formattedDistance = modifiedUser.distance !== "距离未知" ? `${modifiedUser.distance}km` : modifiedUser.distance
            return modifiedUser
          })

          const updatedUsers = [...this.data.matchedUsers, ...matchedUsers];

          this.setData({
            matchedUsers: updatedUsers,
            loading: false,
            noMoreData: matchedUsers.length < PAGE_SIZE,
          });

          console.log(updatedUsers);
        })
        .catch((error) => {
          console.error("Failed to fetch matched users:", error)
        })
    },

    loadMore() {
      if (!this.data.allDataLoaded && !this.data.noMoreData) {
        this.setData({
          currentPage: this.data.currentPage + 1,
        });
        this.getMatchedUsers();
      }
    },
  },
});
