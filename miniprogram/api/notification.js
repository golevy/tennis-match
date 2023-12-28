const CLOUD_FUNCTION = "subscriptionNotifications";

export const newMembersJoin = (action, data) => {
  console.log("行为：", action, "发起者的openid：", data);
  return wx.cloud.callFunction({
    name: CLOUD_FUNCTION,
    data: {
      action,
      data
    }, 
  });
};

export const activityWillStart = (action, {openid, game_id}) => {
  return wx.cloud.callFunction({
    name: CLOUD_FUNCTION,
    data: {
      action,
      data: {
        openid,
        game_id
      }
    },
  });
}

export const newMessagesSend = (action, data) => {
  return wx.cloud.callFunction({
    name: CLOUD_FUNCTION,
    data: {
      action,
      data,
    },
  }); 
};
