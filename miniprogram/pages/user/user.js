// pages/user/user.js
Component({
  options: {
    addGlobalClass: true,
  },
  /**
   * Component properties
   */
  properties: {},

  /**
   * Component initial data
   */
  data: {},

  lifetime: {
    attached() {
      fetchUserInfo().then((userInfo) => {
        if (userInfo) {
          this.setData({
            userInfo,
          });
        }
      });
    },
  },

  /**
   * Component methods
   */
  methods: {},
});
