import { getMessageList } from "../../api/message";
import { fetchUserProfile } from "../../api/user";
import { navigateToChat } from "../../navigator";

const app = getApp();

Component({
  properties: {},

  data: {
    messageList: [],
    prevTimestamp: null,
  },

  lifetimes: {
    attached(options) {
      this.checkNewMessages();
    },
  },

  pageLifetimes: {
    show() {
      this.checkNewMessages();
    },
  },

  methods: {
    checkNewMessages: async function () {
      const _id = app.userInfo._id;
      const res = await getMessageList(_id);
      const currentDate = new Date();
      const lastViewedTimestamps = wx.getStorageSync("lastViewedTimestamps") || {};

      const transformedMessageList = await Promise.all(
        res.map(async (item) => {
          const transformSendTime = (sendTime) => {
            const date = new Date(sendTime);

            if (date.toDateString() === currentDate.toDateString()) {
              const hours = date.getHours().toString().padStart(2, "0");
              const minutes = date.getMinutes().toString().padStart(2, "0");
              return `${hours}:${minutes}`;
            } else {
              const month = (date.getMonth() + 1).toString().padStart(2, "0");
              const day = date.getDate().toString().padStart(2, "0");
              const year = date.getFullYear();
              return `${month}/${day}/${year}`;
            }
          };

          item.messages.forEach((msg) => {
            msg.time = transformSendTime(msg.sendTime);
          });

          const userId = item.relationship.filter((id) => id !== _id)[0];
          console.log("🚀 ~ file: message.js:56 ~ res.map ~ userId:", userId)
          
          const userInfo = await fetchUserProfile(userId);

          if (userInfo) {
            Object.assign(item, {
              avatar: userInfo.avatarUrl,
              nickname: userInfo.nickname,
              userId: userId,
            });
          }

          const lastViewedTimestamp = lastViewedTimestamps[item.userId] || 0;

          if (item.messages[0].senderId === _id || item.messages[0].sendTime <= lastViewedTimestamp) {
            item.isNewMessages = false;
          } else {
            item.isNewMessages = true;
          }

          return item;
        })
      );
      transformedMessageList.sort((a, b) => b.messages[0].sendTime - a.messages[0].sendTime);

      // Set data with previous content and timestamp
      if (transformedMessageList.length && transformedMessageList[0].messages.length) {
        this.setData({
          messageList: transformedMessageList,
          prevTimestamp: transformedMessageList[0].messages[0].sendTime,
        });
      } else {
        this.setData({
          messageList: transformedMessageList,
        });
      }
    },

    navigateToChatPage: function (e) {
      const id = e.currentTarget.dataset.id;
      navigateToChat(id);

      // Update the isNewMessages to false for the specific item
      let updatedMessageList = this.data.messageList.map((item) => {
        if (item.userId === id) {
          item.isNewMessages = false;

          // Update the last viewed message timestamp for the specific user
          let lastViewedTimestamps = wx.getStorageSync("lastViewedTimestamps") || {};
          lastViewedTimestamps[id] = item.messages[0].sendTime;
          wx.setStorageSync("lastViewedTimestamps", lastViewedTimestamps);
        }
        return item;
      });

      this.setData({ messageList: updatedMessageList });
    },
  },
});
