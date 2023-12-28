import { fetchUserInfo } from "../../api/user";

const app = getApp();
Component({
  options: {
    addGlobalClass: true,
  },
  /**
   * Component properties
   */
  properties: {
    gameId: {
      type: String,
      value: "",
    },
  },

  /**
   * Component initial data
   */
  data: {},

  lifetimes: {
    attached() {
      fetchUserInfo().then((userInfo) => {
        if (userInfo) {
          this.setData({
            userInfo,
          });
        }
      });

      if (!app.globalData.showingGameId) {
        this.setData({
          gameId: "",
        });
      }
    },

    detached() {
      this.setData({
        gameId: "",
      });
    },
  },

  /**
   * Component methods
   */
  methods: {},
});
