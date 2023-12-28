import { cancelGame, fetchGame, joinGame } from "../../api/game";
import { fetchUserInfo, fetchUserInfoOrSignup, addActiveTimestamp, deleteActiveTimestamp} from "../../api/user";
import { navigateToProfile } from "../../navigator";
import { newMembersJoin, activityWillStart } from "../../api/notification";

const HANDLE_CLICK_DURATION = 500;

Component({
  properties: {
    gameId: String,
  },
  observers: {
    gameId: function (newGameId) {
      if (newGameId) {
        this.loadGameInfo(newGameId);
      }
    },
  },

  data: {
    isJoined: false,
    isOrganizer: false,
    isHandlingClick: false,
  },

  lifetimes: {
    attached() {
      this.loadGameInfo(this.data.gameId);
    },
  },

  methods: {
    handleAvatarClick(e) {
      navigateToProfile(e.currentTarget.dataset.id);
    },

    async loadGameInfo(id) {
      this.setData({
        isLoadingUserInfo: true,
        isLoading: true,
      });

      try {
        const [game, userInfo] = await Promise.all([fetchGame(id), fetchUserInfo()]);
        let isJoined = false;
        let isOrganizer = false;

        if (userInfo) {
          this.setData({
            userInfo,
          });

          if (game.participants) {
            console.log(game.participants);
            for (const participant of game.participants) {
              if (participant._openid === userInfo._openid) {
                isJoined = true;
                break;
              }
            }
            isOrganizer = game.participants[0]._openid === userInfo._openid;
          }
        }

        this.setData({
          isJoined,
          isOrganizer,
          isLoadingUserInfo: false,
          game,
          isLoading: false,
        });
        return game;
      } catch (error) {
        console.log("Error loading game info:", error);
      }
    },

    handleCancel() {
      if (this.data.isHandlingClick) {
        return;
      }

      this.setData({
        isHandlingClick: true,
      });

      const { game } = this.data;

      cancelGame(game._id)
        .then(() => {
          this.loadGameInfo(game._id);
          deleteActiveTimestamp(game.endDate, wx.getStorageSync("userInfo")._id)
        })
        .catch((error) => {
          console.error("Error:", error);
        })
        .finally(() => {
          this.setData({
            isHandlingClick: false,
          });
        });
    },

    handleJoin() {
      if (this.data.isHandlingClick) {
        return;
      }

      this.setData({
        isHandlingClick: true,
      });

      const { game, userInfo } = this.data;

      if (!userInfo) {
        fetchUserInfoOrSignup();
        return;
      }

      if (game.participants.length >= game.maxParticipantCount) {
        wx.showToast({
          icon: "none",
          title: "参与人数已满",
        });
        return;
      }

      if (userInfo.level < game.level) {
        wx.showToast({
          icon: "none",
          title: "网球等级不符合要求",
        });
        return;
      }

      wx.requestSubscribeMessage({
        tmplIds: ['_UL0DwU6KerGVSWaJBi61Vu4KGsmZhejdLBV7Isso7o']
      })

      joinGame(game._id, userInfo)
        .then(() => {
          game.participant_nickname = wx.getStorageSync('userInfo').nickname
          console.log(game);
          const res = newMembersJoin("newMembersJoin", game);
          console.log(res);
          this.loadGameInfo(game._id);
          addActiveTimestamp(game.endDate, wx.getStorageSync("userInfo")._id);
        })
        .catch((error) => {
          console.log("Error:", error);
        })
        .finally(() => {
          setTimeout(() => {
            this.setData({
              isHandlingClick: false,
            });
          }, HANDLE_CLICK_DURATION);
        });
    },

    handleEdit() {
      wx.navigateTo({
        url: `../postGame/postGame?flag=true&_id=${this.data.gameId}`,
      });
    },

    showModal(e) {
      this.setData({
        modalName: e.currentTarget.dataset.target,
      });
    },

    hideModal(e) {
      this.setData({
        modalName: null,
      });
    },
  },
});
